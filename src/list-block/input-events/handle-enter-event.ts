import {
  assert,
  BlockElement,
  DocBlockText,
  genId, getBlockIndex, getContainerId, getLogger, getParentContainer,
  getTextLength,
  isTextKindBlock,
  NextEditor, splitText,
} from '@nexteditorjs/nexteditor-core';
import { insertListBlock } from '../insert-list-block';
import { ListData } from '../list-data';
import { getListChildContainer, getParentListBlock, isListBlock, isListTextChildBlock } from '../list-dom';

const logger = getLogger('handle-enter-event');

function getListType(editor: NextEditor, listBlock: BlockElement) {
  assert(logger, isListBlock(listBlock), 'not a list block');
  return (editor.getBlockData(listBlock) as ListData).listType;
}

function insertTextBlockToListChild(editor: NextEditor, listBlock: BlockElement, text: DocBlockText) {
  assert(logger, isListBlock(listBlock), 'not a list block');
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
    insertListBlock(editor, parentContainer, targetIndex, text, getListType(editor, listBlock));
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
  assert(logger, start.isSimple() && end.isSimple(), 'invalid block position');
  assert(logger, start.offset === end.offset, 'invalid block offset');
  assert(logger, start.blockId === end.blockId, 'invalid selected block');
  //
  const listTextChildBlock = selectedBlock.block;
  const listBlock = getParentListBlock(listTextChildBlock);
  assert(logger, listBlock, 'invalid list block dom. no parent list block');
  //
  if (!isTextKindBlock(editor, listTextChildBlock)) {
    insertTextBlockToListChild(editor, listBlock, []);
    return true;
  }
  //
  const textBlock = listTextChildBlock;
  //
  const blockData = editor.getBlockData(textBlock);
  assert(logger, blockData.text, 'invalid block data, no block text');
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
