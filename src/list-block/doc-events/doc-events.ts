import { DocBlock, NextEditor, NextEditorCustom, NextEditorDocCallbacks } from '@nexteditorjs/nexteditor-core';
import { updateListMarkerFrom } from '../list-marker';

export default class ListBlockDocCallbacks implements NextEditorDocCallbacks, NextEditorCustom {
  constructor(private editor: NextEditor) {
    editor.doc.registerCallback(this);
  }

  destroy() {
    //
  }

  onInsertBlock(containerId: string, blockIndex: number, blockData: DocBlock, local: boolean): void {
    setTimeout(() => {
      updateListMarkerFrom(this.editor, containerId, blockIndex + 1);
    });
  }

  onDeleteBlock(containerId: string, blockIndex: number, local: boolean): void {
    setTimeout(() => {
      updateListMarkerFrom(this.editor, containerId, blockIndex);
    });
  }

  static init(editor: NextEditor) {
    editor.getCustom<ListBlockDocCallbacks>('list-block-doc-callbacks', ListBlockDocCallbacks);
  }
}
