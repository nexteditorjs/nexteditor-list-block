import {
  assert, BlockElement, ConvertBlockResult, DocBlockAttributes, genId,
  getLogger,
  isTextKindBlock, NextEditor, splitText,
} from '@nexteditorjs/nexteditor-core';
import { ListData } from './list-data';

const logger = getLogger('convert-to-list');

export function convertToList(editor: NextEditor, srcBlock: BlockElement, options: { offset: number, data?: DocBlockAttributes }): ConvertBlockResult | null {
  //
  if (!isTextKindBlock(editor, srcBlock)) {
    return null;
  }
  //
  const srcData = editor.getBlockData(srcBlock);
  assert(logger, srcData.text, 'no text');
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
  let listType: 'ordered' | 'unordered' | 'checkbox' = 'ordered';
  if (options.data?.listType === 'unordered' || options.data?.listType === 'checkbox') {
    listType = options.data.listType;
  }
  //
  const listData: ListData = {
    id: genId(),
    type: 'list',
    listType,
    children: [textContainerId],
  };
  return {
    blockData: listData,
    focusBlockId: textBlock.id,
  };
}
