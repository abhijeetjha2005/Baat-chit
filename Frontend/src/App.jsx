import React from 'react'
import { BrowserRouter as Router, Routes,Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import SignUp from './pages/SignUp'
import Otp from './components/Otp'
import Chat from './pages/Chat'
import Forgot from'./components/Forgot'


const App = () => {
  return (
    <div className="App"> 
 <Router>
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/signup" element={<SignUp />} />
    <Route path="/otp" element={<Otp />} />
    <Route path="/chat" element={<Chat />} />
    <Route path="forgot-password"
    element={<Forgot />} />
  </Routes>
 </Router>
    </div>
  )
}

export default App