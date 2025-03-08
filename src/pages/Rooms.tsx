import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import RoomCard from '../components/rooms/RoomCard';
import { Room } from '../interfaces/Room';

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication and handle redirect from stored booking URL
  useEffect(() => {
    const checkAuthAndRedirect = () => {
      const userToken = localStorage.getItem('token'); // Assuming token is stored in localStorage
      const storedBookingUrl = localStorage.getItem('intendedBookingUrl'); // Check for stored URL

      setIsAuthenticated(!!userToken);

      // If authenticated and there's a stored booking URL, redirect to it
      if (userToken && storedBookingUrl) {
        localStorage.removeItem('intendedBookingUrl'); // Clear the stored URL after use
        navigate(storedBookingUrl);
      }
    };

    checkAuthAndRedirect();
  }, [navigate]);

  // Fetch available rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get<Room[]>('https://api.homestaykashmir.com/api/rooms');
        setRooms(response.data);
      } catch (error: any) {
        console.error('Error fetching rooms:', error);
        setError(error.response?.data?.message || 'Failed to fetch rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Handle booking a room
  const handleBookRoom = (roomId: string) => {
    const bookingPath = `/book/${roomId}`;

    if (!isAuthenticated) {
      // Store the intended booking URL in localStorage before redirecting to sign-in
      localStorage.setItem('intendedBookingUrl', bookingPath);
      navigate('/signin');
      return;
    }

    // If authenticated, go directly to the booking page
    navigate(bookingPath);
  };

  // Check if the user accessed a direct booking URL
  useEffect(() => {
    const checkDirectBookingLink = () => {
      const currentPath = location.pathname; // e.g., "/book/67cb2eac7fd46cb0714bb320"
      if (currentPath.startsWith('/book/') && !isAuthenticated) {
        // Store the direct booking URL and redirect to sign-in
        localStorage.setItem('intendedBookingUrl', currentPath);
        navigate('/signin');
      }
    };

    checkDirectBookingLink();
  }, [location.pathname, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p className="text-xl">Error loading rooms</p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Rooms</h1>
      {rooms.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No rooms available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              onBook={() => handleBookRoom(room._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;
