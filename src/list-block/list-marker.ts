import { assert, ContainerElement, getContainerId, NextEditor } from '@nexteditorjs/nexteditor-core';
import { isSameListType, ListData } from './list-data';
import { updateListStart } from './list-dom';

export function getListStart(editor: NextEditor, container: ContainerElement, blockIndex: number) {
  const containerId = getContainerId(container);
  const currData = editor.doc.getBlockData(containerId, blockIndex) as ListData;
  if (currData.start !== undefined) {
    return currData.start;
  }
  //
  if (blockIndex === 0) {
    return 1;
  }
  //
  let count = 1;
  //
  let index = blockIndex - 1;
  while (index >= 0) {
    const prevData = editor.doc.getBlockData(containerId, index) as ListData;
    if (prevData.type !== 'list' || !isSameListType(prevData, currData)) {
      break;
    }
    if (prevData.start !== undefined) {
      return prevData.start + count;
    }
    //
    count++;
    index--;
  }
  //
  return count;
}

export function getListMarker(editor: NextEditor, container: ContainerElement, blockIndex: number): string | Element {
  const containerId = getContainerId(container);
  const currData = editor.doc.getBlockData(containerId, blockIndex) as ListData;
  if (currData.listType === 'unordered') {
    return '*';
  }
  if (currData.listType === 'checkbox') {
    return '[]';
  }
  //
  const start = getListStart(editor, container, blockIndex);
  return `${start}.`;
}

export function updateCurrentListMarkerFrom(editor: NextEditor, containerId: string, blockIndex: number) {
  //
  const blocks = editor.doc.getContainerBlocks(containerId);
  if (blockIndex >= blocks.length) {
    return;
  }
  //
  const blockData = blocks[blockIndex];
  if (blockData.type !== 'list') {
    return;
  }
  const listData = blockData as ListData;
  if (listData.listType !== 'ordered') {
    return;
  }
  //

  assert(listData.type === 'list', 'not a list block');
  assert(listData.listType === 'ordered', 'not an ordered list');
  const container = editor.getContainerById(containerId);
  //
  const start = getListStart(editor, container, blockIndex);
  for (let index = blockIndex; index < blocks.length; index++) {
    //
    const data = blocks[index] as ListData;
    if (data.type !== 'list' || !isSameListType(data, listData)) {
      return;
    }
    //
    const listStart = index === blockIndex ? start : start + (index - blockIndex);
    const block = editor.getBlockByIndex(containerId, index);
    updateListStart(block, listStart);
  }
}

export function updateAllListMarkerFrom(editor: NextEditor, containerId: string, fromBlockIndex: number) {
  //
  const blocks = editor.doc.getContainerBlocks(containerId);
  if (fromBlockIndex >= blocks.length) {
    return;
  }
  //
  const container = editor.getContainerById(containerId);
  //
  let start: number | undefined = getListStart(editor, container, fromBlockIndex);
  for (let blockIndex = fromBlockIndex; blockIndex < blocks.length; blockIndex++) {
    //
    const blockData = blocks[blockIndex] as ListData;
    if (blockData.type !== 'list' || blockData.listType !== 'ordered') {
      start = undefined;
      continue;
    }
    //
    if (start === undefined) {
      start = blockData.start ?? 1;
    }
    const block = editor.getBlockByIndex(containerId, blockIndex);
    updateListStart(block, start);
    start += 1;
  }
}