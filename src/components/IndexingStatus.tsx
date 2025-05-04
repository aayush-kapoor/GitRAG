import { RotateCwIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRepoStore } from '../store/repoStore';

export function IndexingStatus() {
  const { repository } = useRepoStore();
  
  if (!repository) return null;
  
  const { indexingStatus, progress, error } = repository;
  
  if (indexingStatus === 'idle') return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full max-w-3xl mx-auto mb-8 px-4"
    >
      <div className="bg-light-200 dark:bg-dark-200 rounded-xl p-6 shadow-md">
        <div className="flex items-center mb-4">
          {indexingStatus === 'indexing' && (
            <RotateCwIcon className="h-6 w-6 text-primary-500 animate-spin mr-3" />
          )}
          
          {indexingStatus === 'completed' && (
            <CheckCircleIcon className="h-6 w-6 text-success-500 mr-3" />
          )}
          
          {indexingStatus === 'failed' && (
            <XCircleIcon className="h-6 w-6 text-error-500 mr-3" />
          )}
          
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {indexingStatus === 'indexing' && 'Processing Repository'}
            {indexingStatus === 'completed' && 'Repository Processed Successfully'}
            {indexingStatus === 'failed' && 'Repository Processing Failed'}
          </h3>
        </div>
        
        {indexingStatus === 'indexing' && (
          <div className="mb-4">
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-semibold inline-block text-primary-600 dark:text-primary-400">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-primary-200 dark:bg-dark-300">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                />
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              This may take a few minutes depending on the repository size.
            </p>
          </div>
        )}
        
        {indexingStatus === 'completed' && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You can now ask questions about the repository in the chat below.
          </p>
        )}
        
        {indexingStatus === 'failed' && error && (
          <p className="text-sm text-error-600 dark:text-error-400">
            {error}
          </p>
        )}
      </div>
    </motion.div>
  );
}