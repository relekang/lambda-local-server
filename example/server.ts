import path from 'path';

import { createLambdaApp } from '../src';

const app = createLambdaApp({
  path: path.resolve(__dirname, 'src'),
  lambdas: [
    {
      entry: 'iceCreams',
      contextPath: '/ice-creams',
      urls: ['/:id/edit'],
      enableTimers: true,
    },
    {
      entry: 'error',
      contextPath: '/error',
    },
    {
      entry: '500-response',
      contextPath: '/500',
    },
    {
      entry: 'counter',
      contextPath: '/c',
    },
    {
      entry: 'headers',
      contextPath: '/headers',
      mockHeaders: { 'content-type': 'woot' },
    },
    { entry: 'callback', contextPath: '/callback' },
    { entry: 'index' },
  ],
});

app.listen(8080).catch(error => {
  console.error(error);
  process.exit(1);
});
