import { renderTree, openFileInEditor, currentFilePath, fileData } from './tree.js';
import { initEditor } from './editor.js';
import { showDiff } from './diff.js';

initEditor();

const githubUrlInput = document.getElementById('githubUrl');
const fetchBtn = document.getElementById('fetchBtn');
const aiGenerateBtn = document.getElementById('aiGenerateBtn');
const userRequestInput = document.getElementById('userRequest');
const updateGitHubBtn = document.getElementById('updateGitHubBtn');
const fileTreeDiv = document.getElementById('fileTree');
const diffContainer = 'diffContainer';
const messageDiv = document.getElementById('message');

let token = new URLSearchParams(window.location.search).get('token') || '';

function showMessage(text, type='green') {
  messageDiv.textContent = text;
  messageDiv.className = `mt-4 p-2 text-center text-white rounded bg-${type}-500`;
  messageDiv.classList.remove('hidden');
  setTimeout(() => messageDiv.classList.add('hidden'), 3000);
}

// 讀取 repo
fetchBtn.addEventListener('click', async () => {
  showMessage('讀取中...', 'blue');
  const res = await fetch('/fetchRepo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ githubUrl: githubUrlInput.value, token })
  });
  const data = await res.json();
  if (data.error) return showMessage(data.error, 'red');
  fileData.length = 0;
  fileData.push(...data.files);
  renderTree(fileData, fileTreeDiv);
  showMessage('Repo 讀取完成！');
});

// AI 生成整個 repo
aiGenerateBtn.addEventListener('click', async () => {
  showMessage('AI 生成中...', 'blue');
  const res = await fetch('/generateRepo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: fileData, userRequest: userRequestInput.value })
  });
  const data = await res.json();
  if (data.error) return showMessage(data.error, 'red');
  data.updatedFiles.forEach(f => {
    const oldFile = fileData.find(of => of.path === f.path);
    if (oldFile) showDiff(oldFile.content, f.content, diffContainer);
    const fileIndex = fileData.findIndex(of => of.path === f.path);
    if (fileIndex >= 0) fileData[fileIndex].content = f.content;
  });
  showMessage('AI 生成完成！可檢視差異');
});

// 更新 GitHub
updateGitHubBtn.addEventListener('click', async () => {
  showMessage('更新 GitHub...', 'blue');
  const res = await fetch('/updateGitHub', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, repoUrl: githubUrlInput.value, files: fileData })
  });
  const data = await res.json();
  if (data.error) return showMessage(data.error, 'red');
  showMessage('GitHub 更新成功！');
});
