import React from 'react'
import Logo1 from './Logo1'

const Ai = ({onClick}) => {
  return (

    <button
     onClick={onClick}
     className='p-1 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-purple-500 hover:bg-purple-950/20 text-zinc-400 hover:text-purple-400 transition-all duration-300 shadow-md flex items-center justify-center cursor-pointer group relative outline-none'
     title="सखा "
    >
      <div className="group-hover:scale-110 transition-transform duration-300">
      <Logo1/>
    </div>
    <span
    className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-400 rounded-full animate-pulse"
    />
    </button>
  )
}

export default Ai