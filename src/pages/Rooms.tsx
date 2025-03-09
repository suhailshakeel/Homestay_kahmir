import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import RoomCard from '../components/rooms/RoomCard';
import { Room } from '../interfaces/Room';

// Create a global variable to persist across page navigations
declare global {
  interface Window {
    __pendingBookingRoomId__: string | null;
  }
}

// Initialize if not already set
if (typeof window.__pendingBookingRoomId__ === 'undefined') {
  window.__pendingBookingRoomId__ = null;
}

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Process any direct booking URLs before authentication check
  useEffect(() => {
    const processDirectBookingUrl = () => {
      const path = window.location.pathname;
      
      // If this is a direct booking URL
      if (path.startsWith('/book/')) {
        const roomId = path.split('/book/')[1];
        if (roomId) {
          // Store the room ID in the global variable
          window.__pendingBookingRoomId__ = roomId;
          
          // Also store in localStorage as backup
          localStorage.setItem('pendingBookingRoomId', roomId);
        }
      }
    };
    
    processDirectBookingUrl();
  }, []);

  // Check authentication status and handle pending bookings
  useEffect(() => {
    const checkAuthAndRedirect = () => {
      const userToken = localStorage.getItem('token');
      const isAuth = !!userToken;
      setIsAuthenticated(isAuth);

      // If user is authenticated, check for pending booking
      if (isAuth) {
        // Try to get the room ID from the global variable first
        let pendingRoomId = window.__pendingBookingRoomId__;
        
        // If not available, try localStorage as backup
        if (!pendingRoomId) {
          pendingRoomId = localStorage.getItem('pendingBookingRoomId');
        }
        
        if (pendingRoomId) {
          // Clear the stored values
          window.__pendingBookingRoomId__ = null;
          localStorage.removeItem('pendingBookingRoomId');
          
          // Redirect to the booking page
          navigate(`/book/${pendingRoomId}`);
        }
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

  // Handle booking a room through normal flow
  const handleBookRoom = (roomId: string) => {
    if (!isAuthenticated) {
      // Store the room ID before redirecting
      window.__pendingBookingRoomId__ = roomId;
      localStorage.setItem('pendingBookingRoomId', roomId);
      
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
