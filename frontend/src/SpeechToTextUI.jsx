import React from 'react';

const SpeechToTextUI = ({
  status,
  transcript,
  responseText,
  isRecording,
  startRecording,
  stopRecording,
  audioUrl, 
}) => {
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
          <p id="responseText" className="text-gray-800 whitespace-pre-wrap">
            {responseText || 'Generated response will appear here...'}
          </p>
        </div>
        {audioUrl && (
          <div className="mb-4">
            <audio src={audioUrl} controls autoPlay />
          </div>
        )}
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

export default SpeechToTextUI;
