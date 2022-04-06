import {
  assert, BlockElement, blocksToDoc, getBlockIndex,
  getChildBlocks, getParentContainer, isRootContainer,
  NextEditor,
} from '@nexteditorjs/nexteditor-core';
import { findParentListChildContainer } from './find-parent-list-child-container';
import { getListChildContainer, getParentListBlock, isListBlock } from './list-dom';

function moveBlocksOutListChild(editor: NextEditor, blocks: BlockElement[]): BlockElement[] {
  if (blocks.length === 0) return [];
  const blockParentContainer = getParentContainer(blocks[0]);
  if (isRootContainer(blockParentContainer)) return [];
  //
  const parentListBlock = getParentListBlock(blockParentContainer);
  if (!parentListBlock) return [];
  //
  assert(blockParentContainer === getListChildContainer(parentListBlock));
  //
  const fromIndex = getBlockIndex(blocks[0]);
  const subBlocks = getChildBlocks(blockParentContainer).slice(fromIndex);
  const doc = blocksToDoc(editor, subBlocks);
  //
  const targetContainer = getParentContainer(parentListBlock);
  const targetIndex = getBlockIndex(parentListBlock) + 1;
  //
  const insertedBlocks = editor.insertDocAt(targetContainer, targetIndex, doc);
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
  let blocks: BlockElement[] = [];
  //
  const { listBlock, adjustedBlock } = findRet;
  assert(isListBlock(listBlock), 'not a list block');
  //
  if (adjustedBlock === selectedBlocks[0].block) {
    blocks = selectedBlocks.map((s) => s.block);
  } else {
    blocks = [adjustedBlock];
  }
  //
  //
  editor.undoManager.runInGroup(() => {
    //
    moveBlocksOutListChild(editor, blocks);
    //
  });
  //
  return true;
}
