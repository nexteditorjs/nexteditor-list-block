import {
  assert, BlockElement, blocksToDoc, CloneBlockResultInfo, getBlockIndex,
  getChildBlocks, getLogger, getParentBlock, getParentContainer, isRootContainer,
  NextEditor,
} from '@nexteditorjs/nexteditor-core';
import { findParentListChildContainer } from '../find-parent-list-child-container';
import { keepSelectionAfterMoveBlocks } from './keep-selection-after-move-blocks';
import { getListChildContainer, isListBlock } from '../list-dom';

const logger = getLogger('handle-shift-tab-event');

function moveBlocksOutListChild(editor: NextEditor, fromBlock: BlockElement, cloneDocResult: CloneBlockResultInfo): BlockElement[] {
  const parentContainer = getParentContainer(fromBlock);
  assert(logger, !isRootContainer(parentContainer), 'not a child block');
  const parentListBlock = getParentBlock(parentContainer);
  assert(logger, parentListBlock, 'no parent block');
  assert(logger, isListBlock(parentListBlock), 'not a list block');
  assert(logger, getListChildContainer(parentListBlock) === parentContainer, 'not a list child block');
  const listChildContainer = parentContainer;
  //
  const fromIndex = getBlockIndex(fromBlock);
  const subBlocks = getChildBlocks(listChildContainer).slice(fromIndex);
  const doc = blocksToDoc(editor, subBlocks);
  //
  const targetContainer = getParentContainer(parentListBlock);
  const targetIndex = getBlockIndex(parentListBlock) + 1;
  //
  const insertedBlocks = editor.insertDocAt(targetContainer, targetIndex, doc, cloneDocResult);
  //
  if (fromIndex === 0) {
    //
    const listData = editor.getBlockData(parentListBlock);
    assert(logger, listData.children, 'no list children');
    const oldChildContainerId = listData.children[1];
    const newData = {
      ...listData,
      children: [listData.children[0]],
    };
    editor.updateBlockData(parentListBlock, newData);
    editor.doc.localDeleteChildContainers([oldChildContainerId]);
  } else {
    subBlocks.forEach((block) => editor.deleteBlock(block));
  }
  //
  return insertedBlocks;
}

export function handleEditorShiftTabEvent(editor: NextEditor) {
  const selectedBlocks = editor.selection.range.getSelectedBlocks();
  if (selectedBlocks.length === 0) {
    return false;
  }
  //
  const findRet = findParentListChildContainer(editor, selectedBlocks[0].block);
  if (!findRet) {
    return false;
  }
  //
  const oldRange = editor.selection.range.clone();
  //
  let fromBlock: BlockElement;
  //
  const { listBlock, adjustedBlock } = findRet;
  assert(logger, isListBlock(listBlock), 'not a list block');
  //
  if (adjustedBlock === selectedBlocks[0].block) {
    fromBlock = selectedBlocks[0].block;
  } else {
    fromBlock = adjustedBlock;
  }
  //
  //
  editor.undoManager.runInGroup(() => {
    //
    const cloneDocResult: CloneBlockResultInfo = {
      containerIdMap: new Map<string, string>(),
      blockIdMap: new Map<string, string>(),
    };

    moveBlocksOutListChild(editor, fromBlock, cloneDocResult);
    //
    keepSelectionAfterMoveBlocks(editor, oldRange, cloneDocResult);
  });
  //
  return true;
}
