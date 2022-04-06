import { assert,
  BlockElement,
  containerToDoc,
  getBlockIndex, getContainerId, getParentContainer,
  mergeDocs,
  NextEditor,
  CloneBlockResultInfo,
} from '@nexteditorjs/nexteditor-core';
import { getListChildContainers, getParentListBlock, isListBlock, isListTextBlock } from '../list-dom';
import { keepSelectionAfterMoveBlocks } from './keep-selection-after-move-blocks';
import { tryMergeTextToListBlock } from './merge-list-block';

function listBlockToTextBlock(editor: NextEditor, listBlock: BlockElement) {
  assert(isListBlock(listBlock), 'not a list block');
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
  if (!isListTextBlock(s.block)) {
    return tryMergeTextToListBlock(editor);
  }
  //
  return editor.undoManager.runInGroup(() => listTextBlockHandleBackspaceEvent(editor));
}
