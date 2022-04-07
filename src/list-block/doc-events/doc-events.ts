import debounce from 'lodash.debounce';
import { DocBlock, NextEditor, NextEditorCustom, NextEditorDocCallbacks } from '@nexteditorjs/nexteditor-core';
import { updateAllListMarkerFrom } from '../list-marker';

export default class ListBlockDocCallbacks implements NextEditorDocCallbacks, NextEditorCustom {
  private changedBlocks = new Map<string, number>();

  constructor(private editor: NextEditor) {
    editor.doc.registerCallback(this);
  }

  destroy() {
    //
  }

  private static addToCache(cache: Map<string, number>, containerId: string, blockIndex: number) {
    const fromBlockIndex = cache.get(containerId);
    if (fromBlockIndex === undefined) {
      cache.set(containerId, blockIndex);
    } else {
      cache.set(containerId, Math.min(blockIndex, fromBlockIndex));
    }
    //
  }

  onInsertBlock(containerId: string, blockIndex: number, blockData: DocBlock, local: boolean): void {
    //
    ListBlockDocCallbacks.addToCache(this.changedBlocks, containerId, blockIndex);
    //
    this.updateInsertedList();
  }

  onDeleteBlock(containerId: string, blockIndex: number, local: boolean): void {
    ListBlockDocCallbacks.addToCache(this.changedBlocks, containerId, blockIndex);
    //
    this.updateInsertedList();
  }

  private updateInsertedList = debounce(() => {
    this.changedBlocks.forEach((blockIndex, containerId) => {
      updateAllListMarkerFrom(this.editor, containerId, blockIndex);
    });
    this.changedBlocks.clear();
  });

  static init(editor: NextEditor) {
    editor.getCustom<ListBlockDocCallbacks>('list-block-doc-callbacks', ListBlockDocCallbacks);
  }
}
