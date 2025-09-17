import { JwtPayload } from 'jwt-decode';

export interface CustomJwtPayload extends JwtPayload {
    userId: number;
    username: string;
    id: number;
    exp: number;
}
