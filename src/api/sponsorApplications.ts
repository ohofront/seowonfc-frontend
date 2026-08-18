import client,{unwrapData} from './client';
import type {SponsorApplication,SponsorTier} from '../types';

export interface SponsorApplicationInput {
  companyName:string;
  contactName:string;
  contactEmail:string;
  contactPhone:string;
  desiredTier:SponsorTier;
  message:string;
  websiteUrl?:string;
}

const asApplications=(value:SponsorApplication[]|{content:SponsorApplication[]})=>Array.isArray(value)?value:value.content;

export const createSponsorApplication=(input:SponsorApplicationInput,file:File)=>{
  const formData=new FormData();
  formData.append('data',JSON.stringify(input));
  formData.append('file',file);
  return client.post('/sponsor-applications',formData,{headers:{'Content-Type':'multipart/form-data'}}).then(unwrapData<SponsorApplication>);
};

export const getPendingSponsorApplications=()=>client.get('/admin/sponsor-applications').then(unwrapData<SponsorApplication[]|{content:SponsorApplication[]}>).then(asApplications);
export const approveSponsorApplication=(id:number)=>client.post(`/admin/sponsor-applications/${id}/approve`).then(unwrapData<unknown>);
export const rejectSponsorApplication=(id:number,reason:string)=>client.post(`/admin/sponsor-applications/${id}/reject`,{reason}).then(unwrapData<unknown>);
