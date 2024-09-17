export interface ISignUp {
    phone: string;
}

export interface ISignIn {
    phone?: string;
}

export interface ITokenPayload {
    user_id: string;
}

export interface IDecodedToken {
    user_id: string;
    token_type: string;
}
