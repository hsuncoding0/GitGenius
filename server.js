import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { fetchRepoFiles, updateFile } from './src/githubHelper.js';
import { generateRepoFiles } from './src/aiHelper.js';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// OAuth 登入
app.get('/oauth/login', (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo`;
  res.redirect(url);
});

app.get('/oauth/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const tokenRes = await axios.post(`https://github.com/login/oauth/access_token`, {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, { headers: { Accept: 'application/json' } });

    const token = tokenRes.data.access_token;
    res.redirect(`/index.html?token=${token}`);
  } catch (err) {
    res.send('OAuth 登入失敗');
  }
});

// 抓取 repo 檔案結構
app.post('/fetchRepo', async (req, res) => {
  const { githubUrl, token } = req.body;
  try {
    const files = await fetchRepoFiles(githubUrl, token);
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI 多檔案生成
app.post('/generateRepo', async (req, res) => {
  const { files, userRequest } = req.body;
  try {
    const updatedFiles = await generateRepoFiles(files, userRequest);
    res.json({ updatedFiles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更新 GitHub 檔案
app.post('/updateGitHub', async (req, res) => {
  const { token, repoUrl, files } = req.body;
  try {
    for (const f of files) {
      await updateFile(token, repoUrl, f.path, f.content, f.message || 'AI 修改');
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('GitGenius running on http://localhost:3000'));
