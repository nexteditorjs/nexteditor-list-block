import {
  assert, BlockContentElement, BlockElement, cloneDoc, ContainerElement,
  createBlockContentElement, createBlockSimpleRange, createElement, DocBlock,
  DocObject,
  genId,
  getBlockContent, getBlockType, getParentBlock, getParentContainer, isChildContainer, isContainer, isRootContainer, NextEditor,
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
  const textRoot = createElement('div', ['list-text-root'], listRoot);
  const marker = createElement('div', ['list-marker'], textRoot);
  marker.innerText = '[]';
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

export function getListChildContainer(listBlock: BlockElement): ContainerElement | null {
  assert(isListBlock(listBlock), 'not a list block');
  const content = getBlockContent(listBlock);
  const textContainer = content.querySelector(':scope > div.editor-list-root > div.list-child-root [data-type=editor-container].child') as ContainerElement;
  if (!textContainer) return null;
  return textContainer as ContainerElement;
}

export function createListChildContainer(editor: NextEditor, listBlock: BlockElement, initDoc: DocObject) {
  assert(isListBlock(listBlock), 'not a list block');
  assert(!getListChildContainer(listBlock), 'child container has already exists');
  //
  const doc = cloneDoc(editor, initDoc);
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
  assert(oldData.children, 'no list child');
  assert(oldData.children.length === 1, 'invalid list children data');
  const newData = {
    ...oldData,
    children: [oldData.children[0], newContainerId],
  };
  //
  const newRange = createBlockSimpleRange(editor, doc.blocks.root[0].id, 0);
  editor.updateBlockData(listBlock, newData, newRange);
}

export function getListChildContainers(listBlock: BlockElement): ContainerElement[] {
  assert(isListBlock(listBlock), 'not a list block');
  const ret = [getTextContainer(listBlock)];
  const child = getListChildContainer(listBlock);
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

export function isInListChild(block: BlockElement): boolean {
  const parentContainer = getParentContainer(block);
  if (isRootContainer(parentContainer)) {
    return false;
  }
  //
  const parentBlock = getParentBlock(parentContainer);
  assert(parentBlock, 'no parent block');
  //
  if (isListBlock(parentBlock)) {
    return true;
  }
  //
  if (isListTextBlock(block)) {
    const parentList = getParentListBlock(block);
    assert(parentList, 'no parent list');
    return isInListChild(parentList);
  }
  //
  return false;
}

export function getParentListBlockChildContainer(block: BlockElement): ContainerElement {
  assert(isInListChild(block), 'no in list block');
  const container = block.closest('div.list-child-root > div[data-type=editor-container]');
  assert(container, 'no parent list child container');
  assert(isContainer(container), 'not a container');
  return container as ContainerElement;
}
