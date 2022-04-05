import {
  assert, BlockElement, getParentBlock, getParentContainer, isFirstChildBlock,
  isRootContainer, NextEditor,
} from '@nexteditorjs/nexteditor-core';
import { isListBlock } from './list-dom';

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
  if (isListBlock(parentBlock)) {
    return {
      listBlock: parentBlock,
      adjustedBlock: block,
    };
  }
  //
  if (!isFirstChildBlock(editor, parentBlock)) {
    return null;
  }
  //
  return findParentListChildContainer(editor, parentBlock);
}
