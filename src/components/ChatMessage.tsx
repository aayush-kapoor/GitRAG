import { UserIcon, ServerIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '../store/repoStore';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { role, content } = message;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 mb-6 ${
        role === 'user' ? 'flex-row' : 'flex-row'
      }`}
    >
      <div className={`flex-shrink-0 ${
        role === 'user' ? 'bg-primary-100 dark:bg-primary-900' : 'bg-secondary-100 dark:bg-secondary-900'
      } p-2 rounded-full h-10 w-10 flex items-center justify-center`}>
        {role === 'user' ? (
          <UserIcon className="h-5 w-5 text-primary-700 dark:text-primary-300" />
        ) : (
          <ServerIcon className="h-5 w-5 text-secondary-700 dark:text-secondary-300" />
        )}
      </div>
      
      <div className="flex-1">
        <div className={`rounded-lg px-4 py-3 ${
          role === 'user' 
            ? 'bg-primary-50 dark:bg-dark-300 text-gray-800 dark:text-light-100' 
            : 'bg-white dark:bg-dark-200 border border-gray-200 dark:border-dark-400 text-gray-800 dark:text-light-100'
        }`}>
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-gray-100 dark:bg-dark-400 rounded px-1 py-0.5 text-sm font-mono">
                    {children}
                  </code>
                );
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}