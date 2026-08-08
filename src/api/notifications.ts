import client, { unwrapData } from './client';
import type { Notification, SpringPage } from '../types';

export const getNotifications = () => client.get('/notifications/me',{params:{page:0,size:20,sort:'createdAt,desc'}})
  .then(unwrapData<SpringPage<Notification>>)
  .then((page)=>page.content);
export const readNotification = (id:number) => client.put(`/notifications/${id}/read`).then(unwrapData<unknown>);
