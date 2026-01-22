
import React from 'react';
import { TranslationStatus } from '../types';

interface ProgressProps {
  status: TranslationStatus;
}

const TranslationProgress: React.FC<ProgressProps> = ({ status }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8 p-6 bg-slate-800 rounded-xl shadow-xl border border-slate-700">
      <div className="flex justify-between mb-2 items-center">
        <span className="text-sm font-medium text-blue-400 flex items-center gap-2">
          {status.step !== 'completed' && status.step !== 'error' && (
            <i className="fa-solid fa-circle-notch fa-spin"></i>
          )}
          {status.message}
        </span>
        <span className="text-sm font-bold text-slate-300">{status.progress}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
        <div
          className="bg-blue-500 h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          style={{ width: `${status.progress}%` }}
        ></div>
      </div>
      <p className="mt-4 text-xs text-slate-500 italic text-center">
        ဗီဒီယို ဖိုင်အရွယ်အစားပေါ် မူတည်၍ ခဏစောင့်ဆိုင်းပေးပါ။
      </p>
    </div>
  );
};

export default TranslationProgress;
