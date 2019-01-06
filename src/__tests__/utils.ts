export async function listen(
  app: any
): Promise<{ url: string; close: () => void }> {
  const port = await app.listen();
  return { url: `http://localhost:${port}`, close: () => app.close() };
}
