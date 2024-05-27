import { useState } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import clickSound from '../public/sound.mp3'; // Adjust the path as needed

const CreateListing = () => {
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });

  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const playClickSound = () => {
    const audio = new Audio(clickSound);
    audio.currentTime = 0; // Reset audio playback to the start
    audio.play();
  };

  const handleImageSubmit = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError("Image upload failed. (2 mb max per image)");
          setUploading(false);
        });
    } else {
      setImageUploadError("You can only upload 6 images per listing");
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    const { id, type, value, checked } = e.target;
    if (id === "sale" || id === "rent") {
      setFormData((prevFormData) => ({ ...prevFormData, type: id }));
    } else if (["parking", "furnished", "offer"].includes(id)) {
      setFormData((prevFormData) => ({ ...prevFormData, [id]: checked }));
    } else {
      setFormData((prevFormData) => ({ ...prevFormData, [id]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError("You must upload at least one image");

      if (+formData.regularPrice < +formData.discountPrice)
        return setError("Discount price cannot be higher than regular price");

      setLoading(true);
      setError(false);

      const res = await fetch("/api/listing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });

      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
        return;
      }

      navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-primary text-textPrimary">
      <div className="absolute inset-0 w-full h-full bg-black opacity-50"></div>
      <div className="relative z-10 p-8 max-w-4xl w-full bg-secondary bg-opacity-90 rounded-lg shadow-lg">
        <h1 className="text-4xl text-center font-semibold mb-8 text-accent">Create Listing</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="text"
            placeholder="Name"
            className="border p-4 rounded-lg bg-secondary placeholder-gray-400 focus:outline-none focus:border-accent"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            type="text"
            placeholder="Description"
            className="border p-4 rounded-lg bg-secondary placeholder-gray-400 focus:outline-none focus:border-accent"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
            rows="5"
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-4 rounded-lg bg-secondary placeholder-gray-400 focus:outline-none focus:border-accent"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />

          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2 items-center">
              <input
                type="checkbox"
                id="sale"
                className="w-6 h-6 accent-transparent border-2 border-accent"
                onChange={handleChange}
                checked={formData.type === "sale"}
              />
              <span>Sell</span>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="checkbox"
                id="rent"
                className="w-6 h-6 accent-transparent border-2 border-accent"
                onChange={handleChange}
                checked={formData.type === "rent"}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="checkbox"
                id="parking"
                className="w-6 h-6 accent-transparent border-2 border-accent"
                onChange={handleChange}
                checked={formData.parking}
              />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="checkbox"
                id="furnished"
                className="w-6 h-6 accent-transparent border-2 border-accent"
                onChange={handleChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="checkbox"
                id="offer"
                className="w-6 h-6 accent-transparent border-2 border-accent"
                onChange={handleChange}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="p-4 border border-gray-300 rounded-lg bg-secondary placeholder-gray-400 focus:outline-none focus:border-accent"
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="p-4 border border-gray-300 rounded-lg bg-secondary placeholder-gray-400 focus:outline-none focus:border-accent"
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="50"
                max="10000000"
                required
                className="p-4 border border-gray-300 rounded-lg bg-secondary placeholder-gray-400 focus:outline-none focus:border-accent"
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p>Regular price</p>
              </div>
            </div>
            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  min="0"
                  max="10000000"
                  required
                  className="p-4 border border-gray-300 rounded-lg bg-secondary placeholder-gray-400 focus:outline-none focus:border-accent"
                  onChange={handleChange}
                  value={formData.discountPrice}
                />
                <div className="flex flex-col items-center">
                  <p>Discounted price</p>
                  {formData.type === "rent" && (
                    <span className="text-xs">(Rs / month)</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="font-semibold text-accent">Images:</p>
            <p className="font-normal text-textPrimary ml-2">
              The first image will be the cover (max 6)
            </p>
            <div className="flex gap-4">
              <input
                onChange={(e) => setFiles(e.target.files)}
                className="p-4 border border-gray-300 rounded-lg w-full bg-secondary placeholder-gray-400 focus:outline-none focus:border-accent"
                type="file"
                id="images"
                accept="image/*"
                multiple
              />
              <button
                disabled={uploading}
                onClick={(e) => {
                  handleImageSubmit(e);
                  playClickSound();
                }}
                type="button"
                className="p-4 text-accent border border-accent rounded-lg uppercase hover:bg-accent hover:text-secondary disabled:opacity-80 transition-colors duration-300"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
            <p className="text-buttonDanger text-sm">
              {imageUploadError && imageUploadError}
            </p>
            {formData.imageUrls.length > 0 &&
              formData.imageUrls.map((url, index) => (
                <div
                  key={url}
                  className="flex justify-between p-3 border items-center bg-secondary rounded-lg"
                >
                  <img
                    src={url}
                    alt="listing image"
                    className="w-20 h-20 object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleRemoveImage(index);
                      playClickSound();
                    }}
                    className="p-3 text-buttonDanger border border-buttonDanger rounded-lg uppercase hover:bg-buttonDanger hover:text-white transition-colors duration-300"
                  >
                    Delete
                  </button>
                </div>
              ))}
          </div>

          <button
            disabled={loading || uploading}
            onClick={playClickSound}
            className="p-4 bg-buttonPrimary text-white rounded-lg uppercase hover:bg-buttonHover disabled:opacity-80 transition-colors duration-300"
          >
            {loading ? "Creating..." : "Create Listing"}
          </button>
          {error && <p className="text-buttonDanger text-sm">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
