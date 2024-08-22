// server.js (or your server file)
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const dotenv = require('dotenv');
const { getGroqChatCompletion } = require('./groqClient'); 

dotenv.config();
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    const text = message.toString();

    try {
      // Fetch response from GROQ based on the text
      const response = await getGroqChatCompletion(text);
      const responseText = response.choices[0]?.message?.content || "No response";

      // Send response back to the client
      ws.send(JSON.stringify({ type: 'response', text: responseText }));
    } catch (error) {
      console.error('Error fetching response:', error);
      ws.send(JSON.stringify({ type: 'response', text: 'Error fetching response' }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
