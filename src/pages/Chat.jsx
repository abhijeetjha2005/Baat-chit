import React from 'react'

import Chatleft from './Chatleft'
import Chatright from './Chatright'

const Chat = () => {
  return (
  <div className='h-screen w-full bg-black flex items-center justify-center pt-5 pb-6 '>
   <div className='w-[99%] h-full bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex border border-zinc-700'>
 
   <div className='w-1/3 border-r border-zinc-700'>
    <Chatleft/>
   </div>
   
    <div className='w-2/3'>
      <Chatright/>
    </div>

    </div>  
  

  </div>

  )
}

export default Chat