import express, { Request, Response, NextFunction, Router } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { Server } from 'http';

import * as logger from './logger';
import {
  AppOptions,
  LambdaOptions,
  LambdaServer,
  APIGatewayProxyHandler,
} from './types';
import { findPort } from './findPort';
import { createContext } from './context';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { promisify } from 'util';

require('dotenv').config();

// eslint-disable-next-line typescript/no-explicit-any
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
      path: req.originalUrl,
      httpMethod: req.method,
      queryStringParameters: req.query,
      requestContext,
      pathParameters: req.params,
      // @ts-ignore
      headers: { ...req.headers, ...(options.mockHeaders || {}) },
      body: JSON.stringify(req.body),
    };

    try {
      const timerKey = `request-${req.method}-${req.originalUrl}-${Math.floor(
        Math.random() * 1000
      )}`;
      if (options.enableTimers) {
        // eslint-disable-next-line no-console
        console.time(timerKey);
      }
      const response = await lambda(event, context);
      if (options.enableTimers) {
        // eslint-disable-next-line no-console
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
  app.use(bodyParser.json());
  app.use(cors());

  app.use((req: Request, res: Response, next: NextFunction) => {
    Object.keys(require.cache)
      .filter(id =>
        options.cacheNodeModules ? !/node_modules/.test(id) : true
      )
      .forEach(function(id) {
        delete require.cache[id];
      });
    options.onCacheCleared && options.onCacheCleared();
    next();
  });

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
  function listen(port?: number | undefined) {
    return new Promise<number>(async (resolve, reject) => {
      const portToUse = await findPort(port);
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
