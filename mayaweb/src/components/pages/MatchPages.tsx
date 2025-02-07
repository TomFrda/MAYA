import React, { useEffect, useState, useContext } from 'react';
import { getMatches, unmatchProfile } from '../../services/apiService';
import { AuthContext } from '../../context/AuthContext';
import { Profile } from '../../types/api';
import { useHistory } from 'react-router-dom';
import MatchCard from '../matches/MatchCard';

const MatchPage: React.FC = () => {
  const [matches, setMatches] = useState<Profile[]>([]);
  const { token } = useContext(AuthContext);
  const history = useHistory();

  useEffect(() => {
    const fetchMatches = async () => {
      if (!token) return;
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

  const handleUnmatch = async (matchId: string) => {
    if (!token || !matchId) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce match ?")) {
      try {
        await unmatchProfile(token, matchId);
        setMatches(prevMatches => prevMatches.filter(match => match.id !== matchId));
      } catch (error) {
        console.error('Error unmatching:', error);
      }
    }
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
              Vous n'avez aucun match pour le moment.<br />
              <span className="text-lg">
                Continuez à swiper pour trouver votre match !
              </span>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onMessageClick={handleMessageClick}
                onUnmatch={handleUnmatch}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchPage;