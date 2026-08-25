import client, { unwrapData, unwrapPage } from './client';
import { list } from './resource';
import type { Match, Standing } from '../types';

export const getMatches = (params:Record<string,unknown>) => list<Match>('/matches',params);
export const getStandings = (season?:string) =>
  client.get('/standings',{params:{season,page:0,size:100}}).then(unwrapPage<Standing>);

export interface MatchDetailsInput {
  season:number;
  round?:number;
  competition?:string;
  homeTeam:string;
  awayTeam:string;
  matchDate:string;
  stadium?:string;
}

export const updateMatchDetails=(matchId:string|number,input:MatchDetailsInput) =>
  client.put(`/admin/matches/${matchId}/details`,input).then(unwrapData<Match>);
