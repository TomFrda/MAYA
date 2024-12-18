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

export interface LoginResponse extends UserResponse {}
export interface SignupResponse {
  token: string;
  user: {
    id: string;
    first_name: string;
    email: string;
    phone_number: string;
    profilePhotos: string[];
  };
  message: string;
}