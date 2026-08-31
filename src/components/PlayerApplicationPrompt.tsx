import {useState} from 'react';
import {ArrowRight,X} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useAuth} from '../hooks/useAuth';
import {useHasAppliedForPlayer} from '../hooks/usePlayerApplicationStatus';

export default function PlayerApplicationPrompt(){
  const {user,isAuthenticated,isAdmin}=useAuth();
  const [hidden,setHidden]=useState(false);
  const hasApplied=useHasAppliedForPlayer(isAuthenticated&&user?.role==='USER'&&!isAdmin);

  if(hidden||hasApplied!==false)return null;

  return <aside className="mb-8 flex flex-col gap-5 rounded-lg border-2 border-ink bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6" aria-label="선수 등록 신청 안내">
    <div>
      <p className="font-semibold">아직 선수 등록 신청을 안 하셨네요!</p>
      <p className="mt-1 text-sm text-muted">정식 팀원으로 활동해보세요.</p>
    </div>
    <div className="flex items-center gap-2 self-end sm:self-auto">
      <Link className="btn-primary" to="/players/apply">신청하러 가기 <ArrowRight className="ml-2 size-4"/></Link>
      <button type="button" className="rounded-md p-2 text-muted hover:bg-surface hover:text-ink" aria-label="선수 등록 신청 안내 닫기" onClick={()=>setHidden(true)}><X className="size-5"/></button>
    </div>
  </aside>;
}
