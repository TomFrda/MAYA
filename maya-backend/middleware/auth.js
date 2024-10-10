const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Récupérer le token dans les headers

  if (!token) {
    return res.status(401).json({ error: 'Accès refusé. Aucun token fourni.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET); // Vérifier le token
    req.user = verified; // Ajouter les infos de l'utilisateur au req pour les futures requêtes
    next(); // Passer à l'étape suivante
  } catch (err) {
    res.status(400).json({ error: 'Token invalide.' });
  }
};

module.exports = auth;
