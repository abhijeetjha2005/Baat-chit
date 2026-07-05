import React, {useRef, useState }from "react";
import {Send,Camera,Mic,FolderOpen,Paperclip} from 'lucide-react'
import { div } from "framer-motion/client";

const Chatright=()=>{
  const fileInputRef=useRef(null)
  const CameraInputref =useRef(null)
  const [message,setMessage]=useState('')
  // handlers
  const handleFolderClick=()=>fileInputRef.current?.click()
  const handleCameraClick=()=>CameraInputRef.current?.click()
 
  const handleFileChange=(e)=>{
    const files=e.target.files;
    if(files && files.length>0){
      console.log("Fetched files from system",files);
    }
    e.target.value='';
  }
  const handleSend =()=>{
    if(message.trim()){
      console.log("Message sent:",message);
      setMessage('');
    }
  }
  const  handleKeyDown =(e)=>{
    if(e.key==='Enter' && !e.shiftKey){
      e.preventDefault();
      handleSend();
    }
  }

  return (
 <div className="h-full p-4 bg-zinc-900 flex items-end">
  <div className="w-full bg-zinc-800 rounded-2xl border border-zinc-700 shadow-lg p-3">
<input type="file"
ref={fileInputRef}
className="hidden"
multiple onChange={handleFileChange}
/>

<input 
 type="file"
 ref={CameraInputref}
 className="hidden"
 accept="image/*,video/*"
 onChange={handleFileChange}
/>
  <div className="flex items-end gap-3 bg-zinc-900 rounded-xl border border-zinc-700/50  focus-within:bg-zinc-600 p-2"> 
    <div className="flex items-center gap-1 text-zinc-400">
     <button
     type="button"
     onClick={handleFolderClick}
     className="p-2  hover:text-zinc-200 hover:bg-zinc-800
      rounded-lg transition-colors"
      title="Attach files"
     >
      <FolderOpen size={20}/>
     </button>
     
      <button
       type="button"
       onClick={handleCameraClick}
       className="p-2 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
       title="Take photo/video"
      >
       <Camera size={20}/>
      </button>
       <button
       type="button"
       className="p-2 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
       title="Voice Message"
       >
      <Mic size={20}/>
       </button>
    </div>
    <textarea 
      value={message}
      onChange={(e)=>setMessage(e.target.value)}
      onKeyDown={handleKeyDown}
      rows="1"
      placeholder="Type a message..."
      className="flex-1 bg-transparent text-zinc-200 placeholder-zinc-500 text-sm resize-none max-h-32 py-3 px-2 focus:outline-none "
    />
    <button 
    onClick={handleSend}
    disabled={!message.trim()}
    className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-xl transition-all active:scale-95"
    >
      <Send size={20}/>
    </button>
  </div>

  </div>

 </div>



  )

}
export default Chatright;