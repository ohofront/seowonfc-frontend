import {list} from './resource'; import type {Sponsor} from '../types'; export const getSponsors=()=>list<Sponsor>('/sponsors',{size:100});
