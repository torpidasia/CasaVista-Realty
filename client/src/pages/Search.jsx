import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ListingItem from '../components/ListingItem';
import clickSound from '../public/sound.mp3'; // Adjust the path as needed

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    type: 'all',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'created_at',
    order: 'desc',
  });
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);

  const playClickSound = () => {
    const audio = new Audio(clickSound);
    audio.currentTime = 0; // Reset audio playback to the start
    audio.play();
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTerm = urlParams.get('searchTerm') || '';
    const type = urlParams.get('type') || 'all';
    const parking = urlParams.get('parking') === 'true';
    const furnished = urlParams.get('furnished') === 'true';
    const offer = urlParams.get('offer') === 'true';
    const sort = urlParams.get('sort') || 'created_at';
    const order = urlParams.get('order') || 'desc';

    setSidebarData({ searchTerm, type, parking, furnished, offer, sort, order });

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      const searchQuery = urlParams.toString();
      const res = await fetch(`/api/listing/get?${searchQuery}`);
      const data = await res.json();
      if (data.length > 8) setShowMore(true);
      setListings(data);
      setLoading(false);
    };

    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value, checked, type } = e.target;
    setSidebarData((prevData) => ({
      ...prevData,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    playClickSound();
    const urlParams = new URLSearchParams(sidebarData);
    navigate(`/search?${urlParams.toString()}`);
  };

  const onShowMoreClick = async () => {
    playClickSound();
    const startIndex = listings.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const searchQuery = urlParams.toString();
    const res = await fetch(`/api/listing/get?${searchQuery}`);
    const data = await res.json();
    if (data.length < 9) setShowMore(false);
    setListings((prevListings) => [...prevListings, ...data]);
  };

  return (
    <div className='min-h-screen bg-gray-800 text-white'>
      <div className='p-6 max-w-4xl mx-auto bg-gray-900 bg-opacity-90 rounded-lg shadow-lg'>
        <h1 className='text-3xl text-center font-semibold mb-7'>Listing Search</h1>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='flex items-center gap-2'>
            <label htmlFor='searchTerm' className='font-semibold text-accent'>
              Search Term:
            </label>
            <input
              type='text'
              id='searchTerm'
              placeholder='Search...'
              className='border p-3 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:border-accent'
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className='flex gap-2 flex-wrap items-center'>
            <label className='font-semibold text-accent'>Type:</label>
            {['all', 'rent', 'sale'].map((type) => (
              <div key={type} className='flex gap-2'>
                <input
                  type='radio'
                  id={type}
                  name='type'
                  className='w-6 h-6 accent-transparent border-2 border-accent'
                  checked={sidebarData.type === type}
                  onChange={() => setSidebarData({ ...sidebarData, type })}
                />
                <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </div>
            ))}
          </div>
          <div className='flex gap-2 flex-wrap items-center'>
            <label className='font-semibold text-accent'>Amenities:</label>
            {['parking', 'furnished'].map((amenity) => (
              <div key={amenity} className='flex gap-2'>
                <input
                  type='checkbox'
                  id={amenity}
                  className='w-6 h-6 accent-transparent border-2 border-accent'
                  checked={sidebarData[amenity]}
                  onChange={handleChange}
                />
                <span>{amenity.charAt(0).toUpperCase() + amenity.slice(1)}</span>
              </div>
            ))}
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='offer'
                className='w-6 h-6 accent-transparent border-2 border-accent'
                checked={sidebarData.offer}
                onChange={handleChange}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <label htmlFor='sort_order' className='font-semibold text-accent'>
              Sort:
            </label>
            <select
              id='sort_order'
              className='border p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:border-accent'
              value={`${sidebarData.sort}_${sidebarData.order}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('_');
                setSidebarData((prevData) => ({
                  ...prevData,
                  sort,
                  order,
                }));
              }}
            >
              <option value='regularPrice_desc'>Price high to low</option>
              <option value='regularPrice_asc'>Price low to high</option>
              <option value='created_at_desc'>Latest</option>
              <option value='created_at_asc'>Oldest</option>
            </select>
          </div>
          <button type='submit' className='bg-accent text-secondary p-3 rounded-lg uppercase hover:bg-buttonHover'>
            Search
          </button>
        </form>
      </div>
      <div className='p-7'>
        <h1 className='text-3xl text-center font-semibold mt-5 text-accent mb-8'>Listing Results</h1>
        <div className='flex flex-wrap gap-4'>
          {loading && <p className='text-xl text-accent text-center w-full'>Loading...</p>}
          {!loading && listings.length === 0 && <p className='text-xl text-accent'>No listings found!</p>}
          {!loading &&
            listings.map((listing) => <ListingItem key={listing._id} listing={listing} />)}
          {showMore && (
            <button
              onClick={onShowMoreClick}
              className='text-accent hover:underline p-7 text-center w-full'
            >
              Show more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
