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

  // Authentication and redirect logic
  useEffect(() => {
    const checkAuthAndRedirect = () => {
      const userToken = localStorage.getItem('token');
      const storedRedirect = localStorage.getItem('bookingRedirect');
      
      // Check if user just logged in and has a stored redirect
      if (userToken && storedRedirect) {
        localStorage.removeItem('bookingRedirect');
        navigate(storedRedirect);
        return;
      }

      // Update authentication state
      setIsAuthenticated(!!userToken);

      // Store current path if it's a booking page and user isn't authenticated
      if (!userToken && location.pathname.startsWith('/book/')) {
        localStorage.setItem('bookingRedirect', location.pathname);
      }
    };

    checkAuthAndRedirect();
  }, [navigate, location]);

  // Fetch rooms data
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

  // Booking handler with redirect logic
  const handleBookRoom = (roomId: string) => {
    const bookingPath = `/book/${roomId}`;
    
    if (!isAuthenticated) {
      localStorage.setItem('bookingRedirect', bookingPath);
      navigate('/signin');
      return;
    }
    navigate(bookingPath);
  };

  // Loading state
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

  // Error state
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

  // Main render
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
