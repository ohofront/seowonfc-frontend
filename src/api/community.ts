import client, { unwrapData } from './client';
import { create, detail, list, update } from './resource';
import type { BoardType, Comment, Post } from '../types';

const path = (type:BoardType) => `/boards/${type.toUpperCase()}/posts`;
export const getPosts = (type:BoardType,page=0) => list<Post>(path(type),{page});
export const getPost = (type:BoardType,id:string) => detail<Post>(path(type),id);
export const savePost = (type:BoardType,payload:Pick<Post,'title'|'content'>,id?:string) =>
  id ? update<Post>(path(type),id,payload) : create<Post>(path(type),payload);
// 명세에 별도 댓글 목록 GET이 없으므로 게시글 상세 응답의 comments를 사용한다.
export const getComments = (type:BoardType,id:string) => getPost(type,id).then((post)=>post.comments ?? []);
export const addComment = (type:BoardType,id:string,content:string) =>
  client.post(`${path(type)}/${id}/comments`,{content}).then(unwrapData<Comment>);
