import {
  assert, BlockElement, blocksToDoc, CloneBlockResultInfo,
  getChildBlockCount, getPrevBlock,
  NextEditor,
} from '@nexteditorjs/nexteditor-core';
import { findPrevListBlockCanBeInsert } from './find-prev-list-block';
import { keepSelectionAfterMoveBlocks } from './keep-selection-after-move-blocks';
import { createListChildContainer, getListChildContainer, isListBlock } from './list-dom';

function moveBlocksToPrevListChild(editor: NextEditor, blocks: BlockElement[], cloneDocResult: CloneBlockResultInfo) {
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
    createListChildContainer(editor, parentListBlock, doc, cloneDocResult);
  } else {
    editor.insertDocAt(childContainer, getChildBlockCount(childContainer), doc, cloneDocResult);
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
  const oldRange = editor.selection.range.clone();
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
  editor.undoManager.runInGroup(() => {
    //
    const cloneDocResult: CloneBlockResultInfo = {
      containerIdMap: new Map<string, string>(),
      blockIdMap: new Map<string, string>(),
    };
    //
    moveBlocksToPrevListChild(editor, blocks, cloneDocResult);
    //
    keepSelectionAfterMoveBlocks(editor, oldRange, cloneDocResult);
  });
  //
  return true;
}
