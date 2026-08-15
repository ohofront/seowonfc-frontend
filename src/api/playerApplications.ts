import client,{unwrapData} from './client';
import type {PlayerApplication,Position} from '../types';

export interface PlayerApplicationPayload {name:string;backNumber:number;position:Position;nationality:string;profileImageUrl:string}

const asApplications=(value:PlayerApplication[]|{content:PlayerApplication[]})=>Array.isArray(value)?value:value.content;

export const createPlayerApplication=(payload:PlayerApplicationPayload)=>client.post('/player-applications',payload).then(unwrapData<PlayerApplication>);
export const getMyPlayerApplications=()=>client.get('/player-applications/me').then(unwrapData<PlayerApplication[]|{content:PlayerApplication[]}>).then(asApplications);
export const getPendingPlayerApplications=()=>client.get('/admin/player-applications').then(unwrapData<PlayerApplication[]|{content:PlayerApplication[]}>).then(asApplications);
export const approvePlayerApplication=(id:number)=>client.post(`/admin/player-applications/${id}/approve`).then(unwrapData<unknown>);
export const rejectPlayerApplication=(id:number,reason:string)=>client.post(`/admin/player-applications/${id}/reject`,{reason}).then(unwrapData<unknown>);

type ImageUploadResult={url?:string;imageUrl?:string;fileUrl?:string}|string;
export async function uploadPlayerApplicationImage(file:File){
  const formData=new FormData();
  formData.append('file',file);
  formData.append('folder','player-applications');
  const result=await client.post('/images',formData).then(unwrapData<ImageUploadResult>);
  const url=typeof result==='string'?result:result.url??result.imageUrl??result.fileUrl;
  if(!url)throw new Error('업로드된 이미지 URL을 확인할 수 없습니다.');
  return url;
}
