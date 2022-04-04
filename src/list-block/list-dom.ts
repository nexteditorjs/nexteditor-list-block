import {
  assert, BlockContentElement, BlockElement, ContainerElement,
  createBlockContentElement, createElement, DocBlock,
  getBlockContent, getBlockType, getParentBlock, getParentContainer, isChildContainer, NextEditor,
} from '@nexteditorjs/nexteditor-core';

export function isListBlock(block: BlockElement) {
  return getBlockType(block) === 'list';
}

export function createListBlockContent(editor: NextEditor, container: ContainerElement, blockIndex: number, blockElement: BlockElement, blockData: DocBlock): BlockContentElement {
  const children = blockData.children;
  assert(children, 'list no children');
  assert(children.length === 1 || children.length === 2, 'invalid list children');
  const blockContent = createBlockContentElement(blockElement, 'div');
  const listRoot = createElement('div', ['editor-list-root'], blockContent);
  const marker = createElement('div', ['list-marker'], listRoot);
  marker.innerText = '[]';
  const textRoot = createElement('div', ['list-text-root'], listRoot);
  editor.createChildContainer(textRoot, children[0]);
  if (children.length === 2) {
    const childRoot = createElement('div', ['list-child-root'], listRoot);
    editor.createChildContainer(childRoot, children[1]);
  }
  return blockContent as BlockContentElement;
}

export function getTextContainer(listBlock: BlockElement): ContainerElement {
  assert(isListBlock(listBlock), 'not a list block');
  const content = getBlockContent(listBlock);
  const textContainer = content.querySelector(':scope > div.editor-list-root > div.list-text-root [data-type=editor-container].child') as ContainerElement;
  assert(textContainer, 'no list text container');
  return textContainer as ContainerElement;
}

export function getChildContainer(listBlock: BlockElement): ContainerElement | null {
  assert(isListBlock(listBlock), 'not a list block');
  const content = getBlockContent(listBlock);
  const textContainer = content.querySelector(':scope > div.editor-list-root > div.list-child-root [data-type=editor-container].child') as ContainerElement;
  if (!textContainer) return null;
  return textContainer as ContainerElement;
}

export function getListChildContainers(listBlock: BlockElement): ContainerElement[] {
  assert(isListBlock(listBlock), 'not a list block');
  const ret = [getTextContainer(listBlock)];
  const child = getChildContainer(listBlock);
  if (child) {
    ret.push(child);
  }
  return ret;
}

export function isListTextBlock(block: BlockElement) {
  if (getBlockType(block) !== 'text') {
    return false;
  }
  const container = getParentContainer(block);
  if (!isChildContainer(container)) {
    return false;
  }
  //
  const parentBlock = getParentBlock(container);
  assert(parentBlock, 'no parent block');
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
