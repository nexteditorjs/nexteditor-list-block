import {
  assert, BlockElement, complexBlockGetLastSimpleChild, editorMergeTextBlock,
  getLastChildBlock,
  getLogger,
  getParentBlock, getParentContainer, getPrevBlock,
  isEmptyTextBlock, isRootContainer, isTextKindBlock, NextEditor,
  SimpleBlockPosition,
} from '@nexteditorjs/nexteditor-core';
import { isListBlock, isListTextChildBlock, getListChildContainer, getParentListBlock, getTextContainer } from '../list-dom';

const logger = getLogger('merge-list-block');

function isListFirstChildBlock(editor: NextEditor, block: BlockElement) {
  if (getPrevBlock(block)) {
    return false;
  }
  const parentContainer = getParentContainer(block);
  if (isRootContainer(parentContainer)) {
    return false;
  }
  //
  const parentBlock = getParentBlock(parentContainer);
  assert(logger, parentBlock, 'no parent block');
  //
  if (!isListBlock(parentBlock)) {
    return false;
  }
  //
  const listBlock = parentBlock;
  return getListChildContainer(listBlock) === parentContainer;
}

export function tryMergeTextToListBlock(editor: NextEditor): boolean {
  const range = editor.selection.range;
  if (!range.isCollapsed()) {
    return false;
  }
  //
  if (!range.isSimple()) {
    return false;
  }
  //
  const start = range.start as SimpleBlockPosition;
  const block = editor.getBlockById(start.blockId);
  const offset = start.offset;
  if (offset !== 0) {
    return false;
  }
  if (!isTextKindBlock(editor, block)) {
    return false;
  }
  //
  if (isEmptyTextBlock(editor, block)) {
    return false;
  }
  //
  if (isListTextChildBlock(block)) {
    return false;
  }
  //
  const prevBlock = getPrevBlock(block);
  if (!prevBlock) {
    //
    if (!isListFirstChildBlock(editor, block)) {
      return false;
    }
    //
    const parentListBlock = getParentListBlock(block);
    assert(logger, parentListBlock, 'no parent list block');
    const listText = getLastChildBlock(getTextContainer(parentListBlock));
    assert(logger, isTextKindBlock(editor, listText), 'not a text block');
    editorMergeTextBlock(editor, listText, block);
    return true;
  }
  //
  if (!isListBlock(prevBlock)) {
    return false;
  }
  //
  const listBlock = prevBlock;
  const lastBlock = complexBlockGetLastSimpleChild(editor, listBlock);
  if (isTextKindBlock(editor, lastBlock)) {
    editorMergeTextBlock(editor, lastBlock, block);
    return true;
  }
  //
  return false;
}
