const KOREA_TIME_ZONE='Asia/Seoul';

/** datetime-local 입력값을 타임존 없는 API 로컬 일시로 변환한다. */
export const toLocalDateTime=(value:string)=>{
  const match=value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(?::(\d{2}))?/);
  return match?`${match[1]}:${match[2]??'00'}`:value;
};

/** 타임존이 생략된 서버 일시는 UTC로 간주한다. */
const parseApiDateTime=(value:string|number|Date)=>{
  if(value instanceof Date||typeof value==='number')return new Date(value);
  const hasTimeZone=/Z$|[+-]\d{2}:?\d{2}$/.test(value);
  return new Date(hasTimeZone?value:`${value}Z`);
};

export const formatKoreanDateTime=(value:unknown,fallback='일시 미등록')=>{
  if(value===null||value===undefined||value==='')return fallback;
  const date=parseApiDateTime(String(value));
  if(Number.isNaN(date.getTime()))return fallback;
  return new Intl.DateTimeFormat('ko-KR',{
    timeZone:KOREA_TIME_ZONE,
    year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',
  }).format(date);
};

/** API 일시를 한국 시각의 datetime-local 입력 형식으로 변환한다. */
export const toKoreanDateTimeInput=(value:unknown)=>{
  if(value===null||value===undefined||value==='')return '';
  const date=parseApiDateTime(String(value));
  if(Number.isNaN(date.getTime()))return '';
  const parts=new Intl.DateTimeFormat('en-CA',{
    timeZone:KOREA_TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit',
    hour:'2-digit',minute:'2-digit',hourCycle:'h23',
  }).formatToParts(date);
  const part=(type:Intl.DateTimeFormatPartTypes)=>parts.find(item=>item.type===type)?.value??'';
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
};
