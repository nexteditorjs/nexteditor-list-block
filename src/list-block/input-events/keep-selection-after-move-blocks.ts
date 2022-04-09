import {
  assert, CloneBlockResultInfo, createComplexBlockPosition, createSimpleBlockPosition,
  getLogger,
  isSimplePos, NextEditor, SelectionRange,
} from '@nexteditorjs/nexteditor-core';

const logger = getLogger('keep-selection-after-move-blocks');

export function keepSelectionAfterMoveBlocks(editor: NextEditor, oldRange: SelectionRange, cloneDocResult: CloneBlockResultInfo) {
  const oldStart = oldRange.start;
  const oldEnd = oldRange.end;
  //
  const startBlockId = cloneDocResult.blockIdMap.get(oldStart.blockId);
  assert(logger, startBlockId, 'no new clone block');
  const endBlockId = cloneDocResult.blockIdMap.get(oldEnd.blockId);
  assert(logger, endBlockId, 'no new clone block');
  //
  if (isSimplePos(oldStart) && isSimplePos(oldEnd)) {
    const newStart = createSimpleBlockPosition(startBlockId, oldStart.offset, 'normal');
    const newEnd = createSimpleBlockPosition(endBlockId, oldEnd.offset, 'normal');
    editor.selection.setSelection(newStart, newEnd);
  } else {
    //
    assert(logger, !isSimplePos(oldStart) && !isSimplePos(oldEnd), 'invalid old range');
    //
    const newStartContainerId = cloneDocResult.containerIdMap.get(oldStart.childContainerId);
    const newEndContainerId = cloneDocResult.containerIdMap.get(oldEnd.childContainerId);
    assert(logger, newStartContainerId && newEndContainerId, 'no cloned container id');
    const newStart = createComplexBlockPosition(startBlockId, newStartContainerId);
    const newEnd = createComplexBlockPosition(endBlockId, newEndContainerId);
    editor.selection.setSelection(newStart, newEnd);
  }
}
