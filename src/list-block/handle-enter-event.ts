import {
  assert,
  genId, getBlockIndex, getContainerId, getParentContainer,
  getTextLength,
  NextEditor, splitText,
} from '@nexteditorjs/nexteditor-core';
import { insertListBlock } from './insert-list-block';
import { getListChildContainer, getParentListBlock, isListTextBlock } from './list-dom';

function listTextBlockHandleEnterEvent(editor: NextEditor) {
  if (!editor.selection.range.isCollapsed()) {
    editor.clearSelectedContents();
  }
  //
  const selectedBlocks = editor.selection.range.getSelectedBlocks();
  if (selectedBlocks.length !== 1) {
    return true;
  }
  //
  const selectedBlock = selectedBlocks[0];
  if (!isListTextBlock(selectedBlock.block)) {
    return false;
  }
  const { start, end } = selectedBlock;
  assert(start.isSimple() && end.isSimple(), 'invalid block position');
  assert(start.offset === end.offset, 'invalid block offset');
  assert(start.blockId === end.blockId, 'invalid selected block');
  //
  const textBlock = selectedBlock.block;
  if (!isListTextBlock(textBlock)) {
    return false;
  }
  //
  const blockData = editor.getBlockData(textBlock);
  assert(blockData.text);
  //
  const listBlock = getParentListBlock(textBlock);
  assert(listBlock, 'invalid list block dom. no parent list block');
  //
  if (getTextLength(blockData.text) === 0 && !getListChildContainer(listBlock)) {
    // remove list
    const parentContainer = getParentContainer(listBlock);
    editor.insertBlock(getContainerId(parentContainer), getBlockIndex(listBlock), {
      id: genId(),
      type: 'text',
      text: [],
    });
    editor.deleteBlock(listBlock);
    return true;
  }
  //
  const offset = start.offset;
  const { left, right } = splitText(blockData.text, offset);
  //
  editor.setBlockText(textBlock, left);
  //
  const listChildContainer = getListChildContainer(listBlock);
  if (listChildContainer) {
    editor.insertBlock(getContainerId(listChildContainer), 0, {
      id: genId(),
      type: 'text',
      text: right,
    });
  } else {
    const parentContainer = getParentContainer(listBlock);
    const targetIndex = getBlockIndex(listBlock) + 1;
    insertListBlock(editor, parentContainer, targetIndex, right);
  }
  //
  return true;
}

export function handleEditorEnterEvent(editor: NextEditor) {
  const s = editor.selection.range.getSelectedBlocks()[0];
  if (!s) {
    return false;
  }
  //
  if (!isListTextBlock(s.block)) {
    return false;
  }
  //
  editor.undoManager.runInGroup(() => listTextBlockHandleEnterEvent(editor));
  return true;
}
