import React, { useEffect, useState, useContext } from 'react';
import { getMatches } from '../../services/apiService';
import { AuthContext } from '../../context/AuthContext';
import { Profile } from '../../types/api';
import { useHistory } from 'react-router-dom';

const MatchPage: React.FC = () => {
  const [matches, setMatches] = useState<Profile[]>([]);
  const { token } = useContext(AuthContext);
  const history = useHistory();

  useEffect(() => {
    const fetchMatches = async () => {
      if (!token) {
        console.error('No token found');
        return;
      }
      try {
        const data = await getMatches(token);
        setMatches(data);
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };

    fetchMatches();
  }, [token]);

  const handleMessageClick = (matchId: string) => {
    history.push(`/messages?chatId=${matchId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Vos Matchs
        </h1>
        
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-lg p-8">
            <div className="text-6xl mb-4">💝</div>
            <p className="text-xl text-gray-500 text-center">
              Vous n'avez aucun match pour le moment.
              <br />
              <span className="text-lg">
                Continuez à swiper pour trouver votre match !
              </span>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {matches.map((match) => (
              <div 
                key={match.id} // Add unique key here
                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105"
              >
                <div className="relative pb-[100%]">
                  <img 
                    src={match.profilePhotos[0]} 
                    alt={match.first_name}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {match.first_name}
                  </h3>
                  <button 
                    onClick={() => handleMessageClick(match.id)}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Envoyer un message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchPage;