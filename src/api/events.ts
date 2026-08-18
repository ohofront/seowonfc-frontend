import client, { unwrapData } from './client';
import { detail, list } from './resource';
import type { EventItem } from '../types';

export interface EventInput {title:string;content:string;eventDate:string;imageUrl?:string|null}

export const getEvents = (page=0) => list<EventItem>('/events',{page});
export const getEvent = (id:string) => detail<EventItem>('/events',id);
export const applyEvent = (id:string) => client.post(`/events/${id}/apply`).then(unwrapData<unknown>);
export const getEventWinners = (id:string) => client.get(`/events/${id}/winners`).then(unwrapData<string[]>);

const eventFormData=(input:EventInput,file?:File|null)=>{
  const formData=new FormData();
  formData.append('data',new Blob([JSON.stringify(input)],{type:'application/json'}));
  if(file)formData.append('file',file);
  return formData;
};

export const createEvent=(input:EventInput,file?:File|null)=>client.post('/admin/events',eventFormData(input,file),{headers:{'Content-Type':'multipart/form-data'}}).then(unwrapData<EventItem>);
export const updateEvent=(id:string|number,input:EventInput,file?:File|null)=>client.put(`/admin/events/${id}`,eventFormData(input,file),{headers:{'Content-Type':'multipart/form-data'}}).then(unwrapData<EventItem>);
