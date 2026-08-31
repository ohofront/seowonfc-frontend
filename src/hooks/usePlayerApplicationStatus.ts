import {useEffect,useState} from 'react';
import client,{unwrapData} from '../api/client';
import type {PlayerApplication} from '../types';

type ApplicationList=PlayerApplication[]|{content:PlayerApplication[]};

export function useHasAppliedForPlayer(enabled:boolean){
  const [hasApplied,setHasApplied]=useState<boolean|null>(null);

  useEffect(()=>{
    let active=true;
    if(!enabled){
      setHasApplied(null);
      return()=>{active=false};
    }

    setHasApplied(null);
    void client.get('/player-applications/me?size=1')
      .then(unwrapData<ApplicationList>)
      .then(data=>{
        if(active)setHasApplied((Array.isArray(data)?data:data.content).length>0);
      })
      .catch(()=>{
        if(active)setHasApplied(null);
      });

    return()=>{active=false};
  },[enabled]);

  return hasApplied;
}
