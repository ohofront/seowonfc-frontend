import client,{unwrapData} from './client'; import type { LoginResponse,User } from '../types';
export const login=(payload:{email:string;password:string})=>client.post('/auth/login',payload).then(unwrapData<LoginResponse>);
export const signup=(payload:{email:string;password:string;name:string})=>client.post('/auth/signup',payload).then(unwrapData<User>);
export const me=()=>client.get('/users/me').then(unwrapData<User>);
export const updateMe=(payload:Partial<User>)=>client.put('/users/me',payload).then(unwrapData<User>);
