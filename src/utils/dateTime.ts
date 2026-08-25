/** datetime-local 입력값을 타임존 없는 API 로컬 일시로 변환한다. */
export const toLocalDateTime=(value:string)=>{
  const match=value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(?::(\d{2}))?/);
  return match?`${match[1]}:${match[2]??'00'}`:value;
};

/** 타임존이 생략된 서버 일시는 서버가 보낸 로컬 시각 그대로 해석한다. */
const parseApiDateTime=(value:string|number|Date)=>{
  if(value instanceof Date||typeof value==='number')return new Date(value);
  return new Date(value);
};

export const formatKoreanDateTime=(value:unknown,fallback='일시 미등록')=>{
  if(value===null||value===undefined||value==='')return fallback;
  const date=parseApiDateTime(String(value));
  if(Number.isNaN(date.getTime()))return fallback;
  return new Intl.DateTimeFormat('ko-KR',{
    year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',
  }).format(date);
};

/** API의 타임존 없는 로컬 일시를 datetime-local 입력 형식으로 변환한다. */
export const toKoreanDateTimeInput=(value:unknown)=>{
  if(value===null||value===undefined||value==='')return '';
  const raw=String(value);
  const local=raw.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
  if(local&&!/Z$|[+-]\d{2}:?\d{2}$/.test(raw))return local[1];
  const date=parseApiDateTime(String(value));
  if(Number.isNaN(date.getTime()))return '';
  const parts=new Intl.DateTimeFormat('en-CA',{
    year:'numeric',month:'2-digit',day:'2-digit',
    hour:'2-digit',minute:'2-digit',hourCycle:'h23',
  }).formatToParts(date);
  const part=(type:Intl.DateTimeFormatPartTypes)=>parts.find(item=>item.type===type)?.value??'';
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
};
