import {
  assert, BlockElement, blocksToDoc, getBlockIndex,
  getChildBlocks, getParentContainer, isRootContainer,
  NextEditor,
} from '@nexteditorjs/nexteditor-core';
import { getListChildContainer, getParentListBlock, isListTextBlock } from './list-dom';

function moveBlocksOutListChild(editor: NextEditor, blocks: BlockElement[]) {
  if (blocks.length === 0) return false;
  const blockParentContainer = getParentContainer(blocks[0]);
  if (isRootContainer(blockParentContainer)) return false;
  //
  const parentListBlock = getParentListBlock(blockParentContainer);
  if (!parentListBlock) return false;
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
  editor.insertDocAt(targetContainer, targetIndex, doc);
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
  return true;
}

export function handleEditorShiftTabEvent(editor: NextEditor) {
  const selectedBlocks = editor.selection.range.getSelectedBlocks();
  if (selectedBlocks.length === 0) {
    return false;
  }
  //
  const first = selectedBlocks[0].block;
  const parentContainer = getParentContainer(first);
  if (isRootContainer(parentContainer)) {
    return false;
  }
  //
  if (isListTextBlock(first)) {
    const parentList = getParentListBlock(first);
    assert(parentList, 'no parent list');
    moveBlocksOutListChild(editor, [parentList]);
    return true;
  }
  //
  const blocks = selectedBlocks.map((s) => s.block);
  moveBlocksOutListChild(editor, blocks);
  return true;
}
