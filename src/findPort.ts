import getPort from 'get-port';

export async function findPort(port: number | undefined) {
  return await getPort({
    port: [
      ...(port ? [port] : []),
      ...new Array(20).fill(null).map((_, i) => 3000 + i),
    ],
  });
}
