import { LambdaServer } from '../types';

export async function listen(
  app: LambdaServer,
  port?: number
): Promise<{ url: string; close: () => void }> {
  const portInUse = await app.listen(port);
  return { url: `http://localhost:${portInUse}`, close: () => app.close() };
}
