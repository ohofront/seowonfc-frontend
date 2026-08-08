import { CircleCheck, CircleX, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export type FeedbackDetail = { type:'success'|'error'; title:string; message:string };

export function Spinner({ label='불러오는 중' }:{ label?:string }) {
  return <span className="inline-flex items-center gap-3" role="status" aria-live="polite">
    <span className="size-6 animate-spin rounded-full border-2 border-line border-t-ink" aria-hidden="true" />
    <span>{label}</span>
  </span>;
}

export default function GlobalFeedback() {
  const [requests,setRequests]=useState(0);
  const [feedback,setFeedback]=useState<FeedbackDetail|null>(null);

  useEffect(()=>{
    const start=()=>setRequests((count)=>count+1);
    const end=()=>setRequests((count)=>Math.max(0,count-1));
    const show=(event:Event)=>setFeedback((event as CustomEvent<FeedbackDetail>).detail);
    addEventListener('api:request-start',start);
    addEventListener('api:request-end',end);
    addEventListener('api:feedback',show);
    return ()=>{
      removeEventListener('api:request-start',start);
      removeEventListener('api:request-end',end);
      removeEventListener('api:feedback',show);
    };
  },[]);

  useEffect(()=>{
    if(!feedback)return;
    const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setFeedback(null)};
    addEventListener('keydown',close);
    return()=>removeEventListener('keydown',close);
  },[feedback]);

  return <>
    {requests>0&&<div className="fixed inset-0 z-[80] flex items-center justify-center bg-white/70 backdrop-blur-[1px]" aria-label="요청 처리 중">
      <div className="rounded-lg border border-line bg-white px-7 py-5 text-sm"><Spinner label="처리 중..."/></div>
    </div>}
    {feedback&&<div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4" role="presentation" onMouseDown={()=>setFeedback(null)}>
      <section className="relative w-full max-w-sm rounded-lg border border-line bg-white p-6" role="alertdialog" aria-modal="true" aria-labelledby="feedback-title" onMouseDown={(event)=>event.stopPropagation()}>
        <button className="absolute right-4 top-4 p-1 text-muted hover:text-ink" aria-label="닫기" onClick={()=>setFeedback(null)}><X className="size-5"/></button>
        {feedback.type==='success'?<CircleCheck className="size-9 text-ink"/>:<CircleX className="size-9 text-danger"/>}
        <h2 id="feedback-title" className="mt-5 text-xl font-semibold">{feedback.title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted">{feedback.message}</p>
        <button className="btn-primary mt-6 w-full" autoFocus onClick={()=>setFeedback(null)}>확인</button>
      </section>
    </div>}
  </>;
}
