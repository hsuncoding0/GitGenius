export function initEditor() {
  window.editor = CodeMirror(document.getElementById('editor'), {
    lineNumbers: true,
    mode: "javascript",
    theme: "material",
    value: "",
    viewportMargin: Infinity
  });
}
