import {createContext,useCallback,useEffect,useMemo,useState,type ReactNode} from 'react';
import * as authApi from '../api/auth';
import type {User} from '../types';

interface AuthValue { user:User|null; isAuthenticated:boolean; isAdmin:boolean; loading:boolean; signIn:(email:string,password:string)=>Promise<void>; signOut:()=>void; refresh:()=>Promise<void>; setUser:(user:User)=>void }
export const AuthContext=createContext<AuthValue|null>(null);
const stored=()=>{try{return JSON.parse(localStorage.getItem('user')||'null') as User|null}catch{return null}};

export function AuthProvider({children}:{children:ReactNode}){
  const [user,setUserState]=useState<User|null>(stored);
  const [loading,setLoading]=useState(Boolean(localStorage.getItem('accessToken'))&&!stored());
  const setUser=(next:User)=>{setUserState(next);localStorage.setItem('user',JSON.stringify(next))};
  const signOut=useCallback(()=>{localStorage.removeItem('accessToken');localStorage.removeItem('refreshToken');localStorage.removeItem('user');setUserState(null)},[]);
  const refresh=useCallback(async()=>{
    const token=localStorage.getItem('accessToken');
    const cachedUser=stored();
    // 현재 백엔드에는 GET /users/me가 없으므로 로그인 응답에 저장한 사용자를 복원한다.
    if(!token||!cachedUser)signOut();
    else setUserState(cachedUser);
    setLoading(false);
  },[signOut]);
  useEffect(()=>{void refresh();addEventListener('auth:expired',signOut);return()=>removeEventListener('auth:expired',signOut)},[refresh,signOut]);
  const signIn=async(email:string,password:string)=>{const result=await authApi.login({email,password});localStorage.setItem('accessToken',result.accessToken);localStorage.setItem('refreshToken',result.refreshToken);setUser(result.user)};
  const value=useMemo(()=>({user,isAuthenticated:!!user&&!!localStorage.getItem('accessToken'),isAdmin:user?.role==='ADMIN',loading,signIn,signOut,refresh,setUser}),[user,loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
