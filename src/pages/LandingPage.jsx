import React from 'react';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate=useNavigate();
  return (
    <div className='min-h-screen bg-gradient-to-br from-zinc-950 to-black flex items-center justify-center p-6'>
      <div className='max-w-md w-full text-center'>
        {/* logo area */}
       
           <Logo/>
       
        {/* title */}
        <h1 className='text-5xl font-bold text-white mb-3 tracking-tight'>बात-चीत</h1>
        <p className='text-zinc-400 text-lg mb-12'>Connect with friends instantly</p>
        {/* login */}
        <div className='bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-3xl p-8'>
        <h2 className='text-2xl text-white font-semibold mb-6'>Sign In</h2>
        <form className='space-y-5'>
          <input type="email"
          placeholder='E-mail'
          className='w-full px-5 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:outline-none focus:border-emerald-500'
          />
          <input type="password"
           placeholder='Password'
           className='w-full px-5 py-4 bg-zinc-800 border border-zinc-700 text-white font-semibold rounded-2xl transition'
          />
          <button 
          className='w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-2xl transition'>
            Sign In
          </button>
        </form>
        {/* sign up */}
        <div className='mt-6 text-sm text-zinc-400'>
          Don't have an account?{' '}
          <button 
          onClick={()=>navigate('/signup')}
          className='text-emerald-400 hover:text-emerald-500 font-medium transition-colors hover:underline'>
            Sign Up
          </button>
        </div>
        </div>
      </div>

   </div>
  );
}

export default LandingPage;