import axios from 'axios';
import { LoginResponse, SignupResponse, Profile } from '../types/api';

axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

const API_URL = 'http://localhost:5000/api/users';

// Login function
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(`${API_URL}/login`, {
    email,
    password,
  });
  return response.data;
};

// Signup function
export const signup = async (
  firstName: string,
  email: string,
  phoneNumber: string,
  password: string,
  gender: string,
  interestedIn: string,
  profilePhoto: File
): Promise<SignupResponse> => {
  const formData = new FormData();
  formData.append('first_name', firstName);
  formData.append('email', email);
  formData.append('phone_number', phoneNumber);
  formData.append('password', password);
  formData.append('gender', gender);
  formData.append('interested_in', interestedIn);
  formData.append('photo', profilePhoto);

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

// Fonction pour mettre à jour la localisation de l'utilisateur
export const updateLocation = async (token: string, latitude: number, longitude: number) => {
  const response = await axios.post(`${API_URL}/updateLocation`, 
    { latitude, longitude },
    { headers: { Authorization: `Bearer ${token}` } }
  );
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

// Ajouter une fonction pour récupérer les profils filtrés par genre
export const getNearbyProfiles = async (token: string): Promise<Profile[]> => {
  try {
    const response = await axios.get<Profile[]>(`${API_URL}/nearby-profiles`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Profiles received:', response.data); // Pour debug
    return response.data;
  } catch (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }
};