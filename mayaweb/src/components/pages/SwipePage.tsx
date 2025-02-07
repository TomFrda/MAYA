import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useSwipeable } from 'react-swipeable';
import { getNearbyProfiles, likeProfile } from '../../services/apiService';
import { AuthContext } from '../../context/AuthContext';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { Profile } from '../../types/api';

const SwipePage: React.FC = () => {
  const { token } = useContext(AuthContext);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!token) {
          throw new Error('No token found');
        }
        const fetchedProfiles = await getNearbyProfiles(token);
        setProfiles(fetchedProfiles || []);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        setError('Failed to load profiles');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [token]);

  const handleSwipe = async (direction: string) => {
    if (!profiles.length || currentIndex >= profiles.length) return;

    if (direction === 'right') {
      try {
        const likedProfile = profiles[currentIndex];
        if (token) {
          await likeProfile(token, likedProfile.id);
        }
      } catch (error) {
        console.error('Error liking profile:', error);
      }
    }

    setDirection(direction);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setDirection(null);
    }, 200);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading profiles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex] as Profile;
  const photos = currentProfile?.photos || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-pink-100">
      <div className="container px-4 py-8 mx-auto max-w-xl">
        <AnimatePresence>
          {currentProfile ? (
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
                <div className="relative h-full">
                  <Carousel
                    responsive={{
                      superLargeDesktop: {
                        breakpoint: { max: 4000, min: 3000 },
                        items: 1
                      },
                      desktop: {
                        breakpoint: { max: 3000, min: 1024 },
                        items: 1
                      },
                      tablet: {
                        breakpoint: { max: 1024, min: 464 },
                        items: 1
                      },
                      mobile: {
                        breakpoint: { max: 464, min: 0 },
                        items: 1
                      }
                    }}
                    ssr={true}
                    infinite={true}
                    autoPlay={false}
                    showDots={true}
                    removeArrowOnDeviceType={["desktop", "tablet", "mobile"]}
                    className="h-full"
                  >
                    {currentProfile.photos && currentProfile.photos.length > 0 ? (
                      currentProfile.photos.map((photo, index) => (
                        <div key={index} className="relative h-full">
                          <img 
                            src={`http://localhost:5000/uploads/${photo}`}
                            alt={`Photo ${index + 1} of ${currentProfile.name}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="h-full bg-gray-100 flex items-center justify-center">
                        <p className="text-gray-500">No photos available</p>
                      </div>
                    )}
                  </Carousel>
                  
                  {/* Profile Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent text-white">
                    <h2 className="text-3xl font-bold mb-2">
                      {currentProfile.name}, {currentProfile.age}
                    </h2>
                    {currentProfile.bio && (
                      <p className="text-lg text-white/90">{currentProfile.bio}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[70vh]">
              <h3 className="text-2xl font-semibold text-gray-600 mb-4">
                No more profiles available
              </h3>
              <p className="text-gray-500">
                Check back later for new profiles
              </p>
            </div>
          )}
        </AnimatePresence>

        {/* Swipe Buttons */}
        {currentProfile && (
          <div className="flex justify-center space-x-8">
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
        )}
      </div>
    </div>
  );
};

export default SwipePage;