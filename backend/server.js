  const express = require('express');
  const WebSocket = require('ws');
  const http = require('http');
  const dotenv = require('dotenv');
  const { Groq } = require('groq-sdk');
  const cors = require('cors');
  dotenv.config();

  const app = express();
  app.use(cors());
  app.use(express.json());


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


  app.post('/api/generate-content', async (req, res) => {
    console.log(req.body?.transcript);  // Log the received transcript
  
    const groq = new Groq({ apiKey: "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" });
  
    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: "user", content: req.body.transcript }],
        model: "llama3-8b-8192",
      });
  
      console.log('Response from Groq API:', response);
      res.json(response);
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).send('Error generating content');
    }
  });
  



  server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
