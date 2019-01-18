import { APIGatewayEventRequestContext } from 'aws-lambda';
import { Request } from 'express';
import { LambdaOptions, AppOptions, CognitoIdResolver } from './types';

const contextDefault = {
  accountId: 'test',
  apiId: 'test',
  authorizer: undefined,
  identity: undefined,
  stage: 'test',
  requestId: 'test',
  resourceId: 'test',
  resourcePath: 'test',
};

async function resolveCognitoId(resolver: CognitoIdResolver) {
  if (typeof resolver === 'string') {
    return resolver;
  } else if (typeof resolver === 'function') {
    return resolver();
  }
  return undefined;
}

async function createIdentity(
  appCognitoId: CognitoIdResolver,
  lambdaCognitoId: CognitoIdResolver
) {
  let cognitoId;
  if (lambdaCognitoId) {
    cognitoId = await resolveCognitoId(lambdaCognitoId);
  } else if (appCognitoId) {
    cognitoId = await resolveCognitoId(appCognitoId);
  }

  return {
    accessKey: 'test',
    accountId: 'test',
    apiKey: 'test',
    apiKeyId: 'test',
    caller: 'test',
    cognitoAuthenticationProvider: `test:${cognitoId}`,
    cognitoAuthenticationType: 'test',
    cognitoIdentityId: 'test',
    cognitoIdentityPoolId: 'test',
    sourceIp: 'test',
    user: 'test',
    userAgent: 'test',
    userArn: 'test',
  };
}

export async function createContext(
  appOptions: AppOptions,
  lambdaOptions: LambdaOptions,
  req: Request
): Promise<APIGatewayEventRequestContext> {
  const appContext = appOptions.context || {};
  const lambdaContext = lambdaOptions.context || {};
  return {
    ...contextDefault,
    ...appContext,
    ...lambdaContext,
    path: req.path,
    requestTimeEpoch: Date.now(),
    httpMethod: req.method,
    identity: {
      ...appContext.identity,
      ...lambdaContext.identity,
      ...(await createIdentity(appOptions.cognitoId, lambdaOptions.cognitoId)),
    },
  };
}
