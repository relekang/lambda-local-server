import express, { Request, Response, NextFunction, Router } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { Server } from 'http';

import * as logger from './logger';
import { AppOptions, LambdaOptions, LambdaServer } from './types';
import { findPort } from './findPort';
import { createContext } from './context';

require('dotenv').config();

function createRouterForLambda(
  appOptions: AppOptions,
  options: LambdaOptions
): Router {
  const router = Router();
  const resolvedPath = appOptions.path
    ? path.resolve(appOptions.path, options.entry)
    : path.resolve(options.entry);
  async function handler(req: Request, res: Response) {
    const lambda = require(resolvedPath);
    let fn;
    if (typeof lambda === 'function') {
      fn = lambda;
    } else if (typeof lambda.default === 'function') {
      fn = lambda.default;
    } else if (typeof lambda.default === 'string') {
      fn = lambda[lambda.default];
    } else {
      throw new Error(
        'Could not import the lambda see https://github.com/relekang/lambda-local-server ' +
          'supported ways to export it.'
      );
    }

    const event = {
      path: req.originalUrl,
      httpMethod: req.method,
      queryStringParameters: req.query,
      requestContext: createContext(appOptions, options, req),
      pathParameters: req.params,
      headers: { ...req.headers, ...(options.mockHeaders || {}) },
      body: JSON.stringify(req.body),
    };

    try {
      const response = await fn(event, null);
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
