import {
  addClass, assert, BlockContentElement, BlockElement, BlockPosition,
  ComplexBlockPosition, ComplexKindBlock, ContainerElement, BlockPath,
  createComplexBlockPosition, DocBlock, EditorComplexSelectionRange,
  getChildBlockCount,
  getContainerId, getLogger, isContainer, MoveDirection, NextContainerOptions,
  NextEditor, removeClass, SelectionRange, SimpleBlockPosition,
} from '@nexteditorjs/nexteditor-core';
import { convertToList } from './convert-to-list';
import { createListBlockContent, getListChildContainer, getListChildContainers, getTextContainer } from './list-dom';

import './list-block.scss';
import ListBlockInputHandler from './input-events/input-handler';
import { getListMarker } from './list-marker';
import ListBlockDocCallbacks from './doc-events/doc-events';
import ListBlockMarkerCallbacks from './marker/marker-event';

const logger = getLogger('list-block');

function createBlockContent(editor: NextEditor, path: BlockPath, container: ContainerElement, blockIndex: number, blockElement: BlockElement, blockData: DocBlock): BlockContentElement {
  ListBlockInputHandler.init(editor);
  ListBlockDocCallbacks.init(editor);
  ListBlockMarkerCallbacks.init(editor);
  return createListBlockContent(editor, path, blockElement, blockData, getListMarker(editor, path, container, blockIndex));
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
  if (getChildBlockCount(container) > 1) {
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
    assert(logger, to.isSimple(), 'from is simple position but to is not simple position');
    //
    logger.debug('full select list');
    addClass(block, 'full-selected');
    //
    return;
  }
  //
  assert(logger, !to.isSimple(), 'from is complex position but end is simple position');
  //
  const f = from as ComplexBlockPosition;
  const t = to as ComplexBlockPosition;
  assert(logger, f.blockId === t.blockId, 'only allow update one table selection');
  //
  const containers = getListChildContainers(block);
  containers.forEach((container) => {
    const containerId = getContainerId(container);
    if (containerId === f.childContainerId || containerId === t.childContainerId) {
      addClass(container, 'selected');
    }
  });
}

function clearSelection(editor: NextEditor): void {
  editor.rootContainer.querySelectorAll('[data-type="editor-block"][data-block-type="list"]').forEach((block) => {
    removeClass(block, 'full-selected');
    //
    block.querySelectorAll('div[data-type=editor-container].child.selected').forEach((c) => {
      removeClass(c, 'selected');
    });
    //
  });
}

function getChildContainers(complexBlock: BlockElement): ContainerElement[] {
  return getListChildContainers(complexBlock);
}

function getNextContainer(complexBlock: BlockElement, childContainer: ContainerElement, type: MoveDirection, options?: NextContainerOptions): ContainerElement | null {
  if (type === 'ArrowDown' || type === 'ArrowRight') {
    if (childContainer === getTextContainer(complexBlock)) {
      return getListChildContainer(complexBlock);
    }
  } else if (childContainer === getListChildContainer(complexBlock)) {
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
  assert(logger, startIndex !== -1, 'invalid start pos');
  assert(logger, endIndex !== -1, 'invalid end pos');
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
  getSelectedContainers,
  convertFrom: convertToList,
};

export default ListBlock;
