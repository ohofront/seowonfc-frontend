import axios, { type AxiosResponse } from 'axios';
import type { ApiErrorResponse, ApiFieldError, ApiResponse, Page, PaginationMeta } from '../types';

export class ApiResponseError extends Error {
  constructor(public readonly code:number, message:string, public readonly errors:ApiFieldError[] = []) {
    super(message);
    this.name = 'ApiResponseError';
  }
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://seowonfc-api.onrender.com/api/v1',
  timeout: 15000,
});

const emit = (name:string,detail?:unknown) => window.dispatchEvent(new CustomEvent(name,{detail}));

client.interceptors.request.use((config) => {
  emit('api:request-start');
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
},(error)=>{emit('api:request-end');return Promise.reject(error)});

client.interceptors.response.use((response) => {
  emit('api:request-end');
  const method=response.config.method?.toUpperCase();
  const body=response.data as {success?:boolean;message?:string}|undefined;
  if(method&&['POST','PUT','PATCH','DELETE'].includes(method)&&body?.success!==false){
    emit('api:feedback',{type:'success',title:'처리 완료',message:body?.message||'요청이 성공적으로 처리되었습니다.'});
  }
  return response;
}, (error) => {
  emit('api:request-end');
  if (error.response?.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth:expired'));
    if (!location.pathname.startsWith('/login')) location.assign(`/login?redirect=${encodeURIComponent(location.pathname)}`);
  }
  const body:unknown = error.response?.data;
  if (isApiErrorResponse(body)) {
    emit('api:feedback',{type:'error',title:'요청 실패',message:body.message});
    return Promise.reject(new ApiResponseError(body.code, body.message, body.errors ?? []));
  }
  emit('api:feedback',{type:'error',title:'요청 실패',message:error.message||'서버와 통신하지 못했습니다.'});
  return Promise.reject(error);
});

const isApiErrorResponse = (body:unknown):body is ApiErrorResponse => typeof body === 'object'
  && body !== null
  && 'success' in body
  && body.success === false
  && 'code' in body
  && typeof body.code === 'number'
  && 'message' in body
  && typeof body.message === 'string';

function assertSuccess<T>(body:ApiResponse<T>|ApiErrorResponse): asserts body is ApiResponse<T> {
  if (!body.success) {
    emit('api:feedback',{type:'error',title:'요청 실패',message:body.message});
    throw new ApiResponseError(body.code, body.message, body.errors ?? []);
  }
}

/** 명세의 공통 응답 envelope에서 data만 반환한다. */
export const unwrapData = <T>(response:AxiosResponse<ApiResponse<T>|ApiErrorResponse>):T => {
  assertSuccess(response.data);
  return response.data.data;
};

/** 목록 응답의 data 배열과 최상위 meta를 화면용 Page 모델로 합친다. */
type PagePayload<T> = T[] | { content:T[]; number:number; size:number; totalElements:number; totalPages:number };

export const unwrapPage = <T>(response:AxiosResponse<ApiResponse<PagePayload<T>>|ApiErrorResponse>):Page<T> => {
  assertSuccess(response.data);
  const { data, meta } = response.data;
  if (Array.isArray(data) && isPaginationMeta(meta)) return { content:data, ...meta };
  if (isSpringPage(data)) return {
    content:data.content,
    page:data.number,
    size:data.size,
    totalElements:data.totalElements,
    totalPages:data.totalPages,
  };
  throw new ApiResponseError(50000, '목록 응답 형식을 확인할 수 없습니다.');
};

const isPaginationMeta = (meta:PaginationMeta|undefined):meta is PaginationMeta => Boolean(meta)
  && Number.isInteger(meta?.page)
  && Number.isInteger(meta?.size)
  && Number.isInteger(meta?.totalElements)
  && Number.isInteger(meta?.totalPages);

const isSpringPage = <T>(data:PagePayload<T>):data is Exclude<PagePayload<T>,T[]> => typeof data === 'object'
  && data !== null
  && 'content' in data
  && Array.isArray(data.content)
  && Number.isInteger(data.number)
  && Number.isInteger(data.size)
  && Number.isInteger(data.totalElements)
  && Number.isInteger(data.totalPages);

export default client;
