import React from 'react';
import { Loader2 } from 'lucide-react';
import ui from '../../constants/ui.json';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = ui.feedback.loading }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <span className="text-xs font-medium">{message}</span>
    </div>
  );
};
