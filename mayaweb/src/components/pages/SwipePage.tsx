import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, XMarkIcon, UserIcon } from '@heroicons/react/24/solid';
import { useSwipeable } from 'react-swipeable';
import { getNearbyProfiles } from '../../services/apiService';
import { AuthContext } from '../../context/AuthContext';

// Définir l'interface pour un profil
interface Profile {
  id: string;
  name: string;
  age: string;
  photo: string;
  bio: string;
  distance: string;
  gender: string;
  interested_in: string;
}

const SwipePage: React.FC = () => {
  const { token } = useContext(AuthContext);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        if (!token) {
          throw new Error('No token found');
        }
        const profiles = await getNearbyProfiles(token);
        console.log('Profiles received:', profiles); // Debug log
        setProfiles(profiles);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };

    fetchProfiles();
  }, [token]);

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  const handleSwipe = (direction: string) => {
    setDirection(direction);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setDirection(null);
    }, 200);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.target as HTMLImageElement;
    img.src = `${process.env.PUBLIC_URL}/default-profile.png`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-pink-100">
      <div className="container px-4 py-8 mx-auto max-w-xl">
        <AnimatePresence>
          {currentIndex < profiles.length ? (
            <div {...handlers} className="relative h-[70vh] mb-8">
              <motion.div
                key={currentIndex}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ 
                  scale: direction ? 1.05 : 1,
                  opacity: 1,
                  x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
                  rotate: direction === 'left' ? -5 : direction === 'right' ? 5 : 0
                }}
                exit={{ 
                  scale: 0.9,
                  opacity: 0,
                  x: direction === 'left' ? -200 : direction === 'right' ? 200 : 0 
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute inset-0 w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
              >
                {profiles[currentIndex].photo ? (
                  <div className="relative h-4/5">
                    <img 
                      src={profiles[currentIndex].photo}
                      alt={profiles[currentIndex].name}
                      onError={handleImageError}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                      <h2 className="text-3xl font-bold text-white">
                        {profiles[currentIndex].name}, {profiles[currentIndex].age}
                      </h2>
                    </div>
                  </div>
                ) : (
                  <div className="h-4/5 bg-gray-100 flex items-center justify-center">
                    <UserIcon className="w-32 h-32 text-gray-300" />
                  </div>
                )}
                <div className="p-6">
                  <p className="text-gray-600 text-lg">{profiles[currentIndex].bio}</p>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[70vh]">
              <h3 className="text-2xl font-semibold text-gray-600 mb-4">
                Plus aucun profil disponible
              </h3>
              <p className="text-gray-500">
                Revenez plus tard pour découvrir de nouveaux profils
              </p>
            </div>
          )}
        </AnimatePresence>

        <div className="flex justify-center space-x-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('left')}
            className="p-5 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <XMarkIcon className="w-8 h-8 text-rose-500" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('right')}
            className="p-5 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <HeartIcon className="w-8 h-8 text-emerald-500" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default SwipePage;