import { Request } from 'express';

import { createContext } from '../context';
import { AppOptions, LambdaOptions } from '../types';

const DATE = new Date(2012, 12, 12).getTime();
beforeAll(() => {
  global.Date.now = jest.fn(() => DATE);
});
afterAll(() => {
  (global.Date.now as jest.Mock).mockRestore();
});

test('createContext should create context', async () => {
  const lambda: LambdaOptions = {
    entry: 'test',
  };
  const app: AppOptions = {
    lambdas: [lambda],
  };
  // @ts-ignore
  const req: Request = { path: '/', method: 'POST' };

  expect(await createContext(app, lambda, req)).toMatchSnapshot();
});

test('createContext should set cognito id from app options', async () => {
  const lambda: LambdaOptions = {
    entry: 'test',
  };
  const app: AppOptions = {
    lambdas: [lambda],
    cognitoId: 'cognito id from app',
  };
  // @ts-ignore
  const req: Request = { path: '/', method: 'POST' };

  const context = await createContext(app, lambda, req);

  expect(context.identity.cognitoAuthenticationProvider).toEqual(
    'test:cognito id from app'
  );
});

test('createContext should set cognito id from lambda options', async () => {
  const lambda: LambdaOptions = {
    entry: 'test',
    cognitoId: 'cognito id from lambda',
  };
  const app: AppOptions = {
    lambdas: [lambda],
    cognitoId: 'cognito id from app',
  };
  // @ts-ignore
  const req: Request = { path: '/', method: 'POST' };

  const context = await createContext(app, lambda, req);

  expect(context.identity.cognitoAuthenticationProvider).toEqual(
    'test:cognito id from lambda'
  );
});

test('createContext should set cognito id from function in app options', async () => {
  const lambda: LambdaOptions = {
    entry: 'test',
  };
  const app: AppOptions = {
    lambdas: [lambda],
    cognitoId: () => 'cognito id from app',
  };
  // @ts-ignore
  const req: Request = { path: '/', method: 'POST' };

  const context = await createContext(app, lambda, req);

  expect(context.identity.cognitoAuthenticationProvider).toEqual(
    'test:cognito id from app'
  );
});

test('createContext should set cognito id from function in lambda options', async () => {
  const lambda: LambdaOptions = {
    entry: 'test',
    cognitoId: () => 'cognito id from lambda',
  };
  const app: AppOptions = {
    lambdas: [lambda],
    cognitoId: () => 'cognito id from app',
  };
  // @ts-ignore
  const req: Request = { path: '/', method: 'POST' };

  const context = await createContext(app, lambda, req);

  expect(context.identity.cognitoAuthenticationProvider).toEqual(
    'test:cognito id from lambda'
  );
});
