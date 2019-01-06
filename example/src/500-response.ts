import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

export default function handler(event: APIGatewayEvent): APIGatewayProxyResult {
  return {
    statusCode: 500,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(
      {
        name: '500-response',
        path: event.path,
      },
      null,
      2
    ),
  };
}
