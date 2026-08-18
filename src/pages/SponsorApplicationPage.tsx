import {useState} from 'react';
import {Link} from 'react-router-dom';
import {createSponsorApplication} from '../api/sponsorApplications';
import {PageHeader} from '../components/UI';
import type {SponsorTier} from '../types';

const initialForm={companyName:'',contactName:'',contactEmail:'',contactPhone:'',desiredTier:'' as SponsorTier|'',message:'',websiteUrl:''};

export default function SponsorApplicationPage(){
  const [form,setForm]=useState(initialForm);
  const [file,setFile]=useState<File|null>(null);
  const [submitting,setSubmitting]=useState(false);
  const [error,setError]=useState('');
  const change=(name:string,value:string)=>setForm(current=>({...current,[name]:value}));
  const submit=async(event:React.FormEvent)=>{
    event.preventDefault();
    if(!form.desiredTier){setError('희망 등급을 선택해주세요.');return}
    if(!file){setError('로고 이미지를 선택해주세요.');return}
    setSubmitting(true);setError('');
    try{
      await createSponsorApplication({...form,desiredTier:form.desiredTier,companyName:form.companyName.trim(),contactName:form.contactName.trim(),contactEmail:form.contactEmail.trim(),contactPhone:form.contactPhone.trim(),message:form.message.trim(),websiteUrl:form.websiteUrl.trim()||undefined},file);
      setForm(initialForm);setFile(null);
    }catch(reason){setError(reason instanceof Error?reason.message:'스폰서 신청을 접수하지 못했습니다.')}finally{setSubmitting(false)}
  };
  return <div className="container-page page-space"><div className="mx-auto max-w-3xl"><PageHeader title="스폰서 신청" description="서원 FC와 함께할 기업과 후원자의 신청을 기다립니다."/><form className="card grid gap-5 p-5 md:grid-cols-2 md:p-8" onSubmit={submit}><label><span className="label">회사명 *</span><input className="field" required value={form.companyName} onChange={e=>change('companyName',e.target.value)}/></label><label><span className="label">담당자명 *</span><input className="field" required value={form.contactName} onChange={e=>change('contactName',e.target.value)}/></label><label><span className="label">담당자 이메일 *</span><input className="field" type="email" required value={form.contactEmail} onChange={e=>change('contactEmail',e.target.value)}/></label><label><span className="label">담당자 연락처 *</span><input className="field" type="tel" required value={form.contactPhone} onChange={e=>change('contactPhone',e.target.value)}/></label><label><span className="label">희망 등급 *</span><select className="field" required value={form.desiredTier} onChange={e=>change('desiredTier',e.target.value)}><option value="">선택해주세요</option><option value="OFFICIAL">공식 스폰서</option><option value="PARTNER">파트너</option></select></label><label><span className="label">웹사이트 링크</span><input className="field" type="url" placeholder="https://example.com" value={form.websiteUrl} onChange={e=>change('websiteUrl',e.target.value)}/></label><label className="md:col-span-2"><span className="label">로고 이미지 *</span><input className="field py-2" type="file" accept="image/*" required onChange={e=>setFile(e.target.files?.[0]??null)}/></label><label className="md:col-span-2"><span className="label">소개 메시지 *</span><textarea className="field min-h-40 resize-y" required value={form.message} onChange={e=>change('message',e.target.value)}/></label>{error&&<p className="text-sm text-danger md:col-span-2">{error}</p>}<div className="flex justify-end gap-2 md:col-span-2"><Link className="btn-secondary" to="/sponsors">취소</Link><button className="btn-primary" disabled={submitting}>{submitting?'접수 중...':'신청하기'}</button></div></form></div></div>;
}
