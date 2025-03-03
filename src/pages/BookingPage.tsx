import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Upload, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { Room } from '../interfaces/Room';

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
        const response = await axios.get(`https://api.homestaykashmir.com/api/rooms/${roomId}`);
        setRoom(response.data);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch room details');
      } finally {
        setLoading(false);
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

      // Create order on your backend
      const orderResponse = await axios.post('https://api.homestaykashmir.com/api/payment/create-order', {
        amount: room?.price,
        roomId
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
            // Create booking with payment details
            const formData = new FormData();
            if (documents) {
              Array.from(documents).forEach(file => {
                formData.append('documents', file);
              });
            }
            formData.append('paymentId', response.razorpay_payment_id);
            formData.append('orderId', response.razorpay_order_id);
            formData.append('signature', response.razorpay_signature);

            await axios.post(`https://api.homestaykashmir.com/api/rooms/${roomId}/book`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });

            navigate('/transactions');
          } catch (error: any) {
            setError(error.response?.data?.message || 'Booking failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email
        },
        theme: {
          color: "#4F46E5"
        }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Room Details</h2>
          <div className="space-y-4">
            <p><span className="font-medium">Title:</span> {room?.title}</p>
            <p><span className="font-medium">Price:</span> ₹{room?.price}/night</p>
            <p><span className="font-medium">Location:</span> {room?.location.lat}, {room?.location.lng}</p>
          </div>
        </div>

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
                <p className="text-xs text-gray-500">
                  PDF, JPG, PNG up to 10MB each
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
