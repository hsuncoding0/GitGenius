import { Octokit } from "@octokit/rest";

function parseRepoUrl(url) {
  const match = url.match(/github\.com\/(.*?)\/(.*)/);
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

export async function fetchRepoFiles(url, token) {
  const { owner, repo } = parseRepoUrl(url);
  const octokit = new Octokit({ auth: token });
  const files = [];

  async function getFiles(path = '') {
    const res = await octokit.repos.getContent({ owner, repo, path });
    for (const item of res.data) {
      if (item.type === 'dir') await getFiles(item.path);
      else files.push({ path: item.path, content: Buffer.from(item.content || '', 'base64').toString('utf-8') });
    }
  }

  await getFiles();
  return files;
}

export async function updateFile(token, url, path, content, message) {
  const { owner, repo } = parseRepoUrl(url);
  const octokit = new Octokit({ auth: token });
  const res = await octokit.repos.getContent({ owner, repo, path }).catch(() => null);
  const sha = res?.data?.sha;

  await octokit.repos.createOrUpdateFileContents({
    owner, repo, path, message,
    content: Buffer.from(content).toString('base64'),
    sha
  });
}
