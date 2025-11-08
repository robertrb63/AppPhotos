
import React, { useState } from 'react';
import ImageAnalyzer from './components/ImageAnalyzer';
import Chatbot from './components/Chatbot';
import { ImageIcon, MessageSquareIcon } from './components/Icons';

type Tab = 'analyzer' | 'chatbot';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('analyzer');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analyzer':
        return <ImageAnalyzer />;
      case 'chatbot':
        return <Chatbot />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tabName: Tab; label: string; icon: React.ReactNode }> = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition-all duration-300 ease-in-out focus:outline-none ${
        activeTab === tabName
          ? 'bg-blue-600 text-white scale-105 shadow-lg shadow-blue-600/30'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-xl p-4 border-b border-gray-700">
        <h1 className="text-3xl font-bold text-center text-white font-orbitron tracking-wider">
          <span className="text-blue-400">App</span>Photo AI
        </h1>
        <p className="text-center text-gray-400 text-sm mt-1">Intelligent Document & Photo Analysis</p>
      </header>
      
      <main className="flex-grow p-4 md:p-6 lg:p-8 flex flex-col">
        <div className="w-full max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl flex-grow flex flex-col overflow-hidden border border-gray-700">
            <div className="flex">
                <div className="w-1/2">
                    <TabButton tabName="analyzer" label="Document Analyzer" icon={<ImageIcon className="w-5 h-5" />} />
                </div>
                <div className="w-1/2">
                    <TabButton tabName="chatbot" label="AI Chatbot" icon={<MessageSquareIcon className="w-5 h-5" />} />
                </div>
            </div>
            <div className="flex-grow p-6 overflow-y-auto">
                {renderTabContent()}
            </div>
        </div>
      </main>

       <footer className="text-center p-4 text-gray-500 text-xs">
          Powered by Gemini API & React. Designed with a futuristic vision.
      </footer>
    </div>
  );
};

export default App;
