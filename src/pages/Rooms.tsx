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

  useEffect(() => {
    const handleDirectBooking = () => {
      const pathMatch = location.pathname.match(/^\/book\/([a-f0-9]{24})$/i);
      if (pathMatch) {
        const roomId = pathMatch[1];
        const bookingIntent = {
          path: `/book/${roomId}`,
          search: location.search,
          timestamp: Date.now()
        };

        sessionStorage.setItem('bookingIntent', JSON.stringify(bookingIntent));
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
    };

    handleDirectBooking();
  }, [location, navigate]);

  const handleBookRoom = (roomId: string) => {
    const bookingIntent = {
      path: `/book/${roomId}`,
      search: window.location.search,
      timestamp: Date.now()
    };

    sessionStorage.setItem('bookingIntent', JSON.stringify(bookingIntent));
    sessionStorage.setItem('registrationRedirect', JSON.stringify(bookingIntent));
    
    navigate('/signin', { 
      state: { 
        from: {
          pathname: `/book/${roomId}`,
          search: window.location.search
        }
      } 
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Rooms</h1>
      {/* Render rooms here */}
    </div>
  );
};

export default Rooms;
