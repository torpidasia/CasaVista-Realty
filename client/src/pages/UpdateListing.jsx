import { useEffect, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase.js";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const UpdateListing = () => {
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
  const params = useParams();  

  useEffect(() => {
    const fetchListing = async () => {
        const listingId = params.listingId;
        const res = await fetch(`/api/listing/get/${listingId}`);
        const data = await res.json();

        if (data.success === false) {
            console.log(data.message);
            return;
        }
        setFormData(data);
    };

    fetchListing();

  }, [params.listingId]);

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
    if (e.target.id === "sale" || e.target.id === "rent") {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }

    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (
      e.target.type === "number" ||
      e.target.type === "text" ||
      e.target.type === "textarea"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
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

      const res = await fetch(`/api/listing/update/${params.listingId}`, {
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
    <main className="min-h-screen p-6 bg-primary text-textPrimary">
      <div className="max-w-6xl mx-auto bg-secondary text-textPrimary rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-accent">
          Update Listing
        </h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              className="border border-gray-700 bg-gray-900 p-3 rounded-lg w-full text-white"
              id="name"
              maxLength="62"
              minLength="10"
              required
              onChange={handleChange}
              value={formData.name}
            />
            <textarea
              placeholder="Description"
              className="border border-gray-700 bg-gray-900 p-3 rounded-lg w-full text-white"
              id="description"
              required
              onChange={handleChange}
              value={formData.description}
            />
            <input
              type="text"
              placeholder="Address"
              className="border border-gray-700 bg-gray-900 p-3 rounded-lg w-full text-white"
              id="address"
              required
              onChange={handleChange}
              value={formData.address}
            />

            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sale"
                  className="w-6 h-6 accent-transparent border-2 border-accent"
                  onChange={handleChange}
                  checked={formData.type === "sale"}
                />
                <span>Sell</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rent"
                  className="w-6 h-6 accent-transparent border-2 border-accent"
                  onChange={handleChange}
                  checked={formData.type === "rent"}
                />
                <span>Rent</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="parking"
                  className="w-6 h-6 accent-transparent border-2 border-accent"
                  onChange={handleChange}
                  checked={formData.parking}
                />
                <span>Parking spot</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="furnished"
                  className="w-6 h-6 accent-transparent border-2 border-accent"
                  onChange={handleChange}
                  checked={formData.furnished}
                />
                <span>Furnished</span>
              </div>
              <div className="flex items-center gap-2">
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
                  className="p-4 border border-gray-700 bg-gray-900 rounded-lg w-full text-white"
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
                  className="p-4 border border-gray-700 bg-gray-900 rounded-lg w-full text-white"
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
                  className="p-4 border border-gray-700 bg-gray-900 rounded-lg w-full text-white"
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
                    className="p-4 border border-gray-700 bg-gray-900 rounded-lg w-full text-white"
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
          </div>

          <div className="space-y-4">
            <p className="font-semibold text-accent">
              Images:
              <span className="font-normal text-gray-400 ml-2">
                The first image will be the cover (max 6)
              </span>
            </p>
            <div className="flex gap-4">
              <input
                onChange={(e) => setFiles(e.target.files)}
                className="p-4 border border-gray-700 bg-gray-900 rounded w-full text-white"
                type="file"
                id="images"
                accept="image/*"
                multiple
              />
              <button
                disabled={uploading}
                onClick={handleImageSubmit}
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
                  className="flex justify-between p-3 border items-center bg-gray-900 rounded-lg"
                >
                  <img
                    src={url}
                    alt="listing"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-2 text-buttonDanger border border-buttonDanger rounded-lg uppercase hover:bg-buttonDanger hover:text-white transition-colors duration-300"
                  >
                    Delete
                  </button>
                </div>
              ))}
            <button
              disabled={loading || uploading}
              className="w-full p-4 bg-buttonPrimary text-white rounded-lg uppercase hover:bg-buttonHover disabled:opacity-80 transition-colors duration-300"
            >
              {loading ? "Updating..." : "Update Listing"}
            </button>
            {error && <p className="text-buttonDanger text-sm">{error}</p>}
          </div>
        </form>
      </div>
    </main>
  );
};

export default UpdateListing;
