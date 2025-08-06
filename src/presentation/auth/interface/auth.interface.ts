export interface AuthResponse {
    token: string;
}

export interface User {
    name: string;
    email: string;
    avatar?: string;
}

export interface loginPayload {
    user: string;
    password: string;
}