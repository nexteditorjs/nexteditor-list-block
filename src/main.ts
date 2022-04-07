/* eslint-disable import/no-extraneous-dependencies */
import {
  assert,
  createEditor,
  createEmptyDoc,
  LocalDoc,
} from '@nexteditorjs/nexteditor-core';
import { MarkdownInputHandler } from '@nexteditorjs/nexteditor-input-handlers';

import ListBlock from './list-block';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');
assert(app, 'app does not exists');

const editor = createEditor(app, new LocalDoc(createEmptyDoc() as any), {
  components: {
    blocks: [ListBlock],
  },
});

editor.input.addHandler(new MarkdownInputHandler());

(window as any).editor = editor;
