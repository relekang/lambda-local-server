import { AuthResponseContext } from 'aws-lambda';

export type OptionalApiGatewayEventRequestContext = {
  accountId?: string;
  apiId?: string;
  authorizer?: AuthResponseContext | null;
  identity?: {
    accessKey: string | null;
    accountId: string | null;
    apiKey: string | null;
    apiKeyId: string | null;
    caller: string | null;
    cognitoAuthenticationProvider: string | null;
    cognitoAuthenticationType: string | null;
    cognitoIdentityId: string | null;
    cognitoIdentityPoolId: string | null;
    sourceIp: string;
    user: string | null;
    userAgent: string | null;
    userArn: string | null;
  };
  stage?: string;
  requestId?: string;
  resourceId?: string;
  resourcePath?: string;
};

export type LambdaOptions = {
  entry: string;
  contextPath?: string;
  urls?: string[];
  mockHeaders?: { [key: string]: string };
  context?: OptionalApiGatewayEventRequestContext;
};

export type AppOptions = {
  lambdas: LambdaOptions[];
  context?: OptionalApiGatewayEventRequestContext;
  path?: string;
  cacheNodeModules?: boolean;
};

export type LambdaServer = {
  listen: (port?: number) => Promise<number>;
  close: () => void;
};
