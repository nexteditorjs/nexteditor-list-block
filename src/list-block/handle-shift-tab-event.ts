import {
  assert, BlockElement, blocksToDoc, CloneBlockResultInfo, createBlockSimpleRange, createSimpleBlockPosition, EditorSimpleSelectionRange, getBlockIndex,
  getBlockTextLength,
  getChildBlocks, getParentBlock, getParentContainer, isRootContainer,
  NextEditor,
} from '@nexteditorjs/nexteditor-core';
import { findParentListChildContainer } from './find-parent-list-child-container';
import { keepSelectionAfterMoveBlocks } from './keep-selection-after-move-blocks';
import { getListChildContainer, isListBlock } from './list-dom';

function moveBlocksOutListChild(editor: NextEditor, fromBlock: BlockElement, cloneDocResult: CloneBlockResultInfo): BlockElement[] {
  const parentContainer = getParentContainer(fromBlock);
  assert(!isRootContainer(parentContainer), 'not a child block');
  const parentListBlock = getParentBlock(parentContainer);
  assert(parentListBlock, 'no parent block');
  assert(isListBlock(parentListBlock), 'not a list block');
  assert(getListChildContainer(parentListBlock) === parentContainer, 'not a list child block');
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
    assert(listData.children, 'no list children');
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
  assert(isListBlock(listBlock), 'not a list block');
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
