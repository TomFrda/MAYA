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
  user: any;
}

export interface SignupResponse {
  token: string;
  user: any;
  message: string;
}

export interface Profile {
  id: string;
  name: string;
  age: string;
  photo: string;
  bio: string;
  distance: string;
  gender: string;
  interested_in: string;
}