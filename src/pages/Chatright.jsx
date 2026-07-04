import React, {useRef, useState }from "react";
import {Send,Camera,Mic,FolderOpen,Paperclip} from 'lucide-react'

const Chatright=()=>{
  const fileInputRef=useRef(null)
  const CameraInputref =useRef(null)
  const [message,setMessage]=useState('')
  // handlers
  const handleFolderClick=()=>fileInputRef.current?.click()
  const hanleCameraClick=()=>CameraInputRef.current?.click()

}
export default ChatRight;