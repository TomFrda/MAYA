import React from 'react';

interface MatchPhotoProps {
  photos: string[];
  firstName: string;
}

const MatchPhoto: React.FC<MatchPhotoProps> = ({ photos, firstName }) => {
  return (
    <div className="aspect-square relative">
      {photos && photos.length > 0 ? (
        photos.map((photo: string, index: number) => (
          <div key={index} className="absolute inset-0">
            <img 
              src={`http://localhost:5000/uploads/${photo}`}
              alt={`${firstName} #${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))
      ) : (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">No photos available</p>
        </div>
      )}
    </div>
  );
};

export default MatchPhoto;