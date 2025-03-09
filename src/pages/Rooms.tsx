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

  // Check authentication and handle redirects
  useEffect(() => {
    const checkAuth = () => {
      const userToken = localStorage.getItem('token'); // Assuming token is stored in localStorage
      setIsAuthenticated(!!userToken);
      
      // If user is authenticated, check if there's a pending room booking
      if (userToken) {
        const pendingBookingRoom = localStorage.getItem('pendingBookingRoom');
        if (pendingBookingRoom) {
          localStorage.removeItem('pendingBookingRoom'); // Clear the pending booking
          navigate(`/book/${pendingBookingRoom}`);
        }
      }
    };
    checkAuth();
  }, [navigate]);

  // Handle direct booking links
  useEffect(() => {
    // Check if the URL contains a direct booking path like /book/67cb2eac7fd46cb0714bb320
    const path = location.pathname;
    if (path.startsWith('/book/')) {
      const roomId = path.split('/book/')[1];
      if (roomId) {
        handleBookRoom(roomId);
      }
    }
  }, [location.pathname]);

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
    if (!isAuthenticated) {
      // Store the room ID to redirect after authentication
      localStorage.setItem('pendingBookingRoom', roomId);
      navigate('/signin');
      return;
    }
    navigate(`/book/${roomId}`);
  };

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
            <RoomCard key={room._id} room={room} onBook={() => handleBookRoom(room._id)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;
