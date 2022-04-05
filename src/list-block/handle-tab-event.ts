import { assert, BlockElement, blocksToDoc, getChildBlockCount, getPrevBlock, isMatchShortcut, NextEditor } from '@nexteditorjs/nexteditor-core';
import { createListChildContainer, getListChildContainer, getParentListBlock, isListBlock, isListTextBlock } from './list-dom';

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

function listTextBlockHandleTabEvent(editor: NextEditor, listBlocks: BlockElement[]) {
  const selectedBlocks = editor.selection.range.getSelectedBlocks();
  if (selectedBlocks.length === 0) {
    return false;
  }
  //
  if (selectedBlocks.length === 1) {
    if (isListTextBlock(selectedBlocks[0].block)) {
      const listBlock = getParentListBlock(selectedBlocks[0].block);
      assert(listBlock, 'no parent list block');
      moveBlocksToPrevListChild(editor, [listBlock]);
      return true;
    }
  }
  //
  const blocks = selectedBlocks.map((s) => s.block);
  moveBlocksToPrevListChild(editor, blocks);
  return true;
}

export function handleEditorTabEvent(editor: NextEditor) {
  const selectedBlocks = editor.selection.range.getSelectedBlocks();
  if (selectedBlocks.length === 0) {
    return false;
  }
  //
  if (selectedBlocks.length === 1) {
    if (isListTextBlock(selectedBlocks[0].block)) {
      //
    }
  }
  //
  if (selectedBlocks.some((s) => !isListTextBlock(s.block))) {
    return false;
  }
  //
  const blocks = selectedBlocks.map((s) => s.block);
  //
  editor.undoManager.runInGroup(() => listTextBlockHandleTabEvent(editor, blocks));
  //
  return true;
}
