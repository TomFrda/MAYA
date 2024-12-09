import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users'; // Remplacez par l'URL de votre backend

// Fonction pour s'inscrire
export const signup = async (firstName: string, email: string, phoneNumber: string, password: string) => {
  const response = await axios.post(`${API_URL}/signup`, {
    first_name: firstName,
    email,
    phone_number: phoneNumber,
    password,
  });
  return response.data;
};

// Fonction pour se connecter
export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
  return response.data;
};

// Fonction pour vérifier le téléphone
export const verifyPhone = async (phoneNumber: string) => {
  const response = await axios.post(`${API_URL}/verify-phone`, {
    phone_number: phoneNumber,
  });
  return response.data;
};

// Fonction pour vérifier le code de vérification
export const verifyCode = async (phoneNumber: string, verificationCode: string) => {
  const response = await axios.post(`${API_URL}/verify-code`, {
    phone_number: phoneNumber,
    verificationCode,
  });
  return response.data;
};

// Fonction pour envoyer un message
export const sendMessage = async (token: string, to: string, message: string) => {
  const response = await axios.post(`${API_URL}/send-message`, {
    to,
    message,
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Fonction pour mettre à jour le profil utilisateur
export const updateProfile = async (token: string, updatedData: any) => {
  const response = await axios.put(`${API_URL}/profile`, updatedData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Fonction pour ajouter une photo de profil
export const addProfilePhoto = async (token: string, photoUrl: string) => {
  const response = await axios.post(`${API_URL}/profile/photo`, {
    photoUrl,
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Fonction pour supprimer une photo de profil
export const removeProfilePhoto = async (token: string, photoUrl: string) => {
  const response = await axios.delete(`${API_URL}/profile/photo`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      photoUrl,
    },
  });
  return response.data;
};

// Fonction pour récupérer les informations de l'utilisateur
export const getUserInfo = async (token: string) => {
  const response = await axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Fonction pour mettre à jour la localisation de l'utilisateur
export const updateLocation = async (token: string, latitude: number, longitude: number) => {
  const response = await axios.post(`${API_URL}/updateLocation`, {
    latitude,
    longitude,
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Fonction pour récupérer les utilisateurs à proximité
export const getNearbyUsers = async (token: string, latitude: number, longitude: number, maxDistance: number) => {
  const response = await axios.get(`${API_URL}/nearbyUsers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      latitude,
      longitude,
      maxDistance,
    },
  });
  return response.data;
};