import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { GithubIcon as GitHubIcon, RotateCwIcon } from 'lucide-react';
import { repoApi } from '../api';
import { useRepoStore } from '../store/repoStore';
import { Button } from './ui/Button';

export function RepoInput() {
  const [repoUrl, setRepoUrl] = useState('');
  const { repository, setRepository, updateIndexingStatus } = useRepoStore();
  
  const indexMutation = useMutation({
    mutationFn: repoApi.indexRepo,
    onSuccess: (data) => {
      setRepository({
        url: repoUrl,
        indexingStatus: 'indexing',
        progress: 0,
      });
      
      // Start polling for status updates
      const pollInterval = setInterval(async () => {
        try {
          const status = await repoApi.getIndexingStatus(data.task_id);
          
          updateIndexingStatus(
            status.status as 'indexing' | 'completed' | 'failed',
            status.progress,
            status.error
          );
          
          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error('Failed to get indexing status:', error);
          clearInterval(pollInterval);
          updateIndexingStatus('failed', 0, 'Failed to get indexing status');
        }
      }, 1000); // Poll every second instead of every 2 seconds
    },
    onError: (error) => {
      console.error('Failed to index repository:', error);
      updateIndexingStatus('failed', 0, 'Failed to start indexing');
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    
    // Validate URL format
    if (!repoUrl.includes('github.com')) {
      updateIndexingStatus('failed', 0, 'Please enter a valid GitHub repository URL');
      return;
    }
    
    indexMutation.mutate(repoUrl);
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto mb-8 px-4">
      <form 
        onSubmit={handleSubmit}
        className="bg-light-200 dark:bg-dark-200 rounded-xl p-6 shadow-md transition-all duration-300"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-light-100">
          Enter a GitHub Repository
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <GitHubIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            
            <input
              type="text"
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-full rounded-md pl-10 pr-4 py-3 bg-white dark:bg-dark-300 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-light-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
              disabled={indexMutation.isPending || repository?.indexingStatus === 'indexing'}
            />
          </div>
          
          <Button
            type="submit"
            disabled={indexMutation.isPending || repository?.indexingStatus === 'indexing' || !repoUrl.trim()}
            className="whitespace-nowrap"
          >
            {indexMutation.isPending ? (
              <>
                <RotateCwIcon className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Process Repository'
            )}
          </Button>
        </div>
        
        {indexMutation.isError && (
          <div className="mt-4 px-4 py-2 bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-100 rounded-md text-sm">
            Failed to submit repository. Please try again.
          </div>
        )}
      </form>
    </div>
  );
}