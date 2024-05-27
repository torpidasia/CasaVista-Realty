import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signInStart, signInSuccess, signInFailure } from "../redux/user/userSlice.js";
import OAuth from "../components/OAuth.jsx";
import clickSound from '../public/sound.mp3'; // Adjust the path as needed

const SignIn = () => {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      dispatch(signInStart());
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      console.log("API response:", data); // Log API response

      if (!data._id) { // Check if _id is present in the response
        dispatch(signInFailure(data.message || "Login failed"));
        return;
      }

      dispatch(signInSuccess(data));
      console.log("Login successful, navigating to home page"); // Log for successful login
      navigate("/");
    } catch (error) {
      dispatch(signInFailure(error.message));
      console.error("Error during login:", error); // Log error during login
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-primary text-textPrimary"
      style={{
        backgroundImage: `url('https://source.unsplash.com/1600x900/?house,real-estate')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-10 p-6 max-w-lg w-full bg-secondary bg-opacity-90 rounded-lg shadow-lg">
        <h1 className="text-3xl text-center font-semibold mb-7 text-accent">Sign In</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="border p-4 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:border-accent text-white"
            id="email"
            onChange={handleChange}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-4 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:border-accent text-white"
            id="password"
            onChange={handleChange}
          />
          <button
            disabled={loading}
            className="bg-buttonPrimary text-white p-4 rounded-lg uppercase font-semibold hover:bg-buttonHover disabled:opacity-50 w-full transition-colors duration-300"
          >
            {loading ? "Loading..." : "Sign In"}
          </button>
          <OAuth />
        </form>
        <div className="text-center mt-4">
          <p className="text-textPrimary">
            Don't have an account?{" "}
            <Link to="/sign-up" className="text-accent hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
        {error && <p className="text-buttonDanger mt-3 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default SignIn;
