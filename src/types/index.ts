export type Role = 'USER' | 'ADMIN';
export interface User { id?: number; email: string; name: string; role: Role }
export interface PaginationMeta { page:number; size:number; totalElements:number; totalPages:number }
export interface ApiFieldError { field:string; reason:string }
export interface ApiResponse<T> { success:true; code:number; message?:string; data:T; meta?:PaginationMeta }
export interface ApiErrorResponse { success:false; code:number; message:string; errors?:ApiFieldError[] }
/** 화면 모델: API의 data 배열과 최상위 meta를 합쳐 생성한다. */
export interface Page<T> extends PaginationMeta { content:T[] }
export interface SpringPage<T> { content:T[]; number:number; size:number; totalElements:number; totalPages:number; first:boolean; last:boolean; empty:boolean }
export interface News { id:number; title:string; content:string; thumbnailUrl?:string; imageUrl?:string; createdAt:string; viewCount?:number }
export type Position = 'GK'|'DF'|'MF'|'FW';
export interface Player { id:number; name:string; number?:number; position:Position; profileImageUrl?:string; imageUrl?:string; introduction?:string; birthDate?:string; height?:number; weight?:number }
export type PlayerApplicationStatus = 'PENDING'|'APPROVED'|'REJECTED';
export interface PlayerApplication { id:number; applicantName?:string; name:string; backNumber:number; position:Position; nationality:string; profileImageUrl?:string; status:PlayerApplicationStatus; rejectReason?:string; createdAt?:string }
export interface Match { id:number; season:string; status:'SCHEDULED'|'FINISHED'|'CANCELED'; matchDate:string; opponent:string; venue?:string; homeScore?:number; awayScore?:number; isHome?:boolean }
export interface Standing { rank:number; teamName:string; played:number; won:number; drawn:number; lost:number; goalsFor?:number; goalsAgainst?:number; goalDifference:number; points:number }
export type BoardType = 'free'|'cheering';
export interface Post { id:number; title:string; content:string; authorName:string; createdAt:string; viewCount?:number; commentCount?:number; comments?:Comment[] }
export interface Comment { id:number; content:string; authorName:string; createdAt:string }
export interface Sponsor { id:number; name:string; tier:'OFFICIAL'|'PARTNER'; logoUrl?:string; websiteUrl?:string }
export interface EventItem { id:number; title:string; content:string; thumbnailUrl?:string; startDate:string; endDate:string; status?:string; applied?:boolean; winners?:string[] }
export interface Notification { id:number; title:string; content:string; createdAt:string; isRead:boolean; message?:string; read?:boolean }
export interface LoginResponse { accessToken:string; refreshToken:string; user:User }
