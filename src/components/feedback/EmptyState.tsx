import React from 'react';
import { FolderOpen } from 'lucide-react';
import ui from '../../constants/ui.json';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = ui.feedback.emptyTitle,
  description = ui.feedback.emptyDescription,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
        <FolderOpen className="w-6 h-6" />
      </div>
      <span className="text-sm font-semibold text-slate-700 mb-1">{title}</span>
      <span className="text-xs text-slate-500 max-w-sm">{description}</span>
    </div>
  );
};
