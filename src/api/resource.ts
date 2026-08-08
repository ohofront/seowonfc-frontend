import client, { unwrapData, unwrapPage } from './client';

export const list = async <T>(path:string, params:Record<string,unknown>={}) =>
  unwrapPage<T>(await client.get(path, { params: { page:0, size:20, ...params } }));
export const detail = async <T>(path:string,id:string|number) => unwrapData<T>(await client.get(`${path}/${id}`));
export const create = async <T>(path:string,payload:unknown) => unwrapData<T>(await client.post(path,payload));
export const update = async <T>(path:string,id:string|number,payload:unknown) => unwrapData<T>(await client.put(`${path}/${id}`,payload));
export const remove = async (path:string,id:string|number) => { await client.delete(`${path}/${id}`); };
