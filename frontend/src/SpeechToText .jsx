import React, { useState, useRef } from 'react';
import SpeechToTextUI from './SpeechToTextUI';
import axios from 'axios';

const SpeechToText = () => {
  const [status, setStatus] = useState('Not Connected');
  const [transcript, setTranscript] = useState('');
  const [responseText, setResponseText] = useState(''); 
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
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
              const newTranscript = message.channel.alternatives[0].transcript + ' ';
              setTranscript((prev) => prev + newTranscript);
  
              // Send to backend API
              const response = await axios.post('http://localhost:4000/api/generate-content', {
                transcript: newTranscript,
              });
  
              console.log('Response from API:', response.data); 

              
  
              // seted the response text
              const responseText = response.data.choices[0]?.message?.content;
              if (responseText) {
                setResponseText((prev) => prev + responseText + '\n');


                // audio from the response text
                await generateAudio(responseText);
              } else {
                console.error('Response content is undefined or empty');
              }
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

  const generateAudio = async (text) => {
    try {
      const response = await axios.post('http://localhost:4000/generate-audio', {
        text,
      }, { responseType: 'blob' });

      if (response.status === 200) {
        const audioBlob = response.data;
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
      } else {
        console.error('Error generating audio:', response.status);
      }
    } catch (error) {
      console.error('Error generating audio:', error);
    }
  };

  return (
    <SpeechToTextUI
      status={status}
      transcript={transcript}
      responseText={responseText} 
      isRecording={isRecording}
      startRecording={startRecording}
      stopRecording={stopRecording}
      audioUrl={audioUrl} 
    />
  );
};

export default SpeechToText;