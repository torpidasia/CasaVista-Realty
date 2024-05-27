import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Contact = ({ listing }) => {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const res = await fetch(`/api/user/${listing.userRef}`);
        const data = await res.json();
        if (data.success === false) {
          return;
        }
        setLandlord(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchLandlord();
  }, [listing.userRef]);

  const onChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <div>
      {landlord && (
        <div className="flex flex-col gap-4 p-6 bg-secondary bg-opacity-90 rounded-lg shadow-lg">
          <p className="text-lg text-textPrimary">
            Contact <span className="font-semibold text-accent">{landlord.username}</span> for{" "}
            <span className="font-semibold text-accent">{listing.name.toLowerCase()}</span>
          </p>
          <textarea
            name="message"
            id="message"
            rows="4"
            value={message}
            onChange={onChange}
            placeholder="Enter your message here..."
            className="w-full p-4 border border-gray-700 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:border-accent text-white"
          ></textarea>
          <Link
            to={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${message}`}
            className="bg-buttonPrimary text-white text-center p-4 rounded-lg uppercase font-semibold border-2 border-accent hover:bg-buttonHover hover:opacity-95 transition-colors duration-300"
          >
            Send Message
          </Link>
        </div>
      )}
    </div>
  );
};

export default Contact;
