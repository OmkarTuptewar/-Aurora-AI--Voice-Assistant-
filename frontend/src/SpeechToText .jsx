import React, { useState, useRef } from 'react';

const SpeechToText = () => {
  const [status, setStatus] = useState('Not Connected');
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const socketRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      const socket = new WebSocket("ws://localhost:4000"); 
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus('Connected');
        mediaRecorder.start(1000);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        };
      };

      socket.onmessage = async (event) => {
        if (typeof event.data === 'object' && event.data instanceof Blob) {
        
          const text = await event.data.text();
          try {
            const message = JSON.parse(text);
            console.log('Message received from WebSocket:', message);
      
            if (message.channel && message.channel.alternatives[0].transcript) {
              setTranscript((prev) => prev + message.channel.alternatives[0].transcript + ' ');
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        } else {
          console.error('Unexpected message format:', event.data);
        }
      };
      socket.onclose = () => {
        setStatus('Disconnected');
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus('Error');
      };

      setIsRecording(true);
    } catch (error) {
      console.error('Error in startRecording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }
    setIsRecording(false);
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
