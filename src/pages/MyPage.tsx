import { Bell, ShieldCheck, UserRound } from 'lucide-react';
import { me } from '../api/auth';
import { getNotifications, readNotification } from '../api/notifications';
import { PageHeader, State } from '../components/UI';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../hooks/useAuth';
import PlayerApplicationPrompt from '../components/PlayerApplicationPrompt';
import { useTranslation } from '../i18n';

export default function MyPage() {
  const { user } = useAuth();
  const profile = useAsync(me, []);
  const notes = useAsync(getNotifications, []);
  const member = profile.data ?? user;
  const { t, formatDate } = useTranslation();

  const markRead = async (id: number) => {
    await readNotification(id);
    await notes.reload();
  };

  const infoLabels: Record<string, string> = {
    id: 'ID',
    name: t.auth.name,
    email: t.auth.email,
    phone: 'Phone',
    birth: 'Birth',
    gender: 'Gender',
    createdAt: 'Joined',
  };

  return (
    <div className="container-page page-space">
      <PlayerApplicationPrompt />
      <PageHeader title={t.mypage.title} description={t.mypage.myInfo} />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <section>
          <div className="mb-5 flex items-center gap-3">
            <UserRound className="size-5" />
            <h2 className="text-xl font-semibold">{t.mypage.myInfo}</h2>
          </div>
          <State loading={profile.loading} error={profile.error} empty={!member}>
            <dl className="divide-y divide-line rounded-lg border border-line bg-white px-5">
              {member &&
                [
                  [infoLabels.id, member.id],
                  [infoLabels.name, member.name],
                  [infoLabels.email, member.email],
                  [infoLabels.phone, member.phone],
                  [infoLabels.birth, member.birth],
                  [infoLabels.gender, member.gender],
                  [infoLabels.createdAt, member.createdAt ? formatDate(member.createdAt) : undefined],
                ].map(([label, value]) => (
                  <div className="py-5" key={String(label)}>
                    <dt className="text-xs text-muted">{label}</dt>
                    <dd className="mt-2 font-medium">{value || '-'}</dd>
                  </div>
                ))}
              <div className="py-5">
                <dt className="text-xs text-muted">Role</dt>
                <dd className="mt-2 flex items-center gap-2 font-medium">
                  <ShieldCheck className="size-4" />
                  {member?.role || '-'}
                </dd>
              </div>
            </dl>
          </State>
        </section>
        <section>
          <div className="mb-5 flex items-center gap-3">
            <Bell className="size-5" />
            <h2 className="text-xl font-semibold">{t.mypage.notifications}</h2>
          </div>
          <State loading={notes.loading} error={notes.error} empty={!notes.data?.length} emptyMessage={t.mypage.noNotifications}>
            <div className="divide-y divide-line rounded-lg border border-line bg-white px-5">
              {notes.data?.map((note) => (
                <button
                  className={`block w-full py-5 text-left ${note.isRead ? 'text-muted' : ''}`}
                  key={note.id}
                  onClick={() => !note.isRead && markRead(note.id)}
                >
                  <span className="flex items-center justify-between gap-3">
                    <strong className="text-sm font-medium">{note.title}</strong>
                    {!note.isRead && <span className="size-2 rounded-full bg-ink" aria-label="Unread" />}
                  </span>
                  <span className="mt-2 block text-sm leading-6">{note.content}</span>
                  <span className="mt-2 block text-xs text-muted">{formatDate(note.createdAt)}</span>
                </button>
              ))}
            </div>
          </State>
        </section>
      </div>
    </div>
  );
}
