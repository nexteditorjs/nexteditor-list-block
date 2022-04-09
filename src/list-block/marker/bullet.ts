import { assert, createElement, getLogger } from '@nexteditorjs/nexteditor-core';

const logger = getLogger('list-bullets');

export function getBullet(level: number) {
  assert(logger, level >= 1, `invalid level, ${level}`);
  const bullets = '•◦▪';
  const index = (level - 1) % bullets.length;
  const text = bullets[index];
  return createElement('span', [`bullet${index}`], null, text);
}
