import path from 'path';
import got from 'got';

import { listen } from './utils';
import { createLambdaApp } from '..';
import * as logger from '../logger';

jest.mock('../logger.ts');

let app;
let url: string;
let close: () => void;
beforeAll(async () => {
  app = createLambdaApp({
    path: path.resolve(__dirname, '../../example/src/'),
    lambdas: [
      {
        entry: 'iceCreams',
        contextPath: '/ice-creams',
        urls: ['/:id/edit'],
      },
      {
        entry: 'error',
        contextPath: '/error',
      },
      {
        entry: 'callback',
        contextPath: '/callback',
      },
      { entry: 'index' },
    ],
  });
  const listener = await listen(app);
  url = listener.url;
  close = listener.close;
});

beforeEach(() => {
  // @ts-ignore
  logger.error.mockClear();
  // @ts-ignore
  logger.info.mockClear();
  // @ts-ignore
  logger.log.mockClear();
});

afterAll(() => {
  close && close();
});

test('GET /', async () => {
  const response = await got(url, { json: true });

  expect(response.body).toEqual({ name: 'index', path: '/' });
  expect(logger.info).toHaveBeenCalledWith('GET / - 200');
});

test('GET /callback', async () => {
  const response = await got(`${url}/callback`, { json: true });

  expect(response.body).toEqual({ name: 'callback', path: '/callback' });
  expect(logger.info).toHaveBeenCalledWith('GET /callback - 200');
});

test('GET /ice-creams/:id/edit', async () => {
  const response = await got(`${url}/ice-creams/42/edit`, { json: true });

  expect(response.body).toEqual({
    id: '42',
    name: 'iceCreams',
    path: '/ice-creams/42/edit',
  });
});

test('GET /error', async () => {
  let catched = false;
  try {
    await got(`${url}/error`, { json: true });
  } catch (error) {
    catched = true;
    expect(error.response.statusCode).toEqual(500);
    expect(error.response.body).toEqual({
      error: { message: 'All the errors! 🔥' },
    });
    // @ts-ignore
    expect(logger.error.mock.calls[0][0]).toEqual('GET /error - 500');
    // @ts-ignore
    expect(logger.error.mock.calls[0][1].message).toEqual('All the errors! 🔥');
  }
  expect(catched).toEqual(true);
});
