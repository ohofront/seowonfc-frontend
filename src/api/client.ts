import axios, { type AxiosResponse } from 'axios';
import type { ApiErrorResponse, ApiFieldError, ApiResponse, Page, PaginationMeta } from '../types';
import { clearAuth, getAccessToken } from '../utils/authStorage';

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
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
},(error)=>{emit('api:request-end');return Promise.reject(error)});

client.interceptors.response.use((response) => {
  emit('api:request-end');
  const method=response.config.method?.toUpperCase()??'GET';
  const body=response.data as ApiResponse<unknown>|ApiErrorResponse;
  const request=describeRequest(method,response.config.url);
  if(isApiErrorResponse(body)){
    emit('api:feedback',{type:'error',...errorFeedback(request,body.message,body.errors)});
    return Promise.reject(new ApiResponseError(body.code,body.message,body.errors??[]));
  }
  if(['POST','PUT','PATCH','DELETE'].includes(method)){
    const message=request==='스폰서 신청'?'신청이 접수되었습니다. 검토 후 연락드리겠습니다.':`${request} 요청이 성공적으로 완료되었습니다.`;
    emit('api:feedback',{type:'success',title:`${request} 완료`,message});
  }
  return response;
}, (error) => {
  emit('api:request-end');
  const method=error.config?.method?.toUpperCase()??'GET';
  const request=describeRequest(method,error.config?.url);
  if (error.response?.status === 401) {
    clearAuth();
    window.dispatchEvent(new Event('auth:expired'));
    if (!location.pathname.startsWith('/login')) location.assign(`/login?redirect=${encodeURIComponent(location.pathname)}`);
  }
  const body:unknown = error.response?.data;
  if (isApiErrorResponse(body)) {
    emit('api:feedback',{type:'error',...errorFeedback(request,body.message,body.errors)});
    return Promise.reject(new ApiResponseError(body.code, body.message, body.errors ?? []));
  }
  emit('api:feedback',{type:'error',...errorFeedback(request,error.message||'서버와 통신하지 못했습니다.')});
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

const resourceLabels:Record<string,string>={news:'뉴스',players:'선수',matches:'경기',sponsors:'스폰서',events:'이벤트'};
const boardLabels:Record<string,string>={FREE:'자유게시판',CHEERING:'응원게시판'};

const describeRequest=(method:string,rawUrl:string|undefined)=>{
  const url=(rawUrl??'').split('?')[0].replace(/^.*\/api\/v1/,'');
  if(url==='/auth/login')return '로그인';
  if(url==='/auth/signup')return '회원가입';
  if(url==='/users/me')return method==='GET'?'내 정보 조회':'내 정보 수정';
  if(url==='/images')return '이미지 업로드';
  if(url==='/sponsor-applications')return '스폰서 신청';
  if(url==='/player-applications')return method==='POST'?'선수 등록 신청':'선수 등록 신청 조회';
  if(url==='/player-applications/me')return '내 선수 등록 신청 조회';
  if(url==='/admin/player-applications')return '대기 중인 선수 등록 신청 조회';
  if(/^\/admin\/player-applications\/[^/]+\/approve$/.test(url))return '선수 등록 신청 승인';
  if(/^\/admin\/player-applications\/[^/]+\/reject$/.test(url))return '선수 등록 신청 반려';
  if(url==='/admin/sponsor-applications')return '대기 중인 스폰서 신청 조회';
  if(/^\/admin\/sponsor-applications\/[^/]+\/approve$/.test(url))return '스폰서 신청 승인';
  if(/^\/admin\/sponsor-applications\/[^/]+\/reject$/.test(url))return '스폰서 신청 반려';
  if(/^\/events\/[^/]+\/apply$/.test(url))return '이벤트 응모';
  if(/^\/events\/[^/]+\/winners$/.test(url))return '이벤트 당첨자 조회';
  if(url==='/notifications/me')return '알림 목록 조회';
  if(/^\/notifications\/[^/]+\/read$/.test(url))return '알림 읽음 처리';
  if(url==='/standings')return '리그 순위 조회';
  const board=url.match(/^\/boards\/([^/]+)\/posts(?:\/[^/]+)?(\/comments)?$/);
  if(board){
    const label=boardLabels[board[1]]??'게시판';
    if(board[2])return `${label} 댓글 등록`;
    if(method==='GET')return `${label} ${url.match(/\/posts\/[^/]+$/)?'게시글 조회':'목록 조회'}`;
    return `${label} 게시글 ${method==='POST'?'등록':'수정'}`;
  }
  const admin=url.match(/^\/admin\/(news|players|matches|sponsors|events)(?:\/[^/]+)?$/);
  if(admin){
    const action=method==='POST'?'등록':method==='DELETE'?'삭제':'수정';
    return `${resourceLabels[admin[1]]} ${action}`;
  }
  const publicResource=url.match(/^\/(news|players|matches|sponsors|events)(\/[^/]+)?$/);
  if(publicResource)return `${resourceLabels[publicResource[1]]} ${publicResource[2]?'상세 조회':'목록 조회'}`;
  return '요청 처리';
};

const errorFeedback=(request:string,message:string,errors:ApiFieldError[]=[])=>{
  const details=errors.map(({field,reason})=>`${field}: ${reason}`).join(', ');
  return {
    title:`${request} 실패`,
    message:details?`${message} (${details})`:message,
  };
};

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
