import { cp, mkdir } from 'node:fs/promises';
await mkdir('public/vendor/monaco', { recursive: true });
await cp('node_modules/monaco-editor/min/vs', 'public/vendor/monaco/vs', {recursive:true});
