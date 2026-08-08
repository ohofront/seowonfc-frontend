import client, { unwrapData } from './client';
import { detail, list } from './resource';
import type { EventItem } from '../types';

export const getEvents = (page=0) => list<EventItem>('/events',{page});
export const getEvent = (id:string) => detail<EventItem>('/events',id);
export const applyEvent = (id:string) => client.post(`/events/${id}/apply`).then(unwrapData<unknown>);
export const getEventWinners = (id:string) => client.get(`/events/${id}/winners`).then(unwrapData<string[]>);
