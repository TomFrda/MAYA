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
  name: string;
  age: number;
  bio: string;
  photos: string[];
  distance: string;
  gender: string;
  interested_in: string;
}