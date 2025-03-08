import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RoomCard from '../components/rooms/RoomCard';
import { Room } from '../interfaces/Room';

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userToken = localStorage.getItem('token');
    setIsAuthenticated(!!userToken);

    // If user just logged in, check if they should be redirected
    if (userToken) {
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin'); // Clear after use
        navigate(redirectUrl);
      }
    }
  }, [navigate]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get<Room[]>('https://api.homestaykashmir.com/api/rooms');
        setRooms(response.data);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleBookRoom = (roomId: string) => {
    const bookingPageUrl = `/book/${roomId}`;
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', bookingPageUrl); // Use sessionStorage instead
      navigate('/signin');
    } else {
      navigate(bookingPageUrl);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Rooms</h1>
      {loading ? (
        <p>Loading rooms...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : rooms.length === 0 ? (
        <p>No rooms available.</p>
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
