import React, { useState } from 'react';
import { CheckCircle, MapPin } from 'lucide-react';

const LocationSelectionModal = ({ locations, onClose, onConfirm, title = "Select Locations", confirmText = "Confirm" }) => {
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [checkmark, setCheckmark] = useState(['post', 'photo']); // Default to both selected
  
    const handleCheckmarkChange = (option) => {
      setCheckmark(prev =>
        prev.includes(option)
          ? prev.filter(item => item !== option)
          : [...prev, option]
      );
    };
  
    const getPayload = () => {
      const hasPost = checkmark.includes('post');
      const hasPhoto = checkmark.includes('photo');
  
      if (hasPost && hasPhoto) return 'both';
      if (hasPost) return 'post';
      if (hasPhoto) return 'photo';
  
      return 'post'; // Default to 'post' if nothing is selected
    };
  
    const toggleLocation = (locationId) => {
      setSelectedLocations(prev =>
        prev.includes(locationId)
          ? prev.filter(id => id !== locationId)
          : [...prev, locationId]
      );
    };
  
    const handleSelectAll = () => {
      if (selectedLocations.length === locations.length) {
        setSelectedLocations([]); // Deselect all
      } else {
        setSelectedLocations(locations.map(loc => loc.id)); // Select all
      }
    };

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl 
       w-full max-w-2xl
       max-h-[70vh]            /* 🔥 height reduced */
       mt-10                   /* 🔥 top margin */
       overflow-y-auto         /* scroll inside */
       p-6 sm:p-8 
       border-4 border-blue-200 
       animate-scale-in">
  
  
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900">{title}</h3>
              {title.includes("Post") && (
                <p className="text-gray-600 text-sm sm:text-base mt-2">Choose locations to post (50 coins per location)</p>
              )}
              <div className="flex justify-center gap-4 sm:gap-6 mt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="post-checkbox"
                    checked={checkmark.includes('post')}
                    onChange={() => handleCheckmarkChange('post')}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="post-checkbox" className="ml-2 text-gray-700 font-medium cursor-pointer">Post</label>
                </div>
  
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="photo-checkbox"
                    checked={checkmark.includes('photo')}
                    onChange={() => handleCheckmarkChange('photo')}
                    className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                  <label htmlFor="photo-checkbox" className="ml-2 text-gray-700 font-medium cursor-pointer">Photo</label>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center">
                <input
                  type="checkbox"
                  id="select-all-checkbox"
                  checked={locations.length > 0 && selectedLocations.length === locations.length}
                  onChange={handleSelectAll}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="select-all-checkbox" className="ml-2 text-gray-700 font-medium cursor-pointer">
                  {selectedLocations.length === locations.length ? 'Deselect All' : 'Select All'}
                </label>
              </div>
            </div>
  
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Selected Locations</p>
                  <p className="text-2xl font-black text-blue-700">{selectedLocations.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 text-right">Cost per Location</p>
                  <p className="text-2xl font-black text-green-600">50 coins</p>
                </div>
              </div>
            </div>
  
            <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto space-y-3">
              {locations.map((location) => (
                <div
                  key={location.id}
                  onClick={() => toggleLocation(location.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedLocations.includes(location.id)
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedLocations.includes(location.id)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-400'
                        }`}>
                        {selectedLocations.includes(location.id) && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">{location.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {location.address}
                        </p>
                      </div>
                    </div>
                    <span className="text-blue-600 font-bold text-sm">50 coins</span>
                  </div>
                </div>
              ))}
            </div>
  
            {selectedLocations.length > 0 && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3 sm:p-4">
                <p className="text-sm text-amber-900 flex items-start gap-2">
                  <span className="text-lg sm:text-xl">💡</span>
                  <span>
                    <strong>Selected:</strong> {selectedLocations.length} location{selectedLocations.length > 1 ? 's' : ''}
                    {' '}• Total posting cost: {selectedLocations.length * 50} coins
                  </span>
                </p>
              </div>
            )}
  
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onConfirm(selectedLocations, getPayload())}
                disabled={selectedLocations.length === 0}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 sm:py-4 rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {confirmText} to {selectedLocations.length} Location{selectedLocations.length !== 1 ? 's' : ''}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 sm:py-4 rounded-xl font-bold hover:bg-gray-300 transition-all text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default LocationSelectionModal;