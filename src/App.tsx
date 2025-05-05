import React from 'react';
import { Header } from './components/Header';
import { RepoInput } from './components/RepoInput';
import { IndexingStatus } from './components/IndexingStatus';
import { ChatInterface } from './components/ChatInterface';

function App() {
  return (
    <div className="min-h-screen bg-light-100 dark:bg-dark-100 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header />
      
      <main className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Repository RAG Assistant
          </h1>
          <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-8">
            Chat with GitHub repositories
          </p>
          
          <RepoInput />
          <IndexingStatus />
          <ChatInterface />
        </div>
      </main>
      
      <footer className="py-6 bg-light-200 dark:bg-dark-200 mt-8 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {/* <p>GitRAG uses AI to help you understand GitHub repositories.</p> */}
          <p className="mt-2">
            Built with React, Tailwind CSS, FastAPI, and Qdrant.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;