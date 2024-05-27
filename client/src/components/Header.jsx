import { FaSearch } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import clickSound from '../public/sound.mp3'; // Adjust the path as needed

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const audio = new Audio(clickSound);

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  const playClickSound = () => {
    audio.currentTime = 0; // Reset audio playback to the start
    audio.play();
  };

  return (
    <header className="bg-primary text-textPrimary shadow-lg">
      <div className="flex justify-between items-center max-w-6xl mx-auto py-4 px-6">
        <Link to="/" className="flex items-center space-x-2" onClick={playClickSound}>
          <h1 className="font-bold text-2xl text-accent">CasaVista</h1>
          <h1 className="font-bold text-2xl text-white">Realty</h1>
        </Link>
        <div className="flex items-center space-x-6">
          <Link 
            to="/" 
            className="text-white font-bold transition-colors"
            onClick={playClickSound}
          >
            <li className="list-none p-2 rounded-lg hover:border hover:border-accent">
              Home
            </li>
          </Link>
          <Link 
            to="/about" 
            className="text-white font-bold transition-colors"
            onClick={playClickSound}
          >
            <li className="list-none p-2 rounded-lg hover:border hover:border-accent">
              About
            </li>
          </Link>
          <form
            onSubmit={handleSubmit}
            className="flex items-center bg-gray-700 p-2 rounded-full shadow-inner"
          >
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-white placeholder-gray-400 focus:outline-none px-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="flex items-center justify-center p-2" onClick={playClickSound}>
              <FaSearch className="text-accent" />
            </button>
          </form>
          <Link to="/profile" className="flex items-center" onClick={playClickSound}>
            {currentUser ? (
              <img
                src={currentUser.avatar}
                alt="avatar"
                className="rounded-full h-8 w-8 object-cover border-2 border-accent"
              />
            ) : (
              <li className="list-none text-white hover:border hover:border-accent p-2 rounded-lg transition-colors">
                Sign In
              </li>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
