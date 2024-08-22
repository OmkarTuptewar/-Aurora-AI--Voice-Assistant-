require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGroqChatCompletion() {
  return groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: 'Explain the importance of fast language models',
      },
    ],
    model: 'llama3-8b-8192',
  });
}

module.exports = { getGroqChatCompletion };
