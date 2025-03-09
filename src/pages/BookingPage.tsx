import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Upload, AlertCircle, MapPin, Wifi, Coffee, Car, ThermometerSun, Trees, Waves, Snowflake } from 'lucide-react';
import axios from 'axios';
import { Room } from '../interfaces/Room';

// Static mapping of room IDs to owner photo filenames (60 rooms)
const ownerPhotos: { [key: string]: string } = {
  '67c6c6e10d8d583451a981': '/owner-photos/67c6c6e10d8d583451a981.jpg',
  '67c9700e8d583451a946': '/owner-photos/67c9700e8d583451a946.jpg',
  '67c9e0e8d583451a829': '/owner-photos/67c9e0e8d583451a829.jpg',
  '67c97290e8d583451a814': '/owner-photos/67c97290e8d583451a814.jpg',
  '67c9600e8d583451a80d': '/owner-photos/67c9600e8d583451a80d.jpg',
  '67c7a0e8d583451a87b': '/owner-photos/67c7a0e8d583451a87b.jpg',
  '67c8132e8d583504f3f93': '/owner-photos/67c8132e8d583504f3f93.jpg',
  '67cbaac0e8d583451a971': '/owner-photos/67cbaac0e8d583451a971.jpg',
  '67cba610e8d583451a967': '/owner-photos/67cba610e8d583451a967.jpg',
  '67cbad0e8d583451a95d': '/owner-photos/67cbad0e8d583451a95d.jpg',
  '67cbaf0e8d583451a953': '/owner-photos/67cbaf0e8d583451a953.jpg',
  '67cbbe0e8d583451aa49': '/owner-photos/67cbbe0e8d583451aa49.jpg',
  '67cbc20e8d583451aa3f': '/owner-photos/67cbc20e8d583451aa3f.jpg',
  '67cbc40e8d583451aa35': '/owner-photos/67cbc40e8d583451aa35.jpg',
  '67cbca0e8d583451aa2b': '/owner-photos/67cbca0e8d583451aa2b.jpg',
  '67cbcc0e8d583451aa21': '/owner-photos/67cbcc0e8d583451aa21.jpg',
  '67cbce0e8d583451aa17': '/owner-photos/67cbce0e8d583451aa17.jpg',
  '67cbd00e8d583451aa0d': '/owner-photos/67cbd00e8d583451aa0d.jpg',
  '67cbd20e8d583451aa03': '/owner-photos/67cbd20e8d583451aa03.jpg',
  '67cbd40e8d583451a9f9': '/owner-photos/67cbd40e8d583451a9f9.jpg',
  '67cbd60e8d583451a9ef': '/owner-photos/67cbd60e8d583451a9ef.jpg',
  '67cbd80e8d583451a9e5': '/owner-photos/67cbd80e8d583451a9e5.jpg',
  '67cbda0e8d583451a9db': '/owner-photos/67cbda0e8d583451a9db.jpg',
  '67cbdc0e8d583451a9d1': '/owner-photos/67cbdc0e8d583451a9d1.jpg',
  '67cbde0e8d583451a9c7': '/owner-photos/67cbde0e8d583451a9c7.jpg',
  '67cbe00e8d583451a9bd': '/owner-photos/67cbe00e8d583451a9bd.jpg',
  '67cbe20e8d583451a9b3': '/owner-photos/67cbe20e8d583451a9b3.jpg',
  '67cbe40e8d583451a9a9': '/owner-photos/67cbe40e8d583451a9a9.jpg',
  '67cbe60e8d583451a99f': '/owner-photos/67cbe60e8d583451a99f.jpg',
  '67cbe80e8d583451a995': '/owner-photos/67cbe80e8d583451a995.jpg',
  '67cbea0e8d583451a98b': '/owner-photos/67cbea0e8d583451a98b.jpg',
  '67cbec0e8d583451a981': '/owner-photos/67cbec0e8d583451a981.jpg',
  '67cbee0e8d583451a977': '/owner-photos/67cbee0e8d583451a977.jpg',
  '67cbf00e8d583451a96d': '/owner-photos/67cbf00e8d583451a96d.jpg',
  '67cbf20e8d583451a963': '/owner-photos/67cbf20e8d583451a963.jpg',
  '67cbf40e8d583451a959': '/owner-photos/67cbf40e8d583451a959.jpg',
  '67cbf60e8d583451a94f': '/owner-photos/67cbf60e8d583451a94f.jpg',
  '67cbf80e8d583451a945': '/owner-photos/67cbf80e8d583451a945.jpg',
  '67cbfa0e8d583451a93b': '/owner-photos/67cbfa0e8d583451a93b.jpg',
  '67cbfc0e8d583451a931': '/owner-photos/67cbfc0e8d583451a931.jpg',
  '67cbfe0e8d583451a927': '/owner-photos/67cbfe0e8d583451a927.jpg',
  '67cc000e8d583451a91d': '/owner-photos/67cc000e8d583451a91d.jpg',
  '67cc020e8d583451a913': '/owner-photos/67cc020e8d583451a913.jpg',
  '67cc040e8d583451a909': '/owner-photos/67cc040e8d583451a909.jpg',
  '67cc060e8d583451a8ff': '/owner-photos/67cc060e8d583451a8ff.jpg',
  '67cc080e8d583451a8f5': '/owner-photos/67cc080e8d583451a8f5.jpg',
  '67cc0a0e8d583451a8eb': '/owner-photos/67cc0a0e8d583451a8eb.jpg',
  '67cc0c0e8d583451a8e1': '/owner-photos/67cc0c0e8d583451a8e1.jpg',
  '67cc0e0e8d583451a8d7': '/owner-photos/67cc0e0e8d583451a8d7.jpg',
  '67cc100e8d583451a8cd': '/owner-photos/67cc100e8d583451a8cd.jpg',
  '67cc120e8d583451a8c3': '/owner-photos/67cc120e8d583451a8c3.jpg',
  '67cc140e8d583451a8b9': '/owner-photos/67cc140e8d583451a8b9.jpg',
  '67cc160e8d583451a8af': '/owner-photos/67cc160e8d583451a8af.jpg',
  '67cc180e8d583451a8a5': '/owner-photos/67cc180e8d583451a8a5.jpg',
  '67cc1a0e8d583451a89b': '/owner-photos/67cc1a0e8d583451a89b.jpg',
  '67cc1c0e8d583451a891': '/owner-photos/67cc1c0e8d583451a891.jpg',
  '67cc1e0e8d583451a887': '/owner-photos/67cc1e0e8d583451a887.jpg',
  '67cc200e8d583451a87d': '/owner-photos/67cc200e8d583451a87d.jpg',
  '67cc220e8d583451a873': '/owner-photos/67cc220e8d583451a873.jpg',
};

const BookingPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState<FileList | null>(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await axios.get(`https://api.homestaykashmir.com/api/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          withCredentials: true, // Ensure credentials are sent if needed
        });
        console.log('Room API response:', response.data); // Log the full response
        setRoom(response.data);
      } catch (error: any) {
        console.error('Failed to fetch room:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        setError(error.response?.data?.message || 'Failed to fetch room details');
      } finally {
        setLoading(false); // Ensure loading state is reset
      }
    };

    fetchRoom();
  }, [roomId]);

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await initializeRazorpay();
      if (!res) {
        setError('Razorpay SDK failed to load');
        return;
      }

      const orderResponse = await axios.post('https://api.homestaykashmir.com/api/payment/create-order', {
        amount: room?.price,
        roomId,
      });

      const options = {
        key: 'rzp_test_ycXpmqnI1Zr8rU', // Replace with your actual key
        amount: orderResponse.data.amount,
        currency: "INR",
        name: "HomeStay Kashmir",
        description: `Booking for ${room?.title}`,
        order_id: orderResponse.data.id,
        handler: async (response: any) => {
          try {
            const formData = new FormData();
            if (documents) {
              Array.from(documents).forEach(file => formData.append('documents', file));
            }
            formData.append('paymentId', response.razorpay_payment_id);
            formData.append('orderId', response.razorpay_order_id);
            formData.append('signature', response.razorpay_signature);

            await axios.post(`https://api.homestaykashmir.com/api/rooms/${roomId}/book`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });

            navigate('/transactions');
          } catch (error: any) {
            setError(error.response?.data?.message || 'Booking failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: "#4F46E5" },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Payment initialization failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ownerImage = roomId && ownerPhotos[roomId] ? ownerPhotos[roomId] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

        {/* Room Details Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">{room?.title}</h2>
          <div className="space-y-4">
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{room?.location?.lat && room?.location?.lng ? `${room.location.lat}, ${room.location.lng}` : 'Location unavailable'}</span>
            </div>
            <p className="text-gray-600">{room?.description || 'No description available'}</p>
            <div>
              <h3 className="text-lg font-medium mb-2">Amenities</h3>
              {room?.amenities?.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {room.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      {amenity === "wifi" && <Wifi className="h-5 w-5 mr-2 text-gray-500" />}
                      {amenity === "breakfast" && <Coffee className="h-5 w-5 mr-2 text-gray-500" />}
                      {amenity === "parking" && <Car className="h-5 w-5 mr-2 text-gray-500" />}
                      {amenity === "heater" && <ThermometerSun className="h-5 w-5 mr-2 text-gray-500" />}
                      {amenity === "lakeView" && <Snowflake className="h-5 w-5 mr-2 text-gray-500" />}
                      {amenity === "garden" && <Trees className="h-5 w-5 mr-2 text-gray-500" />}
                      {amenity === "swimmingPool" && <Waves className="h-5 w-5 mr-2 text-gray-500" />}
                      <span className="capitalize">{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No amenities listed</p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Nearby Places</h3>
              {room?.nearbyPlaces && (room.nearbyPlaces.hospital || room.nearbyPlaces.market || room.nearbyPlaces.tourist?.length > 0) ? (
                <ul className="list-disc list-inside text-gray-600">
                  <li>Hospital: {room.nearbyPlaces.hospital || 'N/A'}</li>
                  <li>Market: {room.nearbyPlaces.market || 'N/A'}</li>
                  <li>Tourist Spots: {room.nearbyPlaces.tourist?.length > 0 ? room.nearbyPlaces.tourist.join(', ') : 'N/A'}</li>
                </ul>
              ) : (
                <p className="text-gray-500">No nearby places listed</p>
              )}
            </div>
            <p><span className="font-medium">Price:</span> ₹{room?.price || 0}/night</p>
            <p><span className="font-medium">Furnished:</span> {room?.furnished ? 'Yes' : 'No'}</p>
            <p><span className="font-medium">AC:</span> {room?.ac ? 'Yes' : 'No'}</p>
            <p><span className="font-medium">Heater:</span> {room?.heater ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Owner Profile Section */}
        {room?.owner && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Hosted By</h2>
            <div className="flex items-center space-x-4">
              {ownerImage ? (
                <img
                  src={ownerImage}
                  alt={`${room.owner.name}'s profile`}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <span>{room.owner.name?.charAt(0) || 'N/A'}</span>
                </div>
              )}
              <div>
                <p className="text-lg font-medium">{room.owner.name || 'Unknown Host'}</p>
                <p className="text-gray-600">{room.owner.email || 'No email provided'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={handlePayment} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Documents</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                    <span>Upload files</span>
                    <input
                      type="file"
                      className="sr-only"
                      multiple
                      onChange={(e) => setDocuments(e.target.files)}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB each</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={!room || !user} // Disable if room or user is null
          >
            Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;