import React from 'react'
import { BrowserRouter as Router, Routes,Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import SignUp from './pages/SignUp'
import Otp from './components/Otp'

const App = () => {
  return (
    <div className="App"> 
 <Router>
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/signup" element={<SignUp />} />
    <Route path="/otp" element={<Otp />} />
  </Routes>
 </Router>
    </div>
  )
}

export default App