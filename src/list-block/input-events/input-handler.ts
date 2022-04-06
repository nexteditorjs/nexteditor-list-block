import { isMatchShortcut, NextEditor, NextEditorCustom, NextEditorInputHandler } from '@nexteditorjs/nexteditor-core';
import { handleEditorBackspaceEvent } from './handle-backspace-event';
import { handleEditorEnterEvent } from './handle-enter-event';
import { handleEditorShiftTabEvent } from './handle-shift-tab-event';
import { handleEditorTabEvent } from './handle-tab-event';

export default class ListBlockInputHandler implements NextEditorInputHandler, NextEditorCustom {
  constructor(editor: NextEditor) {
    editor.input.addHandler(this);
  }

  destroy() {
    //
  }

  handleBeforeKeyDown(editor: NextEditor, event: KeyboardEvent): boolean {
    if (event.key === 'Enter') {
      return handleEditorEnterEvent(editor);
    }
    //
    if (event.key === 'Backspace') {
      return handleEditorBackspaceEvent(editor);
    }
    //
    if (event.key === 'Tab') {
      if (isMatchShortcut(event, 'Shift+Tab')) {
        handleEditorShiftTabEvent(editor);
        return true;
      }
      //
      handleEditorTabEvent(editor);
      return true;
    }
    return false;
  }

  static init(editor: NextEditor) {
    editor.getCustom<ListBlockInputHandler>('list-block-input-handler', ListBlockInputHandler);
  }
}
