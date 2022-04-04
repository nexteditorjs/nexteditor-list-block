import {
  assert, BlockElement, ConvertBlockResult, genId,
  isTextKindBlock, NextEditor, splitText,
} from '@nexteditorjs/nexteditor-core';
import { ListData } from './list-data';

export function convertToList(editor: NextEditor, srcBlock: BlockElement, options: { offset: number }): ConvertBlockResult | null {
  //
  if (!isTextKindBlock(editor, srcBlock)) {
    return null;
  }
  //
  const srcData = editor.getBlockData(srcBlock);
  assert(srcData.text, 'no text');
  const text = splitText(srcData.text, options.offset).right;
  //
  const textBlock = {
    id: genId(),
    type: 'text',
    text,
  };
  const textContainerId = genId();
  editor.doc.localInsertChildContainer(textContainerId, [textBlock]);
  //
  const listData: ListData = {
    id: genId(),
    type: 'list',
    listType: 'ordered',
    children: [textContainerId],
  };
  return {
    blockData: listData,
    focusBlockId: textBlock.id,
  };
}
