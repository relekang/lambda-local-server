# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [3.2.2](https://github.com/relekang/lambda-local-server/compare/v3.2.1...v3.2.2) (2020-05-13)


### Bug Fixes

* Prefix path with contextpath ([d2ee520](https://github.com/relekang/lambda-local-server/commit/d2ee520))
* Use path instead of originalUrl ([#6](https://github.com/relekang/lambda-local-server/issues/6)) ([c55c9b7](https://github.com/relekang/lambda-local-server/commit/c55c9b7))

### [3.2.1](https://github.com/relekang/lambda-local-server/compare/v3.2.0...v3.2.1) (2019-09-23)


### Bug Fixes

* Add catching of error on failed reloading ([4d231c6](https://github.com/relekang/lambda-local-server/commit/4d231c6))

## [3.2.0](https://github.com/relekang/lambda-local-server/compare/v3.1.0...v3.2.0) (2019-09-20)


### Features

* Add optional watching of aws credentials ([0e7527e](https://github.com/relekang/lambda-local-server/commit/0e7527e))

## [3.1.0](https://github.com/relekang/lambda-local-server/compare/v3.0.2...v3.1.0) (2019-08-29)


### Features

* Add debounce of 200ms when reloading files ([09df7a4](https://github.com/relekang/lambda-local-server/commit/09df7a4))

### [3.0.2](https://github.com/relekang/lambda-local-server/compare/v3.0.1...v3.0.2) (2019-08-28)


### Bug Fixes

* Upgrade dependencies ([76ab305](https://github.com/relekang/lambda-local-server/commit/76ab305))

<a name="3.0.1"></a>
## [3.0.1](https://github.com/relekang/lambda-local-server/compare/v3.0.0...v3.0.1) (2019-08-28)


### Bug Fixes

* Add higher limit on body length ([bbc0824](https://github.com/relekang/lambda-local-server/commit/bbc0824))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/relekang/lambda-local-server/compare/v2.3.1...v3.0.0) (2019-08-21)


### Features

* Add reloading of files when they are changed ([6f293f3](https://github.com/relekang/lambda-local-server/commit/6f293f3))


### BREAKING CHANGES

* This removes the reloading of the code on each request.



<a name="2.3.1"></a>
## [2.3.1](https://github.com/relekang/lambda-local-server/compare/v2.3.0...v2.3.1) (2019-07-03)


### Bug Fixes

* Make sure authorization header is with capital a ([a213f00](https://github.com/relekang/lambda-local-server/commit/a213f00))



<a name="2.3.0"></a>
# [2.3.0](https://github.com/relekang/lambda-local-server/compare/v2.2.0...v2.3.0) (2019-05-14)


### Features

* Add support for timing requests with console.time ([a7f354f](https://github.com/relekang/lambda-local-server/commit/a7f354f))



<a name="2.2.0"></a>
# [2.2.0](https://github.com/relekang/lambda-local-server/compare/v2.1.0...v2.2.0) (2019-02-24)


### Bug Fixes

* Add warning about production ([08e06fe](https://github.com/relekang/lambda-local-server/commit/08e06fe))


### Features

* Add fallback 404 response that lists lambdas ([75b706e](https://github.com/relekang/lambda-local-server/commit/75b706e))



<a name="2.1.0"></a>
# [2.1.0](https://github.com/relekang/lambda-local-server/compare/v2.0.0...v2.1.0) (2019-02-24)


### Features

* Add support for callback based handlers ([5ec4655](https://github.com/relekang/lambda-local-server/commit/5ec4655))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/relekang/lambda-local-server/compare/v1.2.0...v2.0.0) (2019-01-18)


### Bug Fixes

* Add support for lambda.handler ([6c977ae](https://github.com/relekang/lambda-local-server/commit/6c977ae))


### Features

* Add support for cognitoId in app and lambda config ([b0c1a0f](https://github.com/relekang/lambda-local-server/commit/b0c1a0f)), closes [#1](https://github.com/relekang/lambda-local-server/issues/1)


### BREAKING CHANGES

* This removes the environment variable COGNITO_ID, the
workaround is to put `cognitoId: process.env.COGNITO_ID` in app config.



<a name="1.2.0"></a>
# [1.2.0](https://github.com/relekang/lambda-local-server/compare/v1.1.0...v1.2.0) (2019-01-10)


### Features

* Add a hook to call after clearing require cache ([6e59efc](https://github.com/relekang/lambda-local-server/commit/6e59efc))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/relekang/lambda-local-server/compare/v1.0.2...v1.1.0) (2019-01-10)


### Features

* Make caching of node_modules optional ([fef08fd](https://github.com/relekang/lambda-local-server/commit/fef08fd))



<a name="1.0.2"></a>
## [1.0.2](https://github.com/relekang/lambda-local-server/compare/v1.0.1...v1.0.2) (2019-01-06)


### Bug Fixes

* Remove unecessary parsing of request body ([885e6b2](https://github.com/relekang/lambda-local-server/commit/885e6b2))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/relekang/lambda-local-server/compare/v1.0.0...v1.0.1) (2019-01-06)


### Bug Fixes

* Set correct main file in package.json ([286c426](https://github.com/relekang/lambda-local-server/commit/286c426))



<a name="1.0.0"></a>
# 1.0.0 (2019-01-06)


### Features

* Initial implementation ([cb89c73](https://github.com/relekang/lambda-local-server/commit/cb89c73))
