
import React from 'react'
import {useState,useEffect} from 'react'
import Ai from '../components/Ai'

const Friends = () =>{
 // 1. Create a state to hold the real users coming from your landing page/database
  const [friendsList,setFriendList]=useState([])
  const [loading ,setLoading]=useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(()=>{
    // 2. Later, you'll fetch the users who registered on your landing page
    // Example: fetch('/api/users')
    // For now, we simulate pulling the data you collected (Name, Email, Phone)
    const fetchedUsers = [
      { id: "u1", name: "Sarah Connor", email: "sarah@gmail.com", phone: "+123456", status: "Online" },
      { id: "u2", name: "John Doe", email: "john@gmail.com", phone: "+987654", status: "Offline" }
    ];
    setFriendList(fetchedUsers)
    setLoading(false)
  },[])

  // 3. Live filter by name or email as they type in your search bar!
const filteredFriends =friendsList.filter(friend=>
  friend.name.toLowerCase().includes(searchTerm.toLowerCase())||friend.email.toLowerCase().includes(searchTerm.toLowerCase())
) 
if(loading){
  return (<div className="text-zinc-500 text-center py-4 text-xs">
    Loading contacts...
  </div>
  )
}

  return (
   <div>
    <h2 className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-emerald-400/90">
      Friends
    </h2>
     <div className='space-y-1'>
      {filteredFriends.map((friend)=>(
      <div key={friend.id} className='flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-700/50 cursor-pointer group'>
  {/* Automatically generate avatar using the NAME collected from your landing page */}
    <div className='relative'>
    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(friend.name)}`} 
    alt={friend.name}
     className='w-11 h-11 rounded-full bg-zinc-700'
     />
     <span
     className={`absolute bottom-0 right-0 w-3 h-3 rounded-full  border-2 border-zinc-800 ${
      friend.status === 'Online' ? 'bg-emerald-500' :  'bg-zinc-500'
     }  `}
     
     />
    </div>
     <div className='flex-1 min-w-0'>
     <h4 className='text-sm font-medium text-zinc-200 group-hover:text-white truncate'>
      {friend.name}
     </h4>
     {/* Showing a glimpse of their registered email or phone status */}
     <p className='text-xs text-zinc-500 truncate'>
      {friend.email}
     </p>
     </div>

      </div>
      ))}
   <div className="absolute bottom-20  left-70">
    <Ai />
  </div>
    </div>
   </div>
  )
}

export default Friends