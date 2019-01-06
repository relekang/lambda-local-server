import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

export default function handler(event: APIGatewayEvent): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(
      {
        name: 'iceCreams',
        path: event.path,
        id: (event.pathParameters || {}).id,
      },
      null,
      2
    ),
  };
}
