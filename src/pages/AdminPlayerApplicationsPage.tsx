import { useState } from 'react';
import { Link } from 'react-router-dom';
import { approvePlayerApplication, getPendingPlayerApplications, rejectPlayerApplication } from '../api/playerApplications';
import { ImageFallback, PageHeader, State } from '../components/UI';
import { useAsync } from '../hooks/useAsync';
import type { PlayerApplication } from '../types';
import { useTranslation } from '../i18n';

export default function AdminPlayerApplicationsPage() {
  const applications = useAsync(getPendingPlayerApplications, []);
  const [rejecting, setRejecting] = useState<PlayerApplication | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<number | null>(null);
  const { t } = useTranslation();

  const approve = async (item: PlayerApplication) => {
    setProcessing(item.id);
    setError('');
    try {
      await approvePlayerApplication(item.id);
      alert(t.admin.approveSuccess);
      await applications.reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t.admin.approveFailed);
    } finally {
      setProcessing(null);
    }
  };

  const reject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!rejecting || !reason.trim()) return;
    setProcessing(rejecting.id);
    setError('');
    try {
      await rejectPlayerApplication(rejecting.id, reason.trim());
      setRejecting(null);
      setReason('');
      await applications.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.admin.rejectFailed);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="container-page page-space">
      <PageHeader
        title={t.admin.playerAppsTitle}
        description={t.admin.playerAppsDesc}
        action={
          <Link className="btn-secondary" to="/admin">
            {t.admin.contentManagement}
          </Link>
        }
      />
      {error && <p className="mb-5 rounded-lg border border-danger/30 p-4 text-sm text-danger">{error}</p>}
      <State
        loading={applications.loading}
        error={applications.error}
        empty={!applications.data?.length}
        emptyMessage={t.admin.emptyPlayerApps}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {applications.data?.map((item) => (
            <article className="card flex flex-col p-5" key={item.id}>
              <div className="flex gap-4">
                <ImageFallback
                  src={item.profileImageUrl}
                  alt={item.name}
                  className="h-32 w-24 shrink-0 rounded object-cover"
                />
                <div>
                  <p className="text-xs text-muted">
                    {t.admin.applicant} {item.applicantName ?? '-'}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">{item.name}</h2>
                  <p className="mt-2 text-sm text-muted">
                    {item.position} · {t.players.backNumber} {item.backNumber}
                  </p>
                  <p className="mt-1 text-sm text-muted">{item.nationality}</p>
                </div>
              </div>
              <div className="mt-5 flex gap-2 border-t border-line pt-4">
                <button
                  className="btn-primary flex-1"
                  disabled={processing === item.id}
                  onClick={() => void approve(item)}
                >
                  {t.admin.approve}
                </button>
                <button
                  className="btn-secondary flex-1"
                  disabled={processing === item.id}
                  onClick={() => {
                    setRejecting(item);
                    setReason('');
                    setError('');
                  }}
                >
                  {t.admin.reject}
                </button>
              </div>
            </article>
          ))}
        </div>
      </State>
      {rejecting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-title"
        >
          <form className="w-full max-w-md rounded-lg bg-white p-6" onSubmit={reject}>
            <h2 id="reject-title" className="text-xl font-semibold">
              {rejecting.name} {t.admin.rejectTitle}
            </h2>
            <label className="mt-5 block">
              <span className="label">{t.admin.rejectReasonLabel}</span>
              <textarea
                className="field min-h-32 resize-y"
                required
                autoFocus
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setRejecting(null)}>
                {t.common.cancel}
              </button>
              <button className="btn-primary" disabled={processing === rejecting.id}>
                {t.admin.rejectConfirm}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
