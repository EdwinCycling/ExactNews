import React from 'react';
import { Language } from '../types';

interface ProgressBarProps {
  progress: number;
  language: Language;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, language }) => {
  return (
    <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2.5 my-4 overflow-hidden">
      <div
        className="bg-teal-400 h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={language === 'nl' ? 'Laadvoortgang' : 'Loading progress'}
      ></div>
    </div>
  );
};

export default ProgressBar;