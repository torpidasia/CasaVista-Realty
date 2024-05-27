import { useNavigate, Link } from "react-router-dom";
import React, { useState } from "react";
import OAuth from "../components/OAuth";
import clickSound from '../public/sound.mp3'; // Adjust the path as needed

const SignUp = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // State for success message
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});

  const playClickSound = () => {
    const audio = new Audio(clickSound);
    audio.currentTime = 0; // Reset audio playback to the start
    audio.play();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    playClickSound();

    try {
      setLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!data.success) {
        setLoading(false);
        setError(data.message);
        return;
      }

      setLoading(false);
      setError(null);
      setSuccess(true); // Set success to true when signup is successful
      setTimeout(() => navigate("/sign-in"), 2000); // Navigate to sign-in after 2 seconds
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-primary text-textPrimary">
      <img
        src="https://source.unsplash.com/1600x900/?house,real-estate"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm"
      />
      <div className="relative z-10 p-6 max-w-lg w-full bg-secondary bg-opacity-90 rounded-lg shadow-lg">
        <h1 className="text-3xl text-center font-semibold mb-7 text-accent">Sign Up</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            className="border p-3 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:border-accent"
            id="username"
            onChange={handleChange}
          />
          <input
            type="email"
            placeholder="Email"
            className="border p-3 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:border-accent"
            id="email"
            onChange={handleChange}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-3 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:border-accent"
            id="password"
            onChange={handleChange}
          />
          <button
            className="bg-buttonPrimary text-white p-3 rounded-lg uppercase font-semibold hover:bg-buttonHover disabled:opacity-50 transition-colors duration-300"
            disabled={loading}
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>
          <OAuth />
        </form>
        <div className="flex gap-2 mt-5">
          <p>Have an account?</p>
          <Link to="/sign-in">
            <span className="text-accent hover:underline">Sign In</span>
          </Link>
        </div>
        {error && <p className="text-buttonDanger mt-3">{error}</p>}
        {success && <p className="text-green-500 mt-3">Signup successful! Redirecting to sign in...</p>} {/* Success message */}
      </div>
    </div>
  );
};

export default SignUp;
