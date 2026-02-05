
import React from 'react';

interface ComparisonBarProps {
  count: number;
  onOpen: () => void;
  onClear: () => void;
}

const ComparisonBar: React.FC<ComparisonBarProps> = ({ count, onOpen, onClear }) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-slate-900/90 backdrop-blur-md text-white px-6 py-4 rounded-[2rem] shadow-2xl flex items-center space-x-6 border border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-500/30">
            {count}
          </div>
          <div>
            <p className="text-sm font-black tracking-tight">Properties to Compare</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Select up to 4</p>
          </div>
        </div>
        
        <div className="h-8 w-px bg-white/10"></div>
        
        <div className="flex space-x-3">
          <button 
            onClick={onOpen}
            className="bg-white text-slate-900 px-6 py-2.5 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all shadow-xl"
          >
            Compare Now
          </button>
          <button 
            onClick={onClear}
            className="text-slate-400 hover:text-white px-3 py-2.5 font-bold text-sm transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonBar;
