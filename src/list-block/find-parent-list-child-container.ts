import {
  assert, BlockElement, getLogger, getParentBlock, getParentContainer, isFirstChildBlockInComplexBlock,
  isRootContainer, NextEditor,
} from '@nexteditorjs/nexteditor-core';
import { getListChildContainer, isListBlock } from './list-dom';

const logger = getLogger('find-parent-list-child-container');

export function findParentListChildContainer(editor: NextEditor, block: BlockElement): {
  listBlock: BlockElement;
  adjustedBlock: BlockElement;
} | null {
  //
  const parentContainer = getParentContainer(block);
  if (isRootContainer(parentContainer)) {
    return null;
  }
  //
  const parentBlock = getParentBlock(parentContainer);
  assert(logger, parentBlock, 'no parent block');
  if (isListBlock(parentBlock) && getListChildContainer(parentBlock) === parentContainer) {
    return {
      listBlock: parentBlock,
      adjustedBlock: block,
    };
  }
  //
  if (!isFirstChildBlockInComplexBlock(editor, block)) {
    return null;
  }
  //
  return findParentListChildContainer(editor, parentBlock);
}
