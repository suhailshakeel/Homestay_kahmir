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

  // Handle direct booking URLs and authentication state
  useEffect(() => {
    const handleDirectBooking = () => {
      const pathMatch = location.pathname.match(/^\/book\/([a-f0-9]{24}$)/i);
      if (pathMatch) {
        const roomId = pathMatch[1];
        if (roomId) {
          // Store booking intent in session storage
          sessionStorage.setItem('bookingIntent', JSON.stringify({
            path: `/book/${roomId}`,
            search: location.search,
            timestamp: Date.now()
          }));
          
          // Redirect to login with preserved state
          navigate('/signin', {
            state: {
              from: {
                pathname: `/book/${roomId}`,
                search: location.search
              }
            },
            replace: true
          });
        }
      }
    };

    handleDirectBooking();
  }, [location, navigate]);

  // Handle normal room booking flow
  const handleBookRoom = (roomId: string) => {
    const bookingIntent = {
      path: `/book/${roomId}`,
      search: window.location.search,
      timestamp: Date.now()
    };

    // Store booking intent in session storage
    sessionStorage.setItem('bookingIntent', JSON.stringify(bookingIntent));
    
    navigate('/signin', {
      state: {
        from: {
          pathname: `/book/${roomId}`,
          search: window.location.search
        }
      }
    });
  };

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
