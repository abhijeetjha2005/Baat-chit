import React from 'react';
import Logo1 from './Logo1';

const Ai = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="सखा AI Assistant"
      title="सखा"
      className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-700 
                 hover:border-purple-500 hover:bg-purple-950/20 
                 text-zinc-400 hover:text-purple-400 
                 transition-all duration-300 shadow-md 
                 flex items-center justify-center cursor-pointer 
                 group relative outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
    >
      <div className="group-hover:scale-110 transition-transform duration-300">
        <Logo1 />
      </div>

      {/* Active pulse indicator badge */}
      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-400 rounded-full animate-pulse pointer-events-none" />
    </button>
  );
};

export default Ai;