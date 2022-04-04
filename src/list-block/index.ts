import {
  addClass, assert, BlockContentElement, BlockElement, BlockPosition,
  ComplexBlockPosition, ComplexKindBlock, ContainerElement, createBlockContentElement,
  createComplexBlockPosition, createElement, DocBlock, EditorComplexSelectionRange,
  getContainerId, getLogger, isContainer, MoveDirection, NextContainerOptions,
  NextEditor, SelectionRange, selectionToDoc, SimpleBlockPosition,
} from '@nexteditorjs/nexteditor-core';
import { convertToList } from './convert-to-list';
import { getChildContainer, getListChildContainers, getTextContainer } from './list-dom';

import './list-block.scss';

const console = getLogger('list-block');

function createBlockContent(editor: NextEditor, container: ContainerElement, blockIndex: number, blockElement: BlockElement, blockData: DocBlock): BlockContentElement {
  const children = blockData.children;
  assert(children, 'list no children');
  assert(children.length === 1 || children.length === 2, 'invalid list children');
  const root = createBlockContentElement(blockElement, 'div');
  const list = createElement('div', ['editor-list-root'], root);
  const marker = createElement('div', ['list-marker'], list);
  marker.innerText = '[]';
  const textRoot = createElement('div', ['list-text-root'], list);
  editor.createChildContainer(textRoot, children[0]);
  if (children.length === 2) {
    const childRoot = createElement('div', ['editor-list-child'], root);
    editor.createChildContainer(childRoot, children[1]);
  }
  return root as BlockContentElement;
}

function getBlockTextLength(block: BlockElement): number {
  return 1;
}

function getRangeFromPoint(editor: NextEditor, block: BlockElement, x: number, y: number): SelectionRange | null {
  const elem = document.elementsFromPoint(x, y)[0];
  if (!elem) return null;
  //
  if (!block.contains(elem)) return null;
  if (!editor.contains(block)) return null;
  //
  if (!isContainer(elem)) return null;
  //
  const containers = getListChildContainers(block);
  if (!isContainer(elem)) {
    return null;
  }
  //
  const container = elem as ContainerElement;
  if (containers.indexOf(container) === -1) {
    return null;
  }
  //
  const startPos = createComplexBlockPosition(block, getContainerId(container));
  return new EditorComplexSelectionRange(editor, startPos);
}

function moveCaret(editor: NextEditor, block: BlockElement, position: SimpleBlockPosition, direction: MoveDirection): SimpleBlockPosition | null {
  return null;
}

function getCaretRect(block: BlockElement, pos: SimpleBlockPosition): DOMRect {
  return block.getBoundingClientRect();
}

function updateSelection(editor: NextEditor, block: BlockElement, from: BlockPosition, to: BlockPosition): void {
  if (from.isSimple()) {
    assert(to.isSimple(), 'from is simple position but to is not simple position');
    //
    console.debug('full select list');
    addClass(block, 'full-selected');
    //
    return;
  }
  //
  assert(!to.isSimple(), 'from is complex position but end is simple position');
  //
  const f = from as ComplexBlockPosition;
  const t = to as ComplexBlockPosition;
  assert(f.blockId === t.blockId, 'only allow update one table selection');
  //
  // const childContainers = getEditorSelectedContainers(editor, f, t);
  // childContainers.forEach((c) => {
  //   const cell = getContainerCell(c);
  //   addClass(cell, 'selected');
  // });
}

function clearSelection(editor: NextEditor): void {

}

function getChildContainers(complexBlock: BlockElement): ContainerElement[] {
  return getListChildContainers(complexBlock);
}

function getNextContainer(complexBlock: BlockElement, childContainer: ContainerElement, type: MoveDirection, options?: NextContainerOptions): ContainerElement | null {
  if (type === 'ArrowDown' || type === 'ArrowRight') {
    if (childContainer === getTextContainer(complexBlock)) {
      return getChildContainer(complexBlock);
    }
  } else if (childContainer === getChildContainer(complexBlock)) {
    return getTextContainer(complexBlock);
  }
  return null;
}

function getSelectedContainers(complexBlock: BlockElement, start: ComplexBlockPosition, end: ComplexBlockPosition): ContainerElement[] {
  const childContainers = getListChildContainers(complexBlock);
  const containersIds = childContainers.map(getContainerId);
  //
  const startIndex = containersIds.indexOf(start.childContainerId);
  const endIndex = containersIds.indexOf(end.childContainerId);
  assert(startIndex !== -1, 'invalid start pos');
  assert(endIndex !== -1, 'invalid end pos');
  //
  const ret = [childContainers[startIndex]];
  if (startIndex !== endIndex) {
    ret.push(childContainers[endIndex]);
  }
  return ret;
}

const ListBlock: ComplexKindBlock = {
  blockType: 'list',
  blockKind: 'complex',
  createBlockContent,
  getBlockTextLength,
  getRangeFromPoint,
  moveCaret,
  getCaretRect,
  updateSelection,
  clearSelection,
  getChildContainers,
  getNextContainer,
  // getMinWidth,
  getSelectedContainers,
  convertFrom: convertToList,
  // handleDeleteBlock,
  // getClientRects,
  selectionToDoc,
};

export { ListBlock };
