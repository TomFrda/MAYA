import axios from 'axios';
import { LoginResponse, SignupResponse, Profile } from '../types/api';

axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

const API_URL = 'http://localhost:5000/api/users';

// Login function
export const login = async (email: string, password: string, latitude?: number, longitude?: number): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/login`, {
      email,
      password,
      ...(latitude && longitude ? { latitude, longitude } : {})
    });
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Signup function
export const signup = async (
  firstName: string,
  email: string,
  phoneNumber: string,
  password: string,
  gender: string,
  interestedIn: string,
  profilePhoto: File,
  latitude: number,
  longitude: number
): Promise<SignupResponse> => {
  const formData = new FormData();
  formData.append('first_name', firstName);
  formData.append('email', email);
  formData.append('phone_number', phoneNumber);
  formData.append('password', password);
  formData.append('gender', gender);
  formData.append('interested_in', interestedIn);
  formData.append('photo', profilePhoto);
  formData.append('latitude', latitude.toString());
  formData.append('longitude', longitude.toString());

  const response = await axios.post<SignupResponse>(`${API_URL}/signup`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Set the token in axios headers after successful signup
  const token = response.data.token;
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
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

// Fonction pour liker un profil
export const likeProfile = async (token: string, likedUserId: string) => {
  const response = await axios.post(`${API_URL}/like`, { likedUserId }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Fonction pour récupérer les profils à proximité
export const getNearbyProfiles = async (token: string): Promise<Profile[]> => {
  const response = await axios.get<Profile[]>(`${API_URL}/nearby-profiles`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Fonction pour récupérer les utilisateurs à proximité
export const getNearbyUsers = async (token: string, latitude: number, longitude: number, maxDistance: number): Promise<Profile[]> => {
  const response = await axios.get<Profile[]>(`${API_URL}/nearbyUsers`, {
    params: { latitude, longitude, maxDistance },
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

// Fonction pour mettre à jour le profil de l'utilisateur
export const updateUserProfile = async (token: string, data: { bio: string, maxDistance: number, location: { type: string, coordinates: [number, number] } }) => {
  const response = await axios.put(`${API_URL}/profile`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Fonction pour télécharger la photo de profil de l'utilisateur
export const uploadProfilePhoto = async (token: string, photo: File) => {
  const formData = new FormData();
  formData.append('photo', photo);

  const response = await axios.post(`${API_URL}/uploadProfilePhoto`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
