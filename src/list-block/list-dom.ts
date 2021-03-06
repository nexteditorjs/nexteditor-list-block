import {
  addClass,
  assert, BlockContentElement, BlockElement, BlockPath, CloneBlockResultInfo, cloneDoc, ContainerElement,
  createBlockContentElement, createBlockSimpleRange, createElement, DocBlock,
  DocObject,
  genId,
  getBlockContent, getBlockType, getLogger, getParentBlock, getParentContainer, isChildContainer, NextEditor,
} from '@nexteditorjs/nexteditor-core';
import { ListData } from './list-data';
import { startToMarker } from './marker/start-to-marker';

const logger = getLogger('list-dom');

export function isListBlock(block: BlockElement) {
  return getBlockType(block) === 'list';
}

export function createListBlockContent(editor: NextEditor, path: BlockPath, blockElement: BlockElement, blockData: DocBlock, markerContent: string | Element): BlockContentElement {
  const listData = blockData as ListData;
  const children = blockData.children;
  assert(logger, children, 'list no children');
  assert(logger, children.length === 1 || children.length === 2, 'invalid list children');
  const blockContent = createBlockContentElement(blockElement, 'div');
  addClass(blockContent, listData.listType);
  if (listData.listType === 'checkbox' && listData.checked) {
    addClass(blockContent, 'checked');
  }
  //
  const listRoot = createElement('div', ['editor-list-root'], blockContent);
  const textRoot = createElement('div', ['list-text-root'], listRoot);
  const marker = createElement('div', ['list-marker'], textRoot);
  if (typeof markerContent === 'string') {
    marker.innerText = markerContent;
  } else {
    marker.appendChild(markerContent);
  }
  editor.createChildContainer(path, textRoot, children[0]);
  if (children.length === 2) {
    const childRoot = createElement('div', ['list-child-root'], listRoot);
    editor.createChildContainer(path, childRoot, children[1]);
  }
  //
  return blockContent as BlockContentElement;
}

export function updateListStart(block: BlockElement, level: number, start: number) {
  const marker = block.querySelector('div.list-marker') as HTMLDivElement;
  assert(logger, marker, 'no list marker');
  marker.innerText = startToMarker(level, start);
}

export function getTextContainer(listBlock: BlockElement): ContainerElement {
  assert(logger, isListBlock(listBlock), 'not a list block');
  const content = getBlockContent(listBlock);
  const textContainer = content.querySelector(':scope > div.editor-list-root > div.list-text-root [data-type=editor-container].child') as ContainerElement;
  assert(logger, textContainer, 'no list text container');
  return textContainer as ContainerElement;
}

export function getListChildContainer(listBlock: BlockElement): ContainerElement | null {
  assert(logger, isListBlock(listBlock), 'not a list block');
  const content = getBlockContent(listBlock);
  const textContainer = content.querySelector(':scope > div.editor-list-root > div.list-child-root [data-type=editor-container].child') as ContainerElement;
  if (!textContainer) return null;
  return textContainer as ContainerElement;
}

export function createListChildContainer(editor: NextEditor, listBlock: BlockElement, initDoc: DocObject, cloneDocResult?: CloneBlockResultInfo) {
  assert(logger, isListBlock(listBlock), 'not a list block');
  assert(logger, !getListChildContainer(listBlock), 'child container has already exists');
  //
  const doc = cloneDoc(editor, initDoc, cloneDocResult);
  //
  const newContainerId = genId();
  Object.entries(doc.blocks).forEach(([containerId, blocks]) => {
    if (containerId === 'root') {
      editor.doc.localInsertChildContainer(newContainerId, blocks);
      return;
    }
    editor.doc.localInsertChildContainer(containerId, blocks);
  });
  //
  const oldData = editor.getBlockData(listBlock);
  assert(logger, oldData.children, 'no list child');
  assert(logger, oldData.children.length === 1, 'invalid list children data');
  const newData = {
    ...oldData,
    children: [oldData.children[0], newContainerId],
  };
  //
  const newRange = createBlockSimpleRange(editor, doc.blocks.root[0].id, 0);
  editor.updateBlockData(listBlock, newData, newRange);
}

export function getListChildContainers(listBlock: BlockElement): ContainerElement[] {
  assert(logger, isListBlock(listBlock), 'not a list block');
  const ret = [getTextContainer(listBlock)];
  const child = getListChildContainer(listBlock);
  if (child) {
    ret.push(child);
  }
  return ret;
}

export function isListTextChildBlock(block: BlockElement) {
  const container = getParentContainer(block);
  if (!isChildContainer(container)) {
    return false;
  }
  //
  const parentBlock = getParentBlock(container);
  assert(logger, parentBlock, 'no parent block');
  if (!isListBlock(parentBlock)) {
    return false;
  }
  //
  return container === getTextContainer(parentBlock);
}

export function getParentListBlock(node: Node): BlockElement | null {
  const parentElement = node.parentElement;
  if (!parentElement) {
    return null;
  }
  //
  const list = parentElement.closest('div[data-type=editor-block].list-block');
  if (!list) {
    return null;
  }
  return list as BlockElement;
}
