export let currentFilePath = '';
export let fileData = [];

export function renderTree(files, container) {
  const ul = document.createElement('ul');
  files.forEach(f => {
    const li = document.createElement('li');
    li.textContent = f.path.split('/').pop();
    if (f.children) {
      li.classList.add('dir');
      li.addEventListener('click', e => { e.stopPropagation(); li.classList.toggle('collapsed'); });
      li.appendChild(renderTree(f.children, li));
    } else {
      li.classList.add('file');
      li.addEventListener('click', e => { e.stopPropagation(); openFileInEditor(f.path, f.content); });
    }
    ul.appendChild(li);
  });
  container.innerHTML = '';
  container.appendChild(ul);
}

export function openFileInEditor(path, content) {
  currentFilePath = path;
  window.editor.setValue(content);
}
