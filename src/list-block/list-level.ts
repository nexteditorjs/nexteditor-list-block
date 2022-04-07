import { BlockPath, NextEditor } from '@nexteditorjs/nexteditor-core';

export function getListLevel(editor: NextEditor, path: BlockPath): number {
  let level = 0;
  path.forEach((path) => {
    const data = editor.doc.getBlockData(path.containerId, path.blockIndex);
    if (data.type === 'list') {
      level++;
    } else {
      level = 0;
    }
  });

  return level;
}
