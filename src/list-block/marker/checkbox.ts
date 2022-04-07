import { createElement } from '@nexteditorjs/nexteditor-core';

export function createCheckedIcon() {
  const elem = createElement('span', ['material-icons-outlined'], null, 'check_box');
  return elem;
}

export function createUncheckedIcon() {
  const elem = createElement('span', ['material-icons-outlined'], null, 'check_box_outline_blank');
  return elem;
}
