import {
  assert,
  BlockElement,
  DocBlockText,
  genId, getBlockIndex, getContainerId, getParentContainer,
  getTextLength,
  isTextKindBlock,
  NextEditor, splitText,
} from '@nexteditorjs/nexteditor-core';
import { insertListBlock } from '../insert-list-block';
import { getListChildContainer, getParentListBlock, isListBlock, isListTextChildBlock } from '../list-dom';

function insertTextBlockToListChild(editor: NextEditor, listBlock: BlockElement, text: DocBlockText) {
  assert(isListBlock(listBlock), 'not a list block');
  const listChildContainer = getListChildContainer(listBlock);
  if (listChildContainer) {
    editor.insertBlock(getContainerId(listChildContainer), 0, {
      id: genId(),
      type: 'text',
      text,
    });
  } else {
    const parentContainer = getParentContainer(listBlock);
    const targetIndex = getBlockIndex(listBlock) + 1;
    insertListBlock(editor, parentContainer, targetIndex, text);
  }
}

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
  if (!isListTextChildBlock(selectedBlock.block)) {
    return false;
  }
  const { start, end } = selectedBlock;
  assert(start.isSimple() && end.isSimple(), 'invalid block position');
  assert(start.offset === end.offset, 'invalid block offset');
  assert(start.blockId === end.blockId, 'invalid selected block');
  //
  const listTextChildBlock = selectedBlock.block;
  const listBlock = getParentListBlock(listTextChildBlock);
  assert(listBlock, 'invalid list block dom. no parent list block');
  //
  if (!isTextKindBlock(editor, listTextChildBlock)) {
    insertTextBlockToListChild(editor, listBlock, []);
    return true;
  }
  //
  const textBlock = listTextChildBlock;
  //
  const blockData = editor.getBlockData(textBlock);
  assert(blockData.text);
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
  insertTextBlockToListChild(editor, listBlock, right);
  //
  return true;
}

export function handleEditorEnterEvent(editor: NextEditor) {
  const s = editor.selection.range.getSelectedBlocks()[0];
  if (!s) {
    return false;
  }
  //
  if (!isListTextChildBlock(s.block)) {
    return false;
  }
  //
  editor.undoManager.runInGroup(() => listTextBlockHandleEnterEvent(editor));
  return true;
}
