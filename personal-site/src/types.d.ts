declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// edcore.main is a runtime-only entry point (editor core + contribs, no built-in
// language grammars) that ships no .d.ts. Its public surface is identical to the
// top-level `monaco-editor` types, so re-export those.
declare module 'monaco-editor/esm/vs/editor/edcore.main' {
  export * from 'monaco-editor';
}