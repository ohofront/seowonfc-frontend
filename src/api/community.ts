import client, { unwrapData } from './client';
import { create, detail, list, update } from './resource';
import type { BoardType, Comment, Post } from '../types';

const path = (type:BoardType) => `/boards/${type.toUpperCase()}/posts`;
export const getPosts = (type:BoardType,page=0) => list<Post>(path(type),{page});
export const getPost = (type:BoardType,id:string) => detail<Post>(path(type),id);
export const savePost = (type:BoardType,payload:Pick<Post,'title'|'content'>,id?:string) =>
  id ? update<Post>(path(type),id,payload) : create<Post>(path(type),payload);
export const getComments = (type:BoardType,id:string) =>
  client.get(`${path(type)}/${id}/comments`).then(unwrapData<Comment[]>);
export const addComment = (type:BoardType,id:string,content:string) =>
  client.post(`${path(type)}/${id}/comments`,{content}).then(unwrapData<Comment>);
