import { Bell, ShieldCheck, UserRound } from 'lucide-react';
import { getNotifications, readNotification } from '../api/notifications';
import { PageHeader, State } from '../components/UI';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../hooks/useAuth';

export default function MyPage(){
  const {user}=useAuth();
  const notes=useAsync(getNotifications,[]);
  const markRead=async(id:number)=>{await readNotification(id);await notes.reload()};

  return <div className="container-page page-space">
    <PageHeader title="마이페이지" description="회원 정보와 알림을 확인하세요."/>
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <section>
        <div className="mb-5 flex items-center gap-3"><UserRound className="size-5"/><h2 className="text-xl font-semibold">내 정보</h2></div>
        <dl className="divide-y divide-line rounded-lg border border-line bg-white px-5">
          <div className="py-5"><dt className="text-xs text-muted">이름</dt><dd className="mt-2 font-medium">{user?.name||'-'}</dd></div>
          <div className="py-5"><dt className="text-xs text-muted">이메일</dt><dd className="mt-2 font-medium">{user?.email||'-'}</dd></div>
          <div className="py-5"><dt className="text-xs text-muted">권한</dt><dd className="mt-2 flex items-center gap-2 font-medium"><ShieldCheck className="size-4"/>{user?.role||'-'}</dd></div>
        </dl>
        <p className="mt-4 text-xs leading-5 text-muted">회원정보 수정 기능은 백엔드 API가 제공되면 활성화됩니다.</p>
      </section>
      <section>
        <div className="mb-5 flex items-center gap-3"><Bell className="size-5"/><h2 className="text-xl font-semibold">알림</h2></div>
        <State loading={notes.loading} error={notes.error} empty={!notes.data?.length}>
          <div className="divide-y divide-line rounded-lg border border-line bg-white px-5">
            {notes.data?.map((note)=><button className={`block w-full py-5 text-left ${note.isRead?'text-muted':''}`} key={note.id} onClick={()=>!note.isRead&&markRead(note.id)}>
              <span className="flex items-center justify-between gap-3"><strong className="text-sm font-medium">{note.title}</strong>{!note.isRead&&<span className="size-2 rounded-full bg-ink" aria-label="읽지 않음"/>}</span>
              <span className="mt-2 block text-sm leading-6">{note.content}</span>
              <span className="mt-2 block text-xs text-muted">{new Date(note.createdAt).toLocaleString('ko-KR')}</span>
            </button>)}
          </div>
        </State>
      </section>
    </div>
  </div>;
}
