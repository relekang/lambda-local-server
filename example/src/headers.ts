import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

export default function handler(event: APIGatewayEvent): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(
      {
        name: 'headers',
        headers: event.headers,
      },
      null,
      2
    ),
  };
}
