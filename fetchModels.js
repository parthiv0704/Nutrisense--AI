import fs from 'fs';
import path from 'path';

async function check() {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const keyLine = envContent.split('\n').find(line => line.startsWith('VITE_GEMINI_API_KEY='));
  let apiKey = keyLine ? keyLine.split('=')[1].trim() : null;
  if (apiKey) apiKey = apiKey.replace(/^"|"$/g, '');

  if (!apiKey) return;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    if (data.models) {
      const valid = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
      fs.writeFileSync('valid_model.txt', valid[0].name.replace('models/', ''));
    } 
  } catch(e) { }
}
check();
