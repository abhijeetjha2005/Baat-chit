import React, { useState } from 'react'
import Friends from '../pages/Friends'
import {Search} from 'lucide-react'


const Chatleft = () => {
  const [searchTerm,setSearchTerm]=useState("")
   const [isFocused, setIsFocused] = useState(false)

  return (
 <div className='h-full p-4 bg-zinc-900'>
<div className='h-full w-full bg-zinc-800 rounded-2xl border border-zinc-700 shadow-lg'>
<div className='p-4 border-b border-zinc-700'>
  <div className='relative flex items-center' >
 
  <input 
  type="text" 
  placeholder='Search...'
  value={searchTerm}
  onChange={(e)=>setSearchTerm(e.target.value)}
  onFocus={() => setIsFocused(true)}
  onBlur={() =>setIsFocused(false)}
 className='w-full bg-zinc-900 border border-zinc-700 rounded-xl py-3 pl-4 pr-12 text-white placeholder-zinc-500 outline-none transition-all duration-300 focus:border-zinc-500'
 />
  <div className='absolute right-4 pointer-events-none'>
    <Search
     size={20}
     className={`text-zinc-400 transition-all duration-300 ${
      isFocused?"text-zinc-200 scale-110":""
     }`}
    />
  </div>
  </div>
</div>
     <Friends/>
</div>
 </div>
  )
}

export default Chatleft