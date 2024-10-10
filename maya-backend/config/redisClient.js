const redis = require('redis');

// Créer un client Redis
const redisClient = redis.createClient({
  host: 'localhost', // Adresse de ton serveur Redis (localhost en développement)
  port: 6379         // Port par défaut de Redis
});

// Gérer les erreurs de connexion
redisClient.on('error', (err) => {
  console.error('Erreur Redis', err);
});

redisClient.on('connect', () => {
  console.log('Connecté à Redis');
});

module.exports = redisClient;
