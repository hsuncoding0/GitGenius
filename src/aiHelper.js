import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// AI 多檔案生成
export async function generateRepoFiles(files, userRequest) {
  const fileContents = files.map(f => `File: ${f.path}\nContent:\n${f.content}`).join('\n\n');

  const prompt = `
You are a professional programmer.
The user wants to modify or add features in a repository.
User request: "${userRequest}"
Repository files:
${fileContents}
Please generate the updated content for each file separately, include all files needed, no omissions.
Format:
FILE_PATH: content
`;

  const response = await client.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: "You are a professional programmer." },
      { role: "user", content: prompt }
    ],
    temperature: 0
  });

  const text = response.choices[0].message.content;

  // 將 AI 回傳解析成陣列 {path, content}
  const updatedFiles = [];
  const regex = /^(.*?):\s*([\s\S]*?)(?=^[^:\n]+:|$)/gm;
  let match;
  while ((match = regex.exec(text)) !== null) {
    updatedFiles.push({ path: match[1].trim(), content: match[2].trim() });
  }
  return updatedFiles;
}
