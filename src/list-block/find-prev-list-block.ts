import {
  assert, BlockElement, getParentBlock, getParentContainer, getPrevBlock,
  isComplexKindBlock, isFirstChildBlock, NextEditor,
} from '@nexteditorjs/nexteditor-core';
import { isListBlock } from './list-dom';

export function findPrevListBlockCanBeInsert(editor: NextEditor, block: BlockElement): {
  listBlock: BlockElement,
  adjustedBlock: BlockElement,
} | null {
  const prevBlock = getPrevBlock(block);
  if (prevBlock) {
    if (isListBlock(prevBlock)) {
      return { listBlock: prevBlock, adjustedBlock: block };
    }
    return null;
  }
  //
  if (!isFirstChildBlock(editor, block)) {
    return null;
  }
  //
  const parentComplexBlock = getParentBlock(getParentContainer(block));
  assert(parentComplexBlock, 'no parent block');
  assert(isComplexKindBlock(editor, parentComplexBlock), 'not a complex block');
  //
  return findPrevListBlockCanBeInsert(editor, parentComplexBlock);
}
