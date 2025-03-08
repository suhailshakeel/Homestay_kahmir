import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import RoomCard from '../components/rooms/RoomCard';
import { Room } from '../interfaces/Room';

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication and redirect system
  useEffect(() => {
    let isMounted = true;
    const BOOKING_REDIRECT_KEY = 'hs_booking_redirect';
    
    const processRedirects = () => {
      const token = localStorage.getItem('token');
      const storedPath = localStorage.getItem(BOOKING_REDIRECT_KEY);
      const currentPath = location.pathname;

      // Case 1: User arrived directly at booking page (not authenticated)
      if (!token && currentPath.startsWith('/book/')) {
        localStorage.setItem(BOOKING_REDIRECT_KEY, currentPath);
        navigate('/signin');
        return;
      }

      // Case 2: User returns authenticated with stored path
      if (token && storedPath) {
        if (isMounted) {
          localStorage.removeItem(BOOKING_REDIRECT_KEY);
          navigate(storedPath);
        }
        return;
      }

      // Case 3: User logged in but has no stored path
      if (token && currentPath === '/profile') {
        const initialPath = localStorage.getItem(BOOKING_REDIRECT_KEY) || '/rooms';
        if (initialPath !== currentPath) {
          navigate(initialPath);
        }
      }
    };

    // Immediate check on mount
    processRedirects();

    // Set up continuous monitoring
    const redirectInterval = setInterval(processRedirects, 300);
    
    return () => {
      isMounted = false;
      clearInterval(redirectInterval);
    };
  }, [navigate, location]);

  // Room data fetching
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await axios.get<Room[]>('https://api.homestaykashmir.com/api/rooms');
        setRooms(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading rooms');
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  const handleBookRoom = (roomId: string) => {
    const bookingPath = `/book/${roomId}`;
    const isAuthenticated = !!localStorage.getItem('token');

    if (!isAuthenticated) {
      localStorage.setItem('hs_booking_redirect', bookingPath);
      navigate('/signin');
    } else {
      navigate(bookingPath);
    }
  };

  // Loading and error states remain the same as previous versions
  // ...

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
