import { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useHasAppliedForPlayer } from '../hooks/usePlayerApplicationStatus';
import { useTranslation } from '../i18n';

export default function PlayerApplicationPrompt() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [hidden, setHidden] = useState(false);
  const hasApplied = useHasAppliedForPlayer(isAuthenticated && user?.role === 'USER' && !isAdmin);
  const { t } = useTranslation();

  if (hidden || hasApplied !== false) return null;

  return (
    <aside
      className="mb-8 flex flex-col gap-5 rounded-lg border-2 border-ink bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
      aria-label={t.home.playerPromptTitle}
    >
      <div>
        <p className="font-semibold">{t.home.playerPromptTitle}</p>
        <p className="mt-1 text-sm text-muted">{t.home.playerPromptDesc}</p>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Link className="btn-primary" to="/players/apply">
          {t.home.goToApply} <ArrowRight className="ml-2 size-4" />
        </Link>
        <button
          type="button"
          className="rounded-md p-2 text-muted hover:bg-surface hover:text-ink"
          aria-label={t.common.close}
          onClick={() => setHidden(true)}
        >
          <X className="size-5" />
        </button>
      </div>
    </aside>
  );
}
