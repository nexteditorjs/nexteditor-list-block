import {
  assert, CloneBlockResultInfo, createComplexBlockPosition, createSimpleBlockPosition,
  isSimplePos, NextEditor, SelectionRange,
} from '@nexteditorjs/nexteditor-core';

export function keepSelectionAfterMoveBlocks(editor: NextEditor, oldRange: SelectionRange, cloneDocResult: CloneBlockResultInfo) {
  const oldStart = oldRange.start;
  const oldEnd = oldRange.end;
  //
  const startBlockId = cloneDocResult.blockIdMap.get(oldStart.blockId);
  assert(startBlockId, 'no new clone block');
  const endBlockId = cloneDocResult.blockIdMap.get(oldEnd.blockId);
  assert(endBlockId, 'no new clone block');
  //
  if (isSimplePos(oldStart) && isSimplePos(oldEnd)) {
    const newStart = createSimpleBlockPosition(startBlockId, oldStart.offset, 'normal');
    const newEnd = createSimpleBlockPosition(endBlockId, oldEnd.offset, 'normal');
    editor.selection.setSelection(newStart, newEnd);
  } else {
    //
    assert(!isSimplePos(oldStart) && !isSimplePos(oldEnd));
    //
    const newStartContainerId = cloneDocResult.containerIdMap.get(oldStart.childContainerId);
    const newEndContainerId = cloneDocResult.containerIdMap.get(oldEnd.childContainerId);
    assert(newStartContainerId && newEndContainerId, 'no cloned container id');
    const newStart = createComplexBlockPosition(startBlockId, newStartContainerId);
    const newEnd = createComplexBlockPosition(endBlockId, newEndContainerId);
    editor.selection.setSelection(newStart, newEnd);
  }
}
