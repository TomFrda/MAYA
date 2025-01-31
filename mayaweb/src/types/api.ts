export interface UserResponse {
  token: string;
  user: {
    id: string;
    first_name: string;
    email: string;
    phone_number: string;
    profilePhotos: string[];
  };
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    location: {
      type: string;
      coordinates: number[];
      lastUpdated: Date;
    };
  };
}

export interface SignupResponse {
  token: string;
  user: any;
  message: string;
}

export interface Profile {
  id: string;
  _id?: string;
  first_name: string;
  name?: string;
  age?: number;
  bio?: string;
  city?: string;
  distance?: number;
  interests?: string[];
  isOnline?: boolean;
  profilePhotos: string[];
  photos?: string[];
}

export interface Message {
  _id: string;
  from: string;
  to: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'gif' | 'sticker';
}

export interface Chat {
  userId: string;
  firstName: string;
  profilePhoto: string;
  lastMessage?: Message;
  isOnline?: boolean;
  lastActive?: Date;
  hasNewMessage?: boolean;  // Ajout de cette propriété
}

export interface UserStatus {
  userId: string;
  isOnline: boolean;
  lastActive: Date;
}