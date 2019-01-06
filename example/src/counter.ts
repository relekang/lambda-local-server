import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

let counter = 0;

/*
 * This is supposed to always return { counter: 1 }.
 * Since all calls to a lambda should have a clean context.
 */
export default function handler(
  _event: APIGatewayEvent
): APIGatewayProxyResult {
  counter += 1;
  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(
      {
        name: 'counter',
        counter,
      },
      null,
      2
    ),
  };
}
