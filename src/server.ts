import express, { Request, Response, NextFunction, Router } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { Server } from 'http';
import chokidar from 'chokidar';
import createDebugLogger from 'debug';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { promisify } from 'util';
import debounce from 'debounce';
import userHome from 'user-home';

import * as logger from './logger';
import {
  AppOptions,
  LambdaOptions,
  LambdaServer,
  APIGatewayProxyHandler,
} from './types';
import { findPort } from './findPort';
import { createContext } from './context';
import chalk from 'chalk';

require('dotenv').config();

const debug = createDebugLogger('lambda-local-server:server');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveLambdaFunction(module: any): APIGatewayProxyHandler {
  if (typeof module === 'function') {
    return module;
  } else if (typeof module.default === 'function') {
    return module.default;
  } else if (typeof module.default === 'string') {
    return module[module.default];
  } else if (typeof module.handler === 'function') {
    return module.handler;
  } else {
    throw new Error(
      'Could not import the lambda see https://github.com/relekang/lambda-local-server ' +
        'supported ways to export it.'
    );
  }
}

function createRouterForLambda(
  appOptions: AppOptions,
  options: LambdaOptions
): Router {
  const router = Router();
  const resolvedPath = appOptions.path
    ? path.resolve(appOptions.path, options.entry)
    : path.resolve(options.entry);
  async function handler(req: Request, res: Response) {
    let lambda = resolveLambdaFunction(require(resolvedPath));

    if (lambda.length === 3) {
      lambda = promisify(lambda);
    }

    const requestContext = await createContext(appOptions, options, req);

    // @ts-ignore
    const context: Context = { identity: requestContext.identity };
    const event: APIGatewayProxyEvent = {
      path: req.path,
      httpMethod: req.method,
      queryStringParameters: req.query,
      requestContext,
      pathParameters: req.params,
      // @ts-ignore
      headers: { ...req.headers, ...(options.mockHeaders || {}) },
      body: JSON.stringify(req.body),
    };

    if (event.headers.authorization) {
      event.headers.Authorization = event.headers.authorization;
      delete event.headers.authorization;
    }

    try {
      const timerKey = `request-${req.method}-${req.originalUrl}-${Math.floor(
        Math.random() * 1000
      )}`;
      if (options.enableTimers) {
        console.time(timerKey);
      }
      const response = await lambda(event, context);
      if (options.enableTimers) {
        console.timeEnd(timerKey);
      }
      if (response.statusCode === 500) {
        logger.error(
          `${event.httpMethod} ${event.path} - ${response.statusCode}`
        );
      } else {
        logger.info(
          `${event.httpMethod} ${event.path} - ${response.statusCode}`
        );
      }
      return res
        .status(response.statusCode)
        .set(response.headers)
        .send(response.body);
    } catch (error) {
      logger.error(`${event.httpMethod} ${event.path} - ${500}`, error);
      return res.status(500).json({
        error: { message: error.message, stacktrace: error.stacktrace },
      });
    }
  }

  [...(options.urls || []), '*'].forEach(url => {
    router.all(url, async (req: Request, res: Response, next: NextFunction) => {
      try {
        await handler(req, res);
      } catch (error) {
        next(error);
      }
    });
  });
  return router;
}

export function createLambdaApp(options: AppOptions): LambdaServer {
  if (process.env.NODE_ENV === 'production') {
    logger.warn(
      'It seems like you are running in production mode. ' +
        'Are you sure you want to run lambda-local-server in production? ' +
        'It is not made for that.'
    );
  }
  const app = express();
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(cors());

  function onFileChange(filename: string) {
    try {
      logger.log(`Detected changes to ${filename} reloading..`);
      Object.keys(require.cache)
        .filter(id =>
          options.cacheNodeModules ? !/node_modules/.test(id) : true
        )
        .forEach(function(id) {
          delete require.cache[id];
        });
      options.lambdas.forEach(lambda => {
        const resolvedPath = options.path
          ? path.resolve(options.path, lambda.entry)
          : path.resolve(lambda.entry);
        require(resolvedPath);
      });
      options.onCacheCleared && options.onCacheCleared();
    } catch (error) {
      console.error(chalk.red(error.stack ? error.stack : error));
    }
  }

  const projectWatcher = chokidar.watch('./**/*.{js,ts}', {
    cwd: options.path || './',
    persistent: true,
  });

  projectWatcher
    .on('all', function(event, path) {
      debug(`Filewatching event "${event} for ${path}"`);
    })
    .on('change', debounce(onFileChange, 200));

  if (options.watchCredentials) {
    const credentialsWatcher = chokidar.watch(
      path.join(userHome, '.aws', 'credentials'),
      {
        cwd: options.path || './',
        persistent: true,
      }
    );

    credentialsWatcher
      .on('all', function(event, path) {
        debug(`Filewatching event "${event} for ${path}"`);
      })
      .on('change', debounce(onFileChange, 200));
  }

  options.lambdas.forEach(lambda => {
    app.use(lambda.contextPath || '/', createRouterForLambda(options, lambda));
  });

  app.get('*', (req, res) => {
    logger.error(`${req.method} ${req.path} - ${404}`);
    res.status(404).json({
      lambdas: options.lambdas.map(lambda => ({
        entry: lambda.entry,
        url: `${req.protocol}://${req.headers.host}${lambda.contextPath}`,
      })),
    });
  });

  app.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
    logger.error(`${req.method} ${req.path} - ${500}`, error);
    res.status(500).json({ error });
  });

  let server: Server;
  async function listen(port?: number | undefined) {
    const portToUse = await findPort(port);
    return new Promise<number>((resolve, reject) => {
      server = app
        .listen(portToUse, (error: Error) => {
          if (error) {
            reject(error);
          } else {
            logger.info(`Server started at http://localhost:${portToUse}`);
            resolve(portToUse);
          }
        })
        .on('error', error => {
          // @ts-ignore
          if (error.code === 'EADDRINUSE') {
            logger.error(
              `The port ${portToUse} was in use trying with another port`
            );
            resolve(listen());
          } else {
            reject(error);
          }
        });
    });
  }

  function close() {
    server.close();
  }

  process.on('exit', (_code: number) => {
    close();
  });

  return { listen, close };
}
