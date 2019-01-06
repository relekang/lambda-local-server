import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

export default function handler(
  _event: APIGatewayEvent
): APIGatewayProxyResult {
  throw new Error('All the errors! 🔥');
}
