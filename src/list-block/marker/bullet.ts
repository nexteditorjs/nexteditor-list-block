import { assert, createElement } from '@nexteditorjs/nexteditor-core';

export function getBullet(level: number) {
  assert(level >= 1, `invalid level, ${level}`);
  const bullets = '•◦▪';
  const index = (level - 1) % bullets.length;
  const text = bullets[index];
  return createElement('span', [`bullet${index}`], null, text);
}
