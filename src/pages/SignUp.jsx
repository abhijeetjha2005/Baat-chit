import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';


const SignUp = () => {
  const navigate=useNavigate();
   
  const [formData,setFormData]=useState({
    fullName:'',
    email:'',
    password:'',
    confirmPassword:''
  });
const [showPassword,setShowPassword]=useState(false);
const [showConfirmPassword,setShowConfirmPassword]=useState(false)

const handleChange=(e)=>{
  setFormData({...formData,[e.target.name]:e.target.value});
}
const handleSubmit=(e) =>{
  e.preventDefault();
  if(formData.password!==formData.confirmPassword){
    alert("Password do not match!")
  }
  console.log("Sign Up Data",formData);
  alert("🎉🎉Contratulations 🎉🎉")
  
}
  return (
   <div className='min-h-screen bg-gradient-to-br from-zinc-950 to-black flex items-center justify-center p-6'>
      <div className='max-w-md w-full text-center '>
    <Logo/>
    <h1 className='text-5xl font-bold text-white mb-3 tracking-tight'>बात-चीत</h1>
    <p className='text-zinc-400 text-lg mb-8'> Create your account</p>

    <div className='bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-3xl p-8'>
     <h2 className='text-2xl text-white font-semibold mb-6'>Sign Up</h2>

     <form onSubmit={handleSubmit} className='space-y-5'>
      <input type="text" name="fullName" 
      placeholder='Full name'
      value={formData.fullName}
      onChange={handleChange}
      className='w-full px-5 py-4 bg-zinc-800 border-zinc-700
      rounded-2xl text-white placeholder:text-zinc-500 focus:outline-none focus-emerald-500 transition'
      required
      />
      <input type="email" name="email" 
      placeholder='E-mail'
      value={formData.email}
      onChange={handleChange}
      className='w-full px-5 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition'
      required
      />
      <div className='relative'>
        <input 
        type={showPassword ?"text":"password"}
        name="password"
        placeholder='Password'
        value={formData.password}
        onChange={handleChange}
        className='w-full px-5 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition'
        required
        />
        <button
         type='button'
         onClick={()=>setShowPassword(!showPassword)}
         className='absolute right-4 top-4 text-zinc-400 hover:text-white text-sm'
        >
         {showPassword?"Hide":"Show"}
        </button>
      </div>
      <div className='relative'>
        <input type={showConfirmPassword?"text":"password"}
         name="confirmPassword"
         placeholder='Confirm Password'
         value={formData.confirmPassword}
         onChange={handleChange}
         className='w-full px-5 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition'
         required
        />
        <button 
        type='button'
        onClick={() =>setShowConfirmPassword(!showConfirmPassword)}
        className="absolute right-4 top-4 text-zinc-400 hover:text-white text-sm"
              
        >
          {showConfirmPassword ? "Hide" : "Show"}
        </button> 
      </div>
      <button type='submit'
      className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold rounded-2xl transition-all duration-200"
      >
        Create Account
      </button>
     </form>
    </div>
      </div>
    </div>
  )
}

export default SignUp