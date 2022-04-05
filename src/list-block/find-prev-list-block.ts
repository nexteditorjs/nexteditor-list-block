import { assert, BlockElement, complexBlockGetAllChildContainers, getParentBlock, getParentContainer, getPrevBlock, isRootContainer, NextEditor } from '@nexteditorjs/nexteditor-core';
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
  const parentContainer = getParentContainer(block);
  if (isRootContainer(parentContainer)) {
    return null;
  }
  //
  const parentComplexBlock = getParentBlock(parentContainer);
  assert(parentComplexBlock, 'no parent complex block');
  //
  const childContainers = complexBlockGetAllChildContainers(editor, parentComplexBlock);
  const index = childContainers.indexOf(parentContainer);
  assert(index !== -1, 'not a valid child container');
  if (index !== 0) {
    return null;
  }
  //
  return findPrevListBlockCanBeInsert(editor, parentComplexBlock);
}
