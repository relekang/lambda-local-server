import {
  APIGatewayEvent,
  APIGatewayEventRequestContext,
  APIGatewayProxyCallback,
} from 'aws-lambda';

export default function handler(
  event: APIGatewayEvent,
  _context: APIGatewayEventRequestContext,
  callback: APIGatewayProxyCallback
) {
  callback(null, {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(
      {
        name: 'callback',
        path: event.path,
      },
      null,
      2
    ),
  });
}
