import {useState} from 'react';
import client,{unwrapData} from '../api/client';
import {create,list,remove,update} from '../api/resource';
import {PageHeader,State} from '../components/UI';
import {useAsync} from '../hooks/useAsync';
import type {Page} from '../types';
import {Link} from 'react-router-dom';
import {formatKoreanDateTime,toKoreanDateTimeInput,toKoreanOffsetDateTime} from '../utils/dateTime';
import {createNews,updateNews,type NewsInput} from '../api/news';
import {createEvent,updateEvent,type EventInput} from '../api/events';

type ResourceKey='news'|'players'|'matches'|'sponsors'|'events';
type FieldType='text'|'number'|'url'|'select'|'textarea'|'datetime-local'|'date'|'file';
interface Field {name:string;label:string;type:FieldType;required?:boolean;placeholder?:string;options?:Array<[string,string]>}

const resources:Array<[ResourceKey,string]>=[['news','뉴스'],['players','선수'],['matches','경기'],['sponsors','스폰서'],['events','이벤트']];
const fields:Record<Exclude<ResourceKey,'matches'>,Field[]>={
  news:[
    {name:'title',label:'제목',type:'text',required:true,placeholder:'뉴스 제목을 입력하세요'},
    {name:'category',label:'분류',type:'select',required:true,options:[['CLUB','구단 소식'],['MATCH','경기 소식'],['MEDIA','미디어'],['NOTICE','공지사항']]},
    {name:'imageFile',label:'썸네일 이미지',type:'file'},
    {name:'content',label:'내용',type:'textarea',required:true,placeholder:'뉴스 내용을 입력하세요'},
  ],
  players:[
    {name:'name',label:'선수 이름',type:'text',required:true},
    {name:'backNumber',label:'등번호',type:'number',required:true},
    {name:'position',label:'포지션',type:'select',required:true,options:[['GK','골키퍼 (GK)'],['DF','수비수 (DF)'],['MF','미드필더 (MF)'],['FW','공격수 (FW)']]},
    {name:'nationality',label:'국적',type:'text',placeholder:'대한민국'},
    {name:'profileImageUrl',label:'프로필 이미지 주소',type:'url',placeholder:'https://example.com/player.jpg'},
  ],
  sponsors:[
    {name:'name',label:'스폰서명',type:'text',required:true},
    {name:'tier',label:'등급',type:'select',required:true,options:[['OFFICIAL','공식 스폰서'],['PARTNER','파트너']]},
    {name:'logoUrl',label:'로고 이미지 주소',type:'url',placeholder:'https://example.com/logo.png'},
    {name:'linkUrl',label:'웹사이트 주소',type:'url',placeholder:'https://example.com'},
  ],
  events:[
    {name:'title',label:'이벤트 제목',type:'text',required:true},
    {name:'eventDate',label:'이벤트 날짜',type:'date',required:true},
    {name:'imageFile',label:'이벤트 이미지',type:'file'},
    {name:'content',label:'이벤트 내용',type:'textarea',required:true,placeholder:'이벤트 상세 내용을 입력하세요'},
  ],
};
const matchCreateFields:Field[]=[
  {name:'season',label:'시즌',type:'number',required:true,placeholder:'2026'},
  {name:'round',label:'라운드',type:'number',placeholder:'1'},
  {name:'competition',label:'대회명',type:'text',placeholder:'정규 리그'},
  {name:'homeTeam',label:'홈팀',type:'text',required:true},
  {name:'awayTeam',label:'원정팀',type:'text',required:true},
  {name:'matchDate',label:'경기 일시 (한국 시간)',type:'datetime-local',required:true},
  {name:'stadium',label:'경기장',type:'text'},
];
const matchUpdateFields:Field[]=[
  {name:'status',label:'경기 상태',type:'select',required:true,options:[['SCHEDULED','경기 예정'],['LIVE','진행 중'],['FINISHED','경기 종료']]},
  {name:'homeScore',label:'홈팀 점수',type:'number'},
  {name:'awayScore',label:'원정팀 점수',type:'number'},
];

const loadRecords=async(resource:ResourceKey):Promise<Page<Record<string,unknown>>>=>{
  if(resource==='sponsors'){
    const content=await client.get('/sponsors').then(unwrapData<Record<string,unknown>[]>);
    return {content,page:0,size:content.length,totalElements:content.length,totalPages:1};
  }
  return list<Record<string,unknown>>(`/${resource}`,{size:100});
};

export default function AdminPage(){
  const [resource,setResource]=useState<ResourceKey>('news');
  const records=useAsync(()=>loadRecords(resource),[resource]);
  const [editing,setEditing]=useState<Record<string,unknown>|null>(null);
  const [form,setForm]=useState<Record<string,string>>({});
  const [imageFile,setImageFile]=useState<File|null>(null);
  const [formError,setFormError]=useState('');
  const isEdit=editing?.id!==undefined;
  const activeFields=resource==='matches'?(isEdit?matchUpdateFields:matchCreateFields):fields[resource];

  const start=(item:Record<string,unknown>={})=>{
    setEditing(item);
    setForm(Object.fromEntries(Object.entries(item).map(([key,value])=>[key,toInputValue(key,value)])));
    setImageFile(null);
    setFormError('');
  };
  const close=()=>{setEditing(null);setForm({});setImageFile(null);setFormError('')};
  const save=async(event:React.FormEvent)=>{
    event.preventDefault();
    const missing=activeFields.find(field=>field.required&&!form[field.name]?.trim());
    if(missing){setFormError(`${missing.label}을(를) 입력해주세요.`);return}
    const payload:Record<string,string|number>={};
    activeFields.forEach(field=>{
      if(field.type==='file')return;
      const value=form[field.name];
      if(value===undefined||value==='')return;
      if(field.type==='number')payload[field.name]=Number(value);
      else if(field.type==='datetime-local')payload[field.name]=toKoreanOffsetDateTime(value);
      else payload[field.name]=value.trim();
    });
    try{
      const path=`/admin/${resource}`;
      if(resource==='news'){
        const input={...payload,thumbnailUrl:String(editing?.thumbnailUrl??editing?.imageUrl??'')||null} as NewsInput;
        if(isEdit)await updateNews(String(editing.id),input,imageFile);else await createNews(input,imageFile);
      }else if(resource==='events'){
        const input={...payload,imageUrl:String(editing?.imageUrl??editing?.thumbnailUrl??'')||null} as EventInput;
        if(isEdit)await updateEvent(String(editing.id),input,imageFile);else await createEvent(input,imageFile);
      }else if(isEdit)await update(path,String(editing.id),payload);else await create(path,payload);
      close();
      await records.reload();
    }catch(error){setFormError(error instanceof Error?error.message:'저장하지 못했습니다.')}
  };
  const del=async(id:unknown)=>{if(!confirm('정말 삭제하시겠습니까? 삭제한 정보는 복구할 수 없습니다.'))return;await remove(`/admin/${resource}`,String(id));await records.reload()};

  return <div className="container-page page-space">
    <PageHeader title="관리자" description="서원 FC 홈페이지에 표시할 콘텐츠를 관리합니다." action={<div className="flex gap-2"><Link className="btn-primary" to="/admin/player-applications">선수 신청 관리</Link><button className="btn-secondary" onClick={()=>start()}>새 항목 등록</button></div>}/>
    <div className="mb-8 flex gap-2 overflow-x-auto">{resources.map(([key,label])=><button key={key} className={resource===key?'btn-primary':'btn-secondary'} onClick={()=>{setResource(key);close()}}>{label}</button>)}</div>
    {editing&&<AdminForm
      title={`${resourceLabel(resource)} ${isEdit?'수정':'등록'}`}
      fields={activeFields}
      values={form}
      error={formError}
      onChange={(name,value)=>setForm(current=>({...current,[name]:value}))}
      onFileChange={setImageFile}
      onSubmit={save}
      onCancel={close}
    />}
    <State loading={records.loading} error={records.error} empty={!records.data?.content.length} emptyMessage={`등록된 ${resourceLabel(resource)} 정보가 없습니다.`}>
      <div className="grid gap-4 md:grid-cols-2">{records.data?.content.map((item,index)=><article className="card flex flex-col p-5" key={String(item.id??index)}>
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs text-muted">{resourceLabel(resource)} #{String(item.id??'-')}</p><h2 className="mt-2 text-lg font-semibold">{recordTitle(resource,item)}</h2></div>{Boolean(item.status)&&<span className="rounded bg-surface px-2 py-1 text-xs">{displayValue(String(item.status))}</span>}</div>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted">{recordSummary(resource,item)}</p>
        <div className="mt-auto flex gap-3 border-t border-line pt-4"><button className="text-sm font-medium underline underline-offset-4" onClick={()=>start(item)}>수정</button><button className="text-sm text-danger underline underline-offset-4" onClick={()=>del(item.id)}>삭제</button></div>
      </article>)}</div>
    </State>
  </div>;
}

function AdminForm({title,fields,values,error,onChange,onFileChange,onSubmit,onCancel}:{title:string;fields:Field[];values:Record<string,string>;error:string;onChange:(name:string,value:string)=>void;onFileChange:(file:File|null)=>void;onSubmit:(event:React.FormEvent)=>void;onCancel:()=>void}){
  return <section className="mb-10 rounded-lg border border-line bg-surface p-5 md:p-7"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 text-sm text-muted"><span className="text-danger">*</span> 표시는 필수 입력 항목입니다.</p>
    <form className="mt-6 grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>{fields.map(field=><label className={field.type==='textarea'?'md:col-span-2':''} key={field.name}><span className="label">{field.label}{field.required&&<span className="ml-1 text-danger">*</span>}</span><FormControl field={field} value={values[field.name]??''} onChange={value=>onChange(field.name,value)} onFileChange={onFileChange}/>{field.type==='file'&&<span className="mt-2 block text-xs text-muted">수정 시 선택하지 않으면 기존 이미지를 유지합니다.</span>}</label>)}
      {error&&<p className="text-sm text-danger md:col-span-2">{error}</p>}<div className="flex justify-end gap-2 md:col-span-2"><button type="button" className="btn-secondary" onClick={onCancel}>취소</button><button className="btn-primary">저장하기</button></div>
    </form>
  </section>;
}

function FormControl({field,value,onChange,onFileChange}:{field:Field;value:string;onChange:(value:string)=>void;onFileChange:(file:File|null)=>void}){
  if(field.type==='textarea')return <textarea className="field min-h-56 resize-y" value={value} placeholder={field.placeholder} onChange={event=>onChange(event.target.value)}/>;
  if(field.type==='select')return <select className="field" value={value} onChange={event=>onChange(event.target.value)}><option value="">선택해주세요</option>{field.options?.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select>;
  if(field.type==='file')return <input className="field py-2" type="file" accept="image/*" onChange={event=>onFileChange(event.target.files?.[0]??null)}/>;
  return <input className="field" type={field.type} min={field.type==='number'?0:undefined} value={value} placeholder={field.placeholder} onChange={event=>onChange(event.target.value)}/>;
}

const toInputValue=(key:string,value:unknown)=>{if(value===null||value===undefined)return '';if(['startDate','endDate','matchDate'].includes(key))return toKoreanDateTimeInput(value);return String(value)};
const resourceLabel=(resource:ResourceKey)=>({news:'뉴스',players:'선수',matches:'경기',sponsors:'스폰서',events:'이벤트'}[resource]);
const recordTitle=(resource:ResourceKey,item:Record<string,unknown>)=>String(item.title??item.name??(resource==='matches'?`${item.homeTeam??'홈팀'} vs ${item.awayTeam??'원정팀'}`:'제목 없음'));
const recordSummary=(resource:ResourceKey,item:Record<string,unknown>)=>{if(resource==='news'||resource==='events')return String(item.content??'내용 없음');if(resource==='players')return `${displayValue(String(item.position??''))} · 등번호 ${item.backNumber??'-'} · ${item.nationality??'국적 미등록'}`;if(resource==='matches')return `${item.competition??'대회 미등록'} · ${formatDate(item.matchDate)} · ${item.stadium??'경기장 미정'}`;return `${displayValue(String(item.tier??''))} · ${item.linkUrl??'웹사이트 미등록'}`};
const displayValue=(value:string)=>({CLUB:'구단 소식',MATCH:'경기 소식',MEDIA:'미디어',NOTICE:'공지사항',OFFICIAL:'공식 스폰서',PARTNER:'파트너',GK:'골키퍼',DF:'수비수',MF:'미드필더',FW:'공격수',SCHEDULED:'경기 예정',LIVE:'진행 중',FINISHED:'경기 종료'}[value]??value);
const formatDate=(value:unknown)=>formatKoreanDateTime(value);
