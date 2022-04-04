import { NextEditor, NextEditorCustom, NextEditorInputHandler } from '@nexteditorjs/nexteditor-core';
import { handleEditorEnterEvent } from './handle-enter-event';

export default class ListBlockInputHandler implements NextEditorInputHandler, NextEditorCustom {
  constructor(private editor: NextEditor) {
    editor.input.addHandler(this);
  }

  destroy() {
    //
  }

  handleBeforeKeyDown(editor: NextEditor, event: KeyboardEvent): boolean {
    if (event.key === 'Enter') {
      return handleEditorEnterEvent(editor);
    }
    return false;
  }

  static init(editor: NextEditor) {
    editor.getCustom<ListBlockInputHandler>('list-block-input-handler', ListBlockInputHandler);
  }
}
