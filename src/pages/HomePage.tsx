import {useEffect,useState} from 'react';
import {ArrowRight,X} from 'lucide-react';
import {Link,useNavigate} from 'react-router-dom';
import {getLatestNotice} from '../api/news';
import type {News} from '../types';

const NOTICE_HIDE_KEY='seowonfc_notice_hidden';
const ONE_DAY=24*60*60*1000;

interface HiddenNotice {id:number;until:number}

const isHidden=(notice:News)=>{
  try {
    const saved=JSON.parse(localStorage.getItem(NOTICE_HIDE_KEY)??'null') as HiddenNotice|null;
    return saved?.id===notice.id&&saved.until>Date.now();
  } catch {
    return false;
  }
};

export default function HomePage(){
  const navigate=useNavigate();
  const [notice,setNotice]=useState<News>();
  const [hideForDay,setHideForDay]=useState(false);

  useEffect(()=>{
    let active=true;
    void getLatestNotice().then(({content})=>{
      const latest=content[0];
      if(active&&latest&&!isHidden(latest))setNotice(latest);
    }).catch(()=>undefined);
    return()=>{active=false};
  },[]);

  const rememberHidden=()=>{
    if(!notice||!hideForDay)return;
    try {
      localStorage.setItem(NOTICE_HIDE_KEY,JSON.stringify({id:notice.id,until:Date.now()+ONE_DAY}));
    } catch {
      // 저장소를 사용할 수 없는 환경에서는 현재 화면에서만 닫는다.
    }
  };
  const closeNotice=()=>{rememberHidden();setNotice(undefined)};
  const openNotice=()=>{
    if(!notice)return;
    rememberHidden();
    navigate(`/news/${notice.id}`);
  };

  useEffect(()=>{
    if(!notice)return;
    const closeOnEscape=(event:KeyboardEvent)=>{if(event.key==='Escape')closeNotice()};
    window.addEventListener('keydown',closeOnEscape);
    return()=>window.removeEventListener('keydown',closeOnEscape);
  },[notice,hideForDay]);

  return <>
    <section className="border-b border-line bg-ink text-white"><div className="container-page py-20 md:py-32"><p className="text-sm font-medium tracking-[.25em]">TOGETHER, WE ARE STRONGER</p><h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight md:text-7xl">우리의 축구,<br/>우리의 서원 FC.</h1><p className="mt-6 max-w-xl text-white/70">경기장 안팎에서 함께 성장하는 서원 FC의 소식과 이야기를 만나보세요.</p><Link to="/matches" className="btn mt-10 bg-white text-ink">경기 일정 보기 <ArrowRight className="ml-2 size-4"/></Link></div></section>
    <section className="container-page grid gap-px bg-line py-12 md:grid-cols-3 md:py-20">{[['NEWS','구단의 새로운 소식을 확인하세요.','/news'],['TEAM','서원 FC 선수단을 소개합니다.','/players'],['EVENT','서원 FC의 다양한 이벤트를 확인하세요.','/events']].map(([title,text,to])=><Link key={title} to={to} className="group bg-white p-8 md:p-10"><p className="text-xs text-muted">{title}</p><h2 className="mt-4 text-xl font-semibold">{text}</h2><ArrowRight className="mt-8 transition-transform group-hover:translate-x-1"/></Link>)}</section>
    {notice&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onMouseDown={event=>{if(event.target===event.currentTarget)closeNotice()}}>
      <div role="dialog" aria-modal="true" aria-labelledby="notice-title" className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="cursor-pointer" role="link" tabIndex={0} onClick={openNotice} onKeyDown={event=>{if(event.key==='Enter')openNotice()}}>
          <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
            <div><p className="text-xs font-semibold tracking-widest text-muted">NOTICE</p><h2 id="notice-title" className="mt-2 text-xl font-bold">{notice.title}</h2></div>
            <button type="button" aria-label="공지 닫기" className="shrink-0 rounded-md p-1 text-muted hover:bg-surface hover:text-ink" onClick={event=>{event.stopPropagation();closeNotice()}}><X className="size-5"/></button>
          </div>
          {(notice.imageUrl||notice.thumbnailUrl)&&<img src={notice.imageUrl||notice.thumbnailUrl} alt="" className="max-h-64 w-full object-cover"/>}
          <p className="line-clamp-4 whitespace-pre-wrap px-6 py-5 text-sm leading-6 text-muted">{notice.content}</p>
          <p className="px-6 pb-5 text-sm font-semibold">자세히 보기 <ArrowRight className="ml-1 inline size-4"/></p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface px-6 py-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-ink" checked={hideForDay} onChange={event=>setHideForDay(event.target.checked)}/>하루 동안 보지 않기</label>
          <button type="button" className="text-sm font-medium hover:underline" onClick={closeNotice}>닫기</button>
        </div>
      </div>
    </div>}
  </>;
}
