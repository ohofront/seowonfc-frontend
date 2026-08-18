import client,{unwrapData} from './client';
import type {Page,Sponsor} from '../types';

type SponsorList=Sponsor[]|{content:Sponsor[];number?:number;size?:number;totalElements?:number;totalPages?:number};

export const getSponsors=async():Promise<Page<Sponsor>>=>{
  const data=await client.get('/sponsors',{params:{page:0,size:100}}).then(unwrapData<SponsorList>);
  if(Array.isArray(data))return {content:data,page:0,size:data.length,totalElements:data.length,totalPages:data.length?1:0};
  return {
    content:data.content,
    page:data.number??0,
    size:data.size??data.content.length,
    totalElements:data.totalElements??data.content.length,
    totalPages:data.totalPages??(data.content.length?1:0),
  };
};
