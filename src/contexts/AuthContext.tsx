import {createContext,useCallback,useEffect,useMemo,useState,type ReactNode} from 'react';
import * as authApi from '../api/auth';
import type {User} from '../types';
import {clearAuth,getAccessToken,getStoredUser,saveAuth,saveUser} from '../utils/authStorage';

interface AuthValue { user:User|null; isAuthenticated:boolean; isAdmin:boolean; loading:boolean; signIn:(email:string,password:string,remember?:boolean)=>Promise<void>; signOut:()=>void; refresh:()=>Promise<void>; setUser:(user:User)=>void }
export const AuthContext=createContext<AuthValue|null>(null);

export function AuthProvider({children}:{children:ReactNode}){
  const [user,setUserState]=useState<User|null>(getStoredUser);
  const [loading,setLoading]=useState(Boolean(getAccessToken())&&!getStoredUser());
  const setUser=(next:User)=>{setUserState(next);saveUser(next)};
  const signOut=useCallback(()=>{clearAuth();setUserState(null)},[]);
  const refresh=useCallback(async()=>{
    const token=getAccessToken();
    const cachedUser=getStoredUser();
    // 현재 백엔드에는 GET /users/me가 없으므로 로그인 응답에 저장한 사용자를 복원한다.
    if(!token||!cachedUser)signOut();
    else setUserState(cachedUser);
    setLoading(false);
  },[signOut]);
  useEffect(()=>{void refresh();addEventListener('auth:expired',signOut);return()=>removeEventListener('auth:expired',signOut)},[refresh,signOut]);
  const signIn=async(email:string,password:string,remember=false)=>{const result=await authApi.login({email,password});saveAuth(result,remember);setUserState(result.user)};
  const value=useMemo(()=>({user,isAuthenticated:!!user&&!!getAccessToken(),isAdmin:user?.role==='ADMIN',loading,signIn,signOut,refresh,setUser}),[user,loading,signOut,refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
