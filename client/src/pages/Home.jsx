import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import ListingItem from '../components/ListingItem';
import clickSound from '../public/sound.mp3'; // Adjust the path as needed

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const resOffer = await fetch('/api/listing/get?offer=true&limit=4');
        const resRent = await fetch('/api/listing/get?type=rent&limit=4');
        const resSale = await fetch('/api/listing/get?type=sale&limit=4');
        
        const dataOffer = await resOffer.json();
        const dataRent = await resRent.json();
        const dataSale = await resSale.json();

        setOfferListings(dataOffer);
        setRentListings(dataRent);
        setSaleListings(dataSale);
      } catch (error) {
        console.log(error);
      }
    };

    fetchListings();
  }, []);

  const playClickSound = () => {
    const audio = new Audio(clickSound);
    audio.currentTime = 0; // Reset audio playback to the start
    audio.play();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-secondary text-textPrimary">
      <div className="p-10 text-center">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">Find Your Next Perfect Place with Ease</h1>
          <p className="text-lg lg:text-xl mb-4">CasaVista Realty is the best place to find your next perfect place to live. We have a wide range of properties for you to choose from.</p>
          <Link to='/search' className='mt-4 inline-block bg-accent text-primary px-6 py-3 rounded-lg font-bold hover:bg-textSecondary transition duration-300' onClick={playClickSound}>Let's get started...</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-10">
        <h2 className="text-2xl font-semibold text-center mb-6">Featured Listings</h2>
        <Swiper
          spaceBetween={50}
          slidesPerView={1}
          navigation
          autoplay={{ delay: 3000 }}
        >
          {offerListings.map((listing) => (
            <SwiperSlide key={listing._id}>
              <div
                style={{ backgroundImage: `url(${listing.imageUrls[0]})`, height: '500px', backgroundSize: 'cover', backgroundPosition: 'center' }}
                className="flex items-end p-4"
              >
                <div className="bg-secondary bg-opacity-90 p-4 rounded-lg">
                  <h3 className="text-xl font-bold">{listing.title}</h3>
                  <p>{listing.description}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="max-w-6xl mx-auto p-5">
        <div className='my-5'>
          <h2 className='text-2xl font-semibold text-textPrimary'>Recent Offers</h2>
          <Link to='/search?offer=true' className='text-sm text-accent font-semibold hover:text-textSecondary' onClick={playClickSound}>Show more offers</Link>
        </div>
        <div className='flex flex-wrap gap-4'>
          {offerListings.map((listing) => (
            <ListingItem listing={listing} key={listing._id} />
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-5">
        <div className='my-5'>
          <h2 className='text-2xl font-semibold text-textPrimary'>Recent Places for Rent</h2>
          <Link to='/search?type=rent' className='text-sm text-accent font-semibold hover:text-textSecondary' onClick={playClickSound}>Show more places for rent</Link>
        </div>
        <div className='flex flex-wrap gap-4'>
          {rentListings.map((listing) => (
            <ListingItem listing={listing} key={listing._id} />
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-5">
        <div className='my-5'>
          <h2 className='text-2xl font-semibold text-textPrimary'>Recent Places for Sale</h2>
          <Link to='/search?type=sale' className='text-sm text-accent font-semibold hover:text-textSecondary' onClick={playClickSound}>Show more places for sale</Link>
        </div>
        <div className='flex flex-wrap gap-4'>
          {saleListings.map((listing) => (
            <ListingItem listing={listing} key={listing._id} />
          ))}
        </div>
      </div>
    </div>
  );
}
