import React,{useState} from "react";
import axios from "axios"
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const LandingPage = () => {
  const navigate = useNavigate();

const[formData,setFormData]=useState({
email:"",
password:""
})

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const handleChange =(e)=>{
  setFormData({
    ...formData,
    [e.target.name]:e.target.value,
})
}

const handleSubmit= async(e)=>{
  e.preventDefault();
  setError("");
  try{
setLoading(true)
const response=await axios.post
(
  "http://localhost:3000/api/auth/login",
{
email:formData.email,
password:formData.password,
  }
)
if (response.data.message === "Login successful") {
      navigate("/chat");
}
  }catch(error){
    setError(
      error.response?.data?.message||"login Failed"
    )
  }finally {
    setLoading(false);
  }
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950 flex items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md text-center">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tighter">
          बात-चीत
        </h1>

        <p className="mt-3 text-zinc-400 text-base sm:text-lg max-w-xs mx-auto">
          Connect with friends instantly
        </p>

        {/* Sign In Card */}
        <div className="mt-10 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
          
          <h2 className="text-2xl font-semibold text-white mb-8">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              className="w-full px-5 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl 
                         text-white placeholder-zinc-500 focus:outline-none 
                         focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-5 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl 
                         text-white placeholder-zinc-500 focus:outline-none 
                         focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />


{error && (
  <p className="text-red-500 text-sm text-center">
    {error}
  </p>
)}
            <button
              type="submit"
                disabled={loading}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 
                         text-white font-semibold rounded-2xl transition-all duration-200 text-base"
            >
           {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
{/* forget password */}
<div className="text-right">
  <button
    type="button"
    onClick={() => navigate("/forgot-password")}
    className="text-sm text-emerald-400 hover:text-emerald-500 hover:underline transition"
  >
    Forgot Password?
  </button>
</div>


          {/* Sign Up Link */}
          <div className="mt-8 text-sm text-zinc-400">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-emerald-400 hover:text-emerald-500 font-medium hover:underline transition"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Optional Footer Text */}
        <p className="text-xs text-zinc-500 mt-8">
          Secure • Private • Instant
        </p>
      </div>
    </div>
  );
};

export default LandingPage;