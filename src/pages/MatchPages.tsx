import {useState} from 'react';
import {getMatches,getStandings} from '../api/matches';
import {useAsync} from '../hooks/useAsync';
import type {Match,Standing} from '../types';
import {PageHeader,State} from '../components/UI';
import {formatKoreanDateTime} from '../utils/dateTime';

export function MatchesPage(){
  const [season,setSeason]=useState('');
  const [status,setStatus]=useState('');
  const {data,loading,error}=useAsync(()=>getMatches({season:season||undefined,status:status||undefined,size:50}),[season,status]);
  return <div className="container-page page-space">
    <PageHeader title="경기 일정 / 결과" description="서원 FC의 경기 일정을 확인하세요."/>
    <div className="mb-8 grid gap-3 sm:grid-cols-2">
      <input className="field" placeholder="시즌 (예: 2026)" value={season} onChange={e=>setSeason(e.target.value)}/>
      <select className="field" value={status} onChange={e=>setStatus(e.target.value)}>
        <option value="">전체 상태</option><option value="SCHEDULED">예정</option><option value="FINISHED">종료</option><option value="CANCELED">취소</option>
      </select>
    </div>
    <State loading={loading} error={error} empty={!data?.content.length} emptyMessage="아직 등록된 경기일정/결과가 없습니다.">
      <div className="space-y-4">{data?.content.map(m=><MatchCard key={m.id} match={m}/>)}</div>
    </State>
  </div>;
}

function MatchCard({match:m}:{match:Match}){
  const home=m.homeTeam??(m.isHome!==false?'서원 FC':m.opponent)??'-';
  const away=m.awayTeam??(m.isHome!==false?m.opponent:'서원 FC')??'-';
  return <article className="card grid items-center gap-4 p-5 sm:grid-cols-[1fr_2fr_1fr]">
    <div><p className="text-xs font-medium">{[m.season,m.competition,m.round&&`${m.round}R`].filter(Boolean).join(' · ')}</p><p className="mt-2 text-xs text-muted">{formatKoreanDateTime(m.matchDate)} KST</p><p className="mt-1 text-sm">{m.stadium||m.venue||'장소 미정'}</p></div>
    <div className="flex items-center justify-center gap-4 text-center"><strong className="w-28">{home}</strong><span className="text-xl font-bold">{m.status==='FINISHED'||m.status==='LIVE'?`${m.homeScore??0} : ${m.awayScore??0}`:'VS'}</span><strong className="w-28">{away}</strong></div>
    <span className="justify-self-start rounded bg-surface px-3 py-1 text-xs sm:justify-self-end">{{SCHEDULED:'예정',LIVE:'진행 중',FINISHED:'종료',CANCELED:'취소'}[m.status]}</span>
  </article>;
}

export function StandingsPage(){
  const [season,setSeason]=useState('');
  const {data,loading,error}=useAsync(()=>getStandings(season||undefined),[season]);
  const rows=data?.content;
  return <div className="container-page page-space">
    <PageHeader title="리그 순위" description="현재 시즌 순위표입니다."/>
    <input className="field mb-8 max-w-xs" placeholder="시즌" value={season} onChange={e=>setSeason(e.target.value)}/>
    <State loading={loading} error={error} empty={!rows?.length}>
      <div className="overflow-x-auto border border-line"><table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-surface"><tr>{['순위','팀','경기','승','무','패','득점','실점','득실','승점'].map(x=><th className="p-4" key={x}>{x}</th>)}</tr></thead>
        <tbody className="divide-y divide-line">{rows?.map((r:Standing)=><tr key={r.rank}><td className="p-4 font-bold">{r.rank}</td><td className="p-4 font-medium">{r.team??r.teamName??'-'}</td><td className="p-4">{r.played}</td><td className="p-4">{r.win??r.won??0}</td><td className="p-4">{r.draw??r.drawn??0}</td><td className="p-4">{r.lose??r.lost??0}</td><td className="p-4">{r.goalsFor??'-'}</td><td className="p-4">{r.goalsAgainst??'-'}</td><td className="p-4">{r.goalDiff??r.goalDifference??'-'}</td><td className="p-4 font-bold">{r.points}</td></tr>)}</tbody>
      </table></div>
    </State>
  </div>;
}
