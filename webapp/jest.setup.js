import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
process.env.VITE_API_URL = 'http://backend:3000/api';