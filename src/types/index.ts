export type Role = 'USER' | 'ADMIN';
export interface User { id?: number; email: string; name: string; role: Role; phone?:string; birth?:string; gender?:string; createdAt?:string }
export interface PaginationMeta { page:number; size:number; totalElements:number; totalPages:number }
export interface ApiFieldError { field:string; reason:string }
export interface ApiResponse<T> { success:true; code:number; message?:string; data:T; meta?:PaginationMeta }
export interface ApiErrorResponse { success:false; code:number; message:string; errors?:ApiFieldError[] }
/** 화면 모델: API의 data 배열과 최상위 meta를 합쳐 생성한다. */
export interface Page<T> extends PaginationMeta { content:T[] }
export interface SpringPage<T> { content:T[]; number:number; size:number; totalElements:number; totalPages:number; first:boolean; last:boolean; empty:boolean }
export interface News { id:number; title:string; content:string; category?:string; thumbnailUrl?:string; imageUrl?:string; publishedAt?:string; createdAt?:string; viewCount?:number }
export type Position = 'GK'|'DF'|'MF'|'FW';
export interface PlayerStats { appearances?:number; goals?:number; assists?:number; yellowCards?:number; redCards?:number; [key:string]:string|number|undefined }
export interface Player { id:number; name:string; backNumber?:number; number?:number; position:Position; nationality?:string; profileImageUrl?:string; imageUrl?:string; introduction?:string; stats?:PlayerStats }
export type PlayerApplicationStatus = 'PENDING'|'APPROVED'|'REJECTED';
export interface PlayerApplication { id:number; applicantName?:string; name:string; backNumber:number; position:Position; nationality:string; profileImageUrl?:string; status:PlayerApplicationStatus; rejectReason?:string; createdAt?:string }
export interface Match { id:number; season:string; round?:number|string; competition?:string; status:'SCHEDULED'|'LIVE'|'FINISHED'|'CANCELED'; matchDate:string; homeTeam?:string; awayTeam?:string; opponent?:string; stadium?:string; venue?:string; homeScore?:number; awayScore?:number; isHome?:boolean }
export interface Standing { rank:number; team?:string; teamName?:string; played:number; win?:number; won?:number; draw?:number; drawn?:number; lose?:number; lost?:number; goalsFor?:number; goalsAgainst?:number; goalDiff?:number; goalDifference?:number; points:number }
export type BoardType = 'free'|'cheering';
export interface Post { id:number; boardType?:string; userId?:number; title:string; content:string; authorName?:string; createdAt:string; viewCount?:number; likeCount?:number; commentCount?:number; comments?:Comment[] }
export interface Comment { id:number; userId?:number; content:string; authorName?:string; likeCount?:number; createdAt:string }
export interface Sponsor { id:number; name:string; tier:'OFFICIAL'|'PARTNER'; logoUrl?:string; linkUrl?:string; websiteUrl?:string }
export interface EventItem { id:number; title:string; content:string; imageUrl?:string; thumbnailUrl?:string; eventDate:string; startDate?:string; endDate?:string; status?:string; applied?:boolean; winners?:string[] }
export interface Notification { id:number; title:string; content:string; createdAt:string; isRead:boolean; message?:string; read?:boolean }
export interface LoginResponse { accessToken:string; refreshToken:string; user:User }
