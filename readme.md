# lambda-local-server

> A server for running lambdas with hot reloading of the lambda code. 

## Installation

```shell
npm install --save-dev lambda-local-server
```

## Usage 

```js
import { createLambdaApp } from 'lambda-local-server';

const app = createLambdaApp({
  port: 8080,
  lambdas: [
    {
      entry: resolve('./src/users'),
      contextPath: '/users',
    },
    { entry: resolve('./src/index') },
  ],
});

app
  .listen()
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

### Exporting lambdas

The ways we will try to import the lambdas is the following.
* `module.exports` is a function.
* `export default` is a function.
* `export default` is a string refering to an exported value that is a function.

### Mapping request parameters

Parsing of request parameters is often handled by API Gateway when
using lambdas, thus when running locally we need to parse it in
order to pass it into the event object to the lambda. We utilise
express to do the parsing, in order to set it up you will need to
provide the urls option for the lambda. The example below will parse
out the user id from the urls `/users/42/edit` and `/users/42`

```js
const app = createLambdaApp({
  port: 8080,
  lambdas: [
    {
      entry: resolve('./src/users'),
      contextPath: '/users',
      urls: ['/:id/edit', '/:id']
    },
  ],
});

```

## API

### `createLambdaApp(options: Options)`

#### `Options`
 * `port: number` - the port to listen to
 * `lambdas: LambdaOptions[]` - list of the lambdas to use  
 * `path?: string` - The base path of all the lambdas. If this is not set the `entry` option in each lambda must be absolute or will be resolved from current working dir.  
 * `context?: APIGatewayEventRequestContext` - Context that will be merged with the lambda context and the request info. Priority order from most to least important is: request info, lambda context and app context.
 * `cognitoId?: | (() => string | Promise<string>) | string | undefined` - Resolve a cognito id that will be put into the context.
 * `cacheNodeModules?: boolean` - If set to true node modules will not be deleted from the require cache. Defaults to `false`
 * `onCacheCleared?: () => void` - Is called when we clear the require cache. If something needs to be mocked set it up here.
 * `watchCredentials: boolean` - If set to true the code will be reloaded on changes to `~/.aws/credentials` useful when using some MFA tool to log into aws often. When set to false it is necessary to restart the server to reload. The only thing read in the codebase is the filename, not the content of the credentials file.


#### `LambdaOptions`
* `entry: string` - The path to the entry
* `contextPath?: string` - The path in the url that should be mapped to this lambda.
* `urls?: string[]` - List of urls, used for parameter mapping. Supports what express supports for parameters. See "Mapping url paremeters" above.
* `mockHeaders?: { [key: string]: string }` - Object of strings with the headers that should be hard coded. Is useful for things like mocking authorization or other headers that the API Gateway populates.
 * `context?: APIGatewayEventRequestContext` - Context that will be merged with the app context and the request info. Priority order from most to least important is: request info, lambda context and app context.
 * `cognitoId?: | (() => string | Promise<string>) | string | undefined` - Resolve a cognito id that will be put into the context. This will have precedense over the one specied in the app config.
