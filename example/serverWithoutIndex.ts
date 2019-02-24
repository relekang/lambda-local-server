/* eslint-disable no-console */
import path from 'path';

import { createLambdaApp } from '../src';

const app = createLambdaApp({
  path: path.resolve(__dirname, 'src'),
  lambdas: [
    {
      entry: 'iceCreams',
      contextPath: '/ice-creams',
      urls: ['/:id/edit'],
    },
  ],
});

app.listen(8080).catch(error => {
  console.error(error);
  process.exit(1);
});
