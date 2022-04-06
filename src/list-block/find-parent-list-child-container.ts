import {
  assert, BlockElement, getParentBlock, getParentContainer, isFirstChildBlockInComplexBlock,
  isRootContainer, NextEditor,
} from '@nexteditorjs/nexteditor-core';
import { getListChildContainer, isListBlock } from './list-dom';

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
  assert(parentBlock, 'no parent block');
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
