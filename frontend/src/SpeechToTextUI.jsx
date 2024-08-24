import React from "react";

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
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-animated p-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl p-7">
          <span className="block">
            <span className="text-transparent bg-clip-text bg-gradient-to-tr to-cyan-500 from-blue-600">
              Aurora AI
            </span>
          </span>
        </h1>

        <div className="cyber-grid bg-white shadow-lg rounded-lg p-8 max-w-4xl w-full h-[80vh] overflow-auto transition-transform transform hover:scale-105">
          <p className="text-xl font-bold text-gray-800 mb-4" id="status">
            Status: {status}
          </p>
          <div className="bg-gray-100 p-4 rounded-lg h-48 overflow-y-auto mb-4 border border-gray-300">
            <p id="transcript" className="text-gray-800 whitespace-pre-wrap">
              {transcript || "Transcript will appear here..."}
            </p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg h-48 overflow-y-auto mb-4 border border-gray-300">
            <p id="responseText" className="text-gray-800 whitespace-pre-wrap">
              {responseText || "Generated response will appear here..."}
            </p>
          </div>
          {audioUrl && (
            <div className="mb-4">
              <audio src={audioUrl} controls autoPlay  className="w-full" />
            </div>
          )}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={startRecording}
              disabled={isRecording}
              className={`px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-full font-semibold transition-transform transform ${
                isRecording
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105"
              }`}
            >
              Start Recording
            </button>
            <button
              onClick={stopRecording}
              disabled={!isRecording}
              className={`px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-full font-semibold transition-transform transform ${
                !isRecording
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105"
              }`}
            >
              Stop Recording
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SpeechToTextUI;
