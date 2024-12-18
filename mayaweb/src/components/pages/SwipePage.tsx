import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useSwipeable } from 'react-swipeable';
import { getNearbyProfiles } from '../../services/apiService'; // Assurez-vous d'importer la fonction getNearbyProfiles

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
  // Mettre à jour le state avec le type correct
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const token = localStorage.getItem('token'); // ou récupérer depuis AuthContext
        const data = await getNearbyProfiles(token as string);
        // Maintenant TypeScript sait que data devrait être un tableau de Profile
        setProfiles(data as Profile[]);
      } catch (error) {
        console.error('Erreur lors de la récupération des profils', error);
      }
    };

    fetchProfiles();
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    preventScrollOnSwipe: true, // Changed from preventDefaultTouchmoveEvent
    trackMouse: true
  });

  const handleSwipe = (direction: string) => {
    setDirection(direction);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setDirection(null);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100">
      <div className="container px-4 py-8 mx-auto max-w-xl">
        <AnimatePresence>
          {currentIndex < profiles.length && (
            <div {...handlers}>
              <motion.div
                key={currentIndex}
                initial={{ scale: 1 }}
                animate={{ 
                  scale: direction ? 1.1 : 1,
                  x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0 
                }}
                exit={{ 
                  scale: 0.8, 
                  opacity: 0,
                  x: direction === 'left' ? -200 : direction === 'right' ? 200 : 0 
                }}
                transition={{ duration: 0.2 }}
                className="relative overflow-hidden bg-white rounded-3xl shadow-xl cursor-grab active:cursor-grabbing"
              >
                <img
                  src={profiles[currentIndex].photo}
                  alt={profiles[currentIndex].name}
                  className="object-cover w-full h-[600px]"
                  draggable="false"
                />
                <div className="absolute bottom-0 w-full p-6 space-y-2 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-3xl font-bold text-white">
                    {profiles[currentIndex].name}, {profiles[currentIndex].age}
                  </h3>
                  <p className="text-lg text-white/90">{profiles[currentIndex].bio}</p>
                  <p className="text-white/80">{profiles[currentIndex].distance}</p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="flex justify-center mt-8 space-x-6">
          <button
            onClick={() => handleSwipe('left')}
            className="p-4 text-red-500 transition-all bg-white rounded-full shadow-lg hover:bg-red-500 hover:text-white"
          >
            <XMarkIcon className="w-8 h-8" />
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="p-4 text-green-500 transition-all bg-white rounded-full shadow-lg hover:bg-green-500 hover:text-white"
          >
            <HeartIcon className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwipePage;