import chalk from 'chalk';

export function log(...args: unknown[]) {
  console.log(...args);
}

export function info(...args: unknown[]) {
  console.info(...args);
}

export function warn(...args: unknown[]) {
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
  console.error(
    ...args.map(value => {
      if (typeof value === 'string') {
        return chalk`{red ${value}}`;
      }
      return value;
    })
  );
}
