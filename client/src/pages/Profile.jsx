import { useSelector } from "react-redux";
import { useRef, useState, useEffect } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserFailure,
  deleteUserSuccess,
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice.js";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import clickSound from '../public/sound.mp3'; // Adjust the path as needed

const Profile = () => {
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [showListings, setShowListings] = useState(false);
  const dispatch = useDispatch();
  const audio = new Audio(clickSound);

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch(`/api/auth/signout`);
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
      setShowListings(true);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(error.message);
        return;
      }
      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));
    } catch (error) {
      console.log(error.message);
    }
  };

  const playClickSound = () => {
    audio.currentTime = 0; // Reset audio playback to the start
    audio.play();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-primary text-textPrimary">
      <div className="relative z-10 p-8 max-w-6xl w-full bg-secondary bg-opacity-90 rounded-lg shadow-lg flex flex-col lg:flex-row gap-8">
        <div className={`flex-1 transition-all duration-500 ${showListings ? "lg:w-1/2" : "lg:w-full"}`}>
          <h1 className="text-4xl text-center font-semibold mb-8">Profile</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 rounded-lg bg-secondary shadow-md">
            <input
              onChange={(e) => setFile(e.target.files[0])}
              type="file"
              ref={fileRef}
              hidden
              accept="image/*"
            />
            <div className="flex items-center justify-center">
              <img
                onClick={() => {
                  playClickSound();
                  fileRef.current.click();
                }}
                src={formData.avatar || currentUser.avatar}
                alt="profile"
                className="rounded-full h-28 w-28 object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
              />
            </div>
            <p className="text-center text-sm mt-2">
              {fileUploadError ? (
                <span className="text-buttonDanger">
                  Error: Image upload (image must be less than 2 MB)
                </span>
              ) : filePerc > 0 && filePerc < 100 ? (
                <span className="text-gray-500">{`Uploading ${filePerc}%`}</span>
              ) : filePerc === 100 ? (
                <span className="text-green-500">Image successfully uploaded!</span>
              ) : null}
            </p>
            <input
              type="text"
              placeholder="Username"
              id="username"
              defaultValue={currentUser.username}
              onChange={handleChange}
              className="border p-4 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:border-accent"
            />
            <input
              type="text"
              placeholder="Email"
              id="email"
              defaultValue={currentUser.email}
              onChange={handleChange}
              className="border p-4 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:border-accent"
            />
            <input
              type="password"
              placeholder="Password"
              onChange={handleChange}
              id="password"
              className="border p-4 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:border-accent"
            />
            <button
              onClick={playClickSound}
              disabled={loading}
              className="bg-buttonPrimary text-white p-4 rounded-lg uppercase font-semibold hover:bg-buttonHover disabled:opacity-50 transition-colors duration-300"
            >
              {loading ? "Loading..." : "Update"}
            </button>
            <Link
              onClick={playClickSound}
              className="bg-buttonPrimary text-white p-4 rounded-lg uppercase text-center font-semibold hover:bg-buttonHover transition-colors duration-300"
              to="/create-listing"
            >
              Create Listing
            </Link>
            <button
              onClick={() => {
                playClickSound();
                handleShowListings();
              }}
              className="bg-buttonPrimary text-white p-4 rounded-lg uppercase font-semibold hover:bg-buttonHover transition-colors duration-300 mt-4"
            >
              Show Listings
            </button>
          </form>
          <div className="flex justify-between mt-6">
            <button
              onClick={() => {
                playClickSound();
                handleDeleteUser();
              }}
              className="border border-buttonDanger text-buttonDanger p-3 rounded-lg uppercase font-semibold hover:bg-buttonDanger hover:text-white transition-colors duration-300"
            >
              Delete Account
            </button>
            <button
              onClick={() => {
                playClickSound();
                handleSignOut();
              }}
              className="border border-buttonWarning text-buttonWarning p-3 rounded-lg uppercase font-semibold hover:bg-buttonWarning hover:text-white transition-colors duration-300"
            >
              Sign Out
            </button>
          </div>
          {error && <p className="text-buttonDanger mt-6">{error}</p>}
          {updateSuccess && (
            <p className="text-green-500 mt-6">Profile updated successfully!</p>
          )}
          {showListingsError && (
            <p className="text-buttonDanger mt-4">Error showing listings</p>
          )}
        </div>
        {showListings && (
          <>
            <div className="w-px bg-gray-300 h-full hidden lg:block"></div>
            <div className="flex-1 transition-all duration-500 lg:w-1/2">
              <h2 className="text-3xl text-center font-semibold mb-6">Your Listings</h2>
              <div className="flex flex-col gap-4">
                {userListings && userListings.length > 0 ? (
                  userListings.map((listing) => (
                    <div key={listing._id} className="border rounded-lg p-4 flex justify-between items-center gap-4 bg-secondary shadow-md">
                      <Link to={`/listing/${listing._id}`}>
                        <img
                          src={listing.imageUrls[0]}
                          alt="listing cover"
                          className="h-20 w-20 object-contain rounded-lg"
                        />
                      </Link>
                      <Link
                        className="text-textPrimary font-semibold hover:underline truncate flex-1"
                        to={`/listing/${listing._id}`}
                      >
                        <p>{listing.name}</p>
                      </Link>
                      <div className="flex flex-col items-center gap-2">
                        <button
                          onClick={() => {
                            playClickSound();
                            handleListingDelete(listing._id);
                          }}
                          className="border border-buttonDanger text-buttonDanger p-3 rounded-lg uppercase font-semibold hover:bg-buttonDanger hover:text-white transition-colors duration-300"
                        >
                          Delete
                        </button>
                        <Link to={`/update-listing/${listing._id}`}>
                          <button className="border border-cyan-500 text-cyan-500 p-3 rounded-lg uppercase font-semibold hover:bg-cyan-500 hover:text-white transition-colors duration-300">
                            Edit
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-textSecondary">No listings found</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
