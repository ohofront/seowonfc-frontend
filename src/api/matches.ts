import client, { unwrapPage } from './client';
import { list } from './resource';
import type { Match, Standing } from '../types';

export const getMatches = (params:Record<string,unknown>) => list<Match>('/matches',params);
export const getStandings = (season?:string) =>
  client.get('/standings',{params:{season,page:0,size:100}}).then(unwrapPage<Standing>);
