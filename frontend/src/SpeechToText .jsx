import React, { useState, useRef } from 'react';

const SpeechToText = () => {
  const [status, setStatus] = useState('Not Connected');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const socketRef = useRef(null);

 
  const startRecording = async () => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      console.error('MediaDevices or MediaRecorder not supported.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

     
      socketRef.current = new WebSocket('ws://localhost:4000');

      socketRef.current.onopen = () => {
        setStatus('Connected');
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'response') {
          setResponse(data.text);
          playTextToSpeech(data.text);  
        } else {
          setTranscript((prev) => prev + data.text + ' ');
        }
      };

      socketRef.current.onclose = () => {
        setStatus('Disconnected');
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus('Error');
      };

    } catch (error) {
      console.error('Error starting recording:', error);
      setStatus('Error');
    }
  };

 
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

 
  const playTextToSpeech = async (text) => {
    try {
      const response = await fetch('https://api.deepgram.com/v1/speech:synthesize', {
        method: 'POST',
        headers: {
          Authorization: 'Token 7374d7090286b0933306741ab40ec25db706165f', 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
  
    
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      const audioUrl = data.audio_url;
  
     
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
      } else {
        console.error('No audio URL returned from Deepgram.');
      }
    } catch (error) {
      console.error('Error fetching text-to-speech audio:', error);
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-700 to-gray-900 p-4">
      <div className="bg-white shadow-2xl rounded-xl p-8 max-w-lg w-full transform transition-all duration-500 scale-125">
        <p className="text-lg font-extrabold text-gray-700 mb-4" id="status">
          Status: {status}
        </p>
        <div className="bg-gray-100 p-4 rounded-lg h-40 overflow-y-auto mb-4 border-2 border-gray-300">
          <p id="transcript" className="text-gray-800 whitespace-pre-wrap">
            {transcript || 'Your transcript will appear here...'}
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg h-40 overflow-y-auto mb-4 border-2 border-gray-300">
          <p id="response" className="text-gray-800 whitespace-pre-wrap">
            {response || 'Response from GROQ will appear here...'}
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={startRecording}
            disabled={isRecording}
            className={`px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-full font-semibold transform transition-all duration-300 ${
              isRecording ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            }`}
          >
            Start Recording
          </button>
          <button
            onClick={stopRecording}
            disabled={!isRecording}
            className={`px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-full font-semibold transform transition-all duration-300 ${
              !isRecording ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            }`}
          >
            Stop Recording
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpeechToText;
