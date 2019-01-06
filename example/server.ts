/* eslint-disable no-console */
import path from 'path';

import { createLambdaApp } from '../src';

const app = createLambdaApp({
  path: path.resolve(__dirname),
  lambdas: [
    {
      entry: './src/iceCreams',
      contextPath: '/ice-creams',
      urls: ['/:id/edit'],
    },
    {
      entry: './src/error',
      contextPath: '/error',
    },
    {
      entry: './src/500-response',
      contextPath: '/500',
    },
    {
      entry: './src/counter',
      contextPath: '/c',
    },
    {
      entry: './src/headers',
      contextPath: '/headers',
      mockHeaders: { 'content-type': 'woot' },
    },
    { entry: './src/index' },
  ],
});

app.listen(8080).catch(error => {
  console.error(error);
  process.exit(1);
});
