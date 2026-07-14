import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Otp = ({ onResend }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const formData = location.state || {};
  useEffect(() => {
  if (!location.state) {
    navigate("/signup");
  }
}, []);

  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(new Array(6).fill(""));

  const inputRefs = useRef([]);

  // Auto focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);


  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);

    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };


  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };


  const handlePaste = (e) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;


    const newOtp = pastedData
      .split("")
      .concat(new Array(6 - pastedData.length).fill(""));

    setOtp(newOtp);


    const lastIndex = Math.min(
      pastedData.length - 1,
      5
    );

    inputRefs.current[lastIndex]?.focus();
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpString = otp.join("");

    if (otpString.length !== 6) {
      alert("Enter complete OTP");
      return;
    }


    setLoading(true);

    try {

      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        {
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          otp: otpString,
        }
      );


      if (response.data.success) {
        alert("Registration Successful");
        navigate("/chat");
      }


    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Something went wrong"
      );

    } finally {

      setLoading(false);

    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-black flex items-center justify-center p-4 sm:p-6">

      <div className="max-w-md w-full text-center">

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">


          <div className="text-center">

            <h2 className="text-2xl font-semibold text-white mb-2">
              Enter OTP
            </h2>


            <p className="text-zinc-400 text-sm">
              We've sent a 6-digit verification code to
            </p>


            <p className="text-emerald-400 font-medium mt-1 break-all">
              {formData.email}
            </p>

          </div>



          <form onSubmit={handleSubmit} className="space-y-8">


            <div className="flex justify-center gap-2 sm:gap-4">

              {otp.map((digit, index) => (

                <input
                  key={index}

                  ref={(el) =>
                    (inputRefs.current[index] = el)
                  }

                  type="text"

                  inputMode="numeric"

                  maxLength={1}

                  value={digit}

                  onChange={(e)=>
                    handleChange(index,e.target.value)
                  }

                  onKeyDown={(e)=>
                    handleKeyDown(index,e)
                  }

                  onPaste={handlePaste}


                  className="
                  w-11 h-14 sm:w-12 sm:h-16
                  text-center text-3xl font-semibold
                  bg-zinc-800
                  border border-zinc-700
                  rounded-2xl
                  text-white
                  focus:outline-none
                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-500/30
                  transition-all
                  "

                />

              ))}

            </div>



            <button

              type="submit"

              disabled={
                loading ||
                otp.join("").length !== 6
              }


              className="
              w-full py-4
              bg-emerald-500
              hover:bg-emerald-600
              disabled:opacity-70
              disabled:cursor-not-allowed
              text-white
              font-semibold
              rounded-2xl
              transition-all
              "

            >

              {
                loading
                ? "Verifying..."
                : "Verify OTP"
              }


            </button>


          </form>



          <div className="text-center">

            <button

              onClick={onResend}

              disabled={loading}

              className="
              text-emerald-400
              hover:text-emerald-500
              text-sm
              font-medium
              "

            >
              Resend OTP

            </button>

          </div>


        </div>

      </div>

    </div>
  );
};


export default Otp;
