import { assert, BlockElement, blocksToDoc, getChildBlockCount, getPrevBlock, NextEditor } from '@nexteditorjs/nexteditor-core';
import { findPrevListBlockCanBeInsert } from './find-prev-list-block';
import { createListChildContainer, getListChildContainer, isListBlock } from './list-dom';

function moveBlocksToPrevListChild(editor: NextEditor, blocks: BlockElement[]) {
  if (blocks.length === 0) return false;
  const prevBlock = getPrevBlock(blocks[0]);
  if (!prevBlock) return false;
  if (!isListBlock(prevBlock)) return false;
  const parentListBlock = prevBlock;
  //
  const doc = blocksToDoc(editor, blocks);
  //
  const childContainer = getListChildContainer(parentListBlock);
  if (!childContainer) {
    createListChildContainer(editor, parentListBlock, doc);
  } else {
    editor.insertDocAt(childContainer, getChildBlockCount(childContainer), doc);
  }
  //
  blocks.forEach((block) => editor.deleteBlock(block));
  //
  return true;
}

export function handleEditorTabEvent(editor: NextEditor) {
  const selectedBlocks = editor.selection.range.getSelectedBlocks();
  if (selectedBlocks.length === 0) {
    return false;
  }
  //
  const findResult = findPrevListBlockCanBeInsert(editor, selectedBlocks[0].block);
  if (!findResult) {
    return false;
  }
  //
  let blocks: BlockElement[];
  //
  const { listBlock, adjustedBlock } = findResult;
  assert(isListBlock(listBlock), 'not a list block');
  //
  if (adjustedBlock === selectedBlocks[0].block) {
    //
    blocks = selectedBlocks.map((s) => s.block);
    //
  } else {
    assert(selectedBlocks.length === 1, 'invalid selected blocks');
    //
    blocks = [adjustedBlock];
    //
  }
  //
  editor.undoManager.runInGroup(() => moveBlocksToPrevListChild(editor, blocks));
  //
  return true;
}
