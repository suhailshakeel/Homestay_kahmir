import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LatLng } from 'leaflet';
import axios from 'axios';
import AmenitiesSection from '../components/create-ad/AmenitiesSection';
import NearbyPlacesSection from '../components/create-ad/NearbyPlacesSection';
import LocationPicker from '../components/create-ad/LocationPicker';
import ImageUpload from '../components/create-ad/ImageUpload';

interface NearbyPlace {
  available: boolean;
  distance?: number;
}

const CreateAd = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [roomCount, setRoomCount] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());
  const [nearbyPlaces, setNearbyPlaces] = useState<Record<string, NearbyPlace>>({});
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length < 4) {
      toast.error('Please upload at least 4 images');
      return;
    }

    if (!selectedLocation) {
      toast.error('Please select a location on the map');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('roomCount', roomCount);
      formData.append('amenities', JSON.stringify(Array.from(selectedAmenities)));
      formData.append('nearbyPlaces', JSON.stringify(nearbyPlaces));
      formData.append('location', JSON.stringify({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng
      }));

      images.forEach(image => {
        formData.append('images', image);
      });

      await axios.post('https://homestaykashmir.onrender.com/api/ads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Ad submitted for verification successfully');
      navigate('/profile');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create ad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Ad</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price per Night</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Room Count</label>
              <input
                type="number"
                value={roomCount}
                onChange={(e) => setRoomCount(e.target.value)}
                required
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <AmenitiesSection
          selectedAmenities={selectedAmenities}
          onToggleAmenity={(amenityId) => {
            const newAmenities = new Set(selectedAmenities);
            if (newAmenities.has(amenityId)) {
              newAmenities.delete(amenityId);
            } else {
              newAmenities.add(amenityId);
            }
            setSelectedAmenities(newAmenities);
          }}
        />

        <NearbyPlacesSection
          nearbyPlaces={nearbyPlaces}
          onUpdateNearbyPlace={(placeId, data) => {
            setNearbyPlaces(prev => ({
              ...prev,
              [placeId]: data
            }));
          }}
        />

        <LocationPicker
          selectedLocation={selectedLocation}
          onLocationSelect={setSelectedLocation}
        />

        <ImageUpload
          images={images}
          onImagesChange={setImages}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Ad for Verification'}
        </button>
      </form>
    </div>
  );
};

export default CreateAd;