import { findPort } from '../findPort';

test('findPort should use port passed in', async () => {
  expect(await findPort(18080)).toEqual(18080);
});

test('findPort should find port in range when not passed', async () => {
  expect((await findPort(undefined)).toString()).toMatch(/^30\d{2}$/);
});
