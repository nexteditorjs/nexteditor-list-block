import { getBlockType, getParentBlock, NextEditor, NextEditorCustom } from '@nexteditorjs/nexteditor-core';
import { ListData } from '../list-data';

export default class ListBlockMarkerCallbacks implements NextEditorCustom {
  constructor(private editor: NextEditor) {
    editor.rootContainer.addEventListener('click', this.handleClick);
  }

  destroy() {
    this.editor.rootContainer.removeEventListener('click', this.handleClick);
  }

  handleClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    //
    const marker = event.target.closest('.list-marker');
    if (!marker) {
      return;
    }
    const block = getParentBlock(marker);
    if (!block) {
      return;
    }
    //
    if (getBlockType(block) !== 'list') {
      return;
    }
    //
    const data = this.editor.getBlockData(block) as ListData;
    if (data.listType === 'checkbox') {
      //
      const data = this.editor.getBlockData(block) as ListData;
      this.editor.updateBlockData(block, {
        ...data,
        checked: !data.checked,
      });
      //
    }
    //
  };

  static init(editor: NextEditor) {
    editor.getCustom<ListBlockMarkerCallbacks>('list-block-marker-callbacks', ListBlockMarkerCallbacks);
  }
}
