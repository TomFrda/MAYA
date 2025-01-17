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
  first_name: string;
  profilePhotos: string[];
  bio: string;
  name: string;
  age: number;
  photos: string[];
  // other properties...
}

export interface Message {
  _id: string;
  from: string;
  to: string;
  content: string;
  timestamp: Date;
}

export interface Chat {
  userId: string;
  firstName: string;
  profilePhoto: string;
  lastMessage?: Message;
  hasNewMessage?: boolean;  // Add this field
}