import client,{unwrapData} from './client';
import {detail,list} from './resource';
import type {News} from '../types';

export interface NewsInput {title:string;content:string;category?:string;thumbnailUrl?:string|null}

export const getNews=(page=0,size=9)=>list<News>('/news',{page,size});
export const getNewsDetail=(id:string)=>detail<News>('/news',id);

const newsFormData=(input:NewsInput,file?:File|null)=>{
  const formData=new FormData();
  formData.append('data',new Blob([JSON.stringify(input)],{type:'application/json'}));
  if(file)formData.append('file',file);
  return formData;
};

export const createNews=(input:NewsInput,file?:File|null)=>client.post('/admin/news',newsFormData(input,file),{headers:{'Content-Type':'multipart/form-data'}}).then(unwrapData<News>);
export const updateNews=(id:string|number,input:NewsInput,file?:File|null)=>client.put(`/admin/news/${id}`,newsFormData(input,file),{headers:{'Content-Type':'multipart/form-data'}}).then(unwrapData<News>);
