import React from 'react'

import Chatleft from './Chatleft'
import Chatright from './Chatright'

const Chat = () => {
  return (
  <div className='h-screen w-full bg-zinc-800 flex item-center justify-center pt-5 pb-6 '>
   <div className='w-[99%] h-[99%] bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex border border-zinc-700'>
 
   <div className='w-2/5 border-r border-zinc-700'>
    <Chatleft/>
   </div>
   
    <div className='w-3/5'>
      <Chatright/>
    </div>

    </div>  
  

  </div>

  )
}

export default Chat