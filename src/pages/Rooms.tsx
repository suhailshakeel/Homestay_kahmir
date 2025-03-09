import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import RoomCard from '../components/rooms/RoomCard';
import { Room } from '../interfaces/Room';
import { useAuth } from '../contexts/AuthContext';

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleDirectBooking = () => {
      const match = location.pathname.match(/^\/book\/([a-f0-9]{24})$/i);
      if (match) {
        const roomId = match[1];

        if (!isAuthenticated) {
          sessionStorage.setItem('redirectAfterLogin', `/book/${roomId}`);
          navigate('/signin', { state: { from: `/book/${roomId}` }, replace: true });
        } else {
          navigate(`/book/${roomId}`);
        }
      }
    };

    handleDirectBooking();
  }, [location, navigate, isAuthenticated]);

  const handleBookRoom = (roomId: string) => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', `/book/${roomId}`);
      navigate('/signin', { state: { from: `/book/${roomId}` } });
    } else {
      navigate(`/book/${roomId}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Rooms</h1>
      {/* Render RoomCard components here */}
    </div>
  );
};

export default Rooms;
