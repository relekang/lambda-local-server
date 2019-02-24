import chalk from 'chalk';
export function log(...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.log(...args);
}

export function info(...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.info(...args);
}

export function warn(...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.error(
    ...args.map(value => {
      if (typeof value === 'string') {
        return chalk`{yellow ${value}}`;
      }
      return value;
    })
  );
}

export function error(...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.error(
    ...args.map(value => {
      if (typeof value === 'string') {
        return chalk`{red ${value}}`;
      }
      return value;
    })
  );
}
