import { ContainerElement, createBlockSimpleRange, DocBlock, DocBlockText, genId, getContainerId, NextEditor } from '@nexteditorjs/nexteditor-core';
import { ListData, ListType } from './list-data';

export function prepareInsertListBlock(editor: NextEditor, text: DocBlockText, listType: ListType) {
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
    listType,
    children: [textContainerId],
  };

  return { listData, textBlock };
}

export function insertListBlock(editor: NextEditor, container: ContainerElement, blockIndex: number, text: DocBlockText, listType: ListType): DocBlock {
  const { listData, textBlock } = prepareInsertListBlock(editor, text, listType);
  //
  const newRange = createBlockSimpleRange(editor, textBlock.id, 0);
  return editor.doc.localInsertBlock(getContainerId(container), blockIndex, listData, newRange);
}
