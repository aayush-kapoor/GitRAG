import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { SendIcon, RotateCwIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { repoApi } from '../api';
import { useRepoStore } from '../store/repoStore';
import { ChatMessage } from './ChatMessage';
import { Button } from './ui/Button';

export function ChatInterface() {
  const [query, setQuery] = useState('');
  const { repository, messages, addMessage, isProcessing, setIsProcessing } = useRepoStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const queryMutation = useMutation({
    mutationFn: (query: string) => {
      if (!repository) throw new Error('No repository selected');
      return repoApi.queryRepo(repository.url, query);
    },
    onMutate: (query) => {
      addMessage({ role: 'user', content: query });
      setIsProcessing(true);
    },
    onSuccess: (data) => {
      addMessage({ role: 'assistant', content: data.answer });
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error('Failed to query repository:', error);
      addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.'
      });
      setIsProcessing(false);
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !repository || repository.indexingStatus !== 'completed') return;
    
    queryMutation.mutate(query);
    setQuery('');
  };
  
  // Don't show the chat until indexing is completed
  if (!repository || repository.indexingStatus !== 'completed') return null;
  
  return (
    <div className="w-full max-w-3xl mx-auto mb-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-light-200 dark:bg-dark-200 rounded-xl shadow-md overflow-hidden flex flex-col h-[600px]"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Repository Q&A
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ask questions about the code in this repository
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-light-100 dark:bg-dark-100">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="mb-4 p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                <svg 
                  className="w-8 h-8 text-primary-600 dark:text-primary-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Ask your first question
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                Ask anything about the repository's code, structure, or functionality. The AI will analyze the codebase and provide an answer.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isProcessing && (
                <div className="flex items-center justify-center py-4">
                  <div className="px-4 py-2 bg-gray-100 dark:bg-dark-300 rounded-full flex items-center">
                    <RotateCwIcon className="h-4 w-4 text-primary-500 animate-spin mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Processing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        <div className="p-4 bg-light-200 dark:bg-dark-200 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about the repository..."
              className="flex-1 rounded-md px-4 py-2 bg-white dark:bg-dark-300 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-light-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
              disabled={isProcessing}
            />
            
            <Button
              type="submit"
              disabled={!query.trim() || isProcessing}
              className="p-2"
            >
              <SendIcon className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}