import {
  assert, BlockElement, getLogger, getParentBlock, getParentContainer, getPrevBlock,
  isComplexKindBlock, isFirstChildBlockInComplexBlock, NextEditor,
} from '@nexteditorjs/nexteditor-core';
import { isListBlock } from './list-dom';

const logger = getLogger('find-prev-list-block');

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
  if (!isFirstChildBlockInComplexBlock(editor, block)) {
    return null;
  }
  //
  const parentComplexBlock = getParentBlock(getParentContainer(block));
  assert(logger, parentComplexBlock, 'no parent block');
  assert(logger, isComplexKindBlock(editor, parentComplexBlock), 'not a complex block');
  //
  return findPrevListBlockCanBeInsert(editor, parentComplexBlock);
}
