import { assert,
  BlockElement,
  containerToDoc,
  getBlockIndex, getContainerId, getParentContainer,
  mergeDocs,
  NextEditor,
  CloneBlockResultInfo,
  isTextKindBlock,
  getLogger,
} from '@nexteditorjs/nexteditor-core';
import { getListChildContainers, getParentListBlock, isListBlock, isListTextChildBlock } from '../list-dom';
import { keepSelectionAfterMoveBlocks } from './keep-selection-after-move-blocks';
import { tryMergeTextToListBlock } from './merge-list-block';

const logger = getLogger('handle-backspace-event');

function listBlockToTextBlock(editor: NextEditor, listBlock: BlockElement) {
  assert(logger, isListBlock(listBlock), 'not a list block');
  //
  const childContainers = getListChildContainers(listBlock);
  const docs = childContainers.map((childContainer) => {
    const doc = containerToDoc(editor, getContainerId(childContainer));
    return doc;
  });
  //
  const doc = mergeDocs(docs);
  const parentContainer = getParentContainer(listBlock);
  const blockIndex = getBlockIndex(listBlock);
  //
  //
  const oldRange = editor.selection.range.clone();
  const cloneDocResult: CloneBlockResultInfo = {
    containerIdMap: new Map<string, string>(),
    blockIdMap: new Map<string, string>(),
  };
  editor.insertDocAt(parentContainer, blockIndex, doc, cloneDocResult);
  keepSelectionAfterMoveBlocks(editor, oldRange, cloneDocResult);
  return {
    newRange: editor.selection.range.toDocRange(),
  };
}

function listTextBlockHandleBackspaceEvent(editor: NextEditor) {
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
  const textBlock = selectedBlock.block;
  if (!isListTextChildBlock(textBlock)) {
    return false;
  }
  //
  const blockData = editor.getBlockData(textBlock);
  assert(logger, blockData.text, 'invalid block data, no block text');
  //
  const listBlock = getParentListBlock(textBlock);
  assert(logger, listBlock, 'invalid list block dom. no parent list block');
  //
  const offset = start.offset;
  if (offset === 0) {
    //
    const { newRange } = listBlockToTextBlock(editor, listBlock);
    editor.deleteBlock(listBlock, newRange);
    return true;
  }
  //
  return false;
}

export function handleEditorBackspaceEvent(editor: NextEditor) {
  const s = editor.selection.range.getSelectedBlocks()[0];
  if (!s) {
    return false;
  }
  //
  if (!isTextKindBlock(editor, s.block)) {
    return false;
  }
  //
  if (!isListTextChildBlock(s.block)) {
    return tryMergeTextToListBlock(editor);
  }
  //
  // list block to text block
  return editor.undoManager.runInGroup(() => listTextBlockHandleBackspaceEvent(editor));
}
