const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || 'your-deepgram-api-key';
const DEEPGRAM_API_URL = 'wss://api.deepgram.com/v1/listen';


const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  const deepgramSocket = new WebSocket(DEEPGRAM_API_URL, {
    headers: {
      Authorization: `Token ${DEEPGRAM_API_KEY}`,
    },
  });

 
  deepgramSocket.on('message', (message) => {
    console.log('Message from Deepgram:', message);
    ws.send(message);
  });

 
  ws.on('message', (message) => {
    if (deepgramSocket.readyState === WebSocket.OPEN) {
      deepgramSocket.send(message);
    }
  });

  ws.on('close', () => {
    deepgramSocket.close();
    console.log('Client disconnected');
  });

  deepgramSocket.on('error', (error) => {
    console.error('Deepgram WebSocket error:', error);
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
