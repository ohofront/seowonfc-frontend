import { useState } from 'react';
import { getMatches, getStandings } from '../api/matches';
import { useAsync } from '../hooks/useAsync';
import type { Match, Standing } from '../types';
import { PageHeader, State } from '../components/UI';
import { formatKoreanDateTime } from '../utils/dateTime';
import { useTranslation } from '../i18n';

export function MatchesPage() {
  const [seasonInput, setSeasonInput] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [filters, setFilters] = useState({ season: '', status: '' });
  const { data, loading, error } = useAsync(
    () => getMatches({ season: filters.season || undefined, status: filters.status || undefined, size: 50 }),
    [filters]
  );
  const { t } = useTranslation();

  const search = (event: React.FormEvent) => {
    event.preventDefault();
    setFilters({ season: seasonInput.trim(), status: statusInput });
  };

  return (
    <div className="container-page page-space">
      <PageHeader title={t.matches.title} description={t.matches.subtitle} />
      <form className="mb-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={search}>
        <input
          className="field"
          placeholder={t.matches.seasonPlaceholder}
          value={seasonInput}
          onChange={(e) => setSeasonInput(e.target.value)}
        />
        <select className="field" value={statusInput} onChange={(e) => setStatusInput(e.target.value)}>
          <option value="">{t.matches.allStatus}</option>
          <option value="SCHEDULED">{t.matches.scheduled}</option>
          <option value="FINISHED">{t.matches.finished}</option>
          <option value="CANCELED">{t.matches.canceled}</option>
        </select>
        <button className="btn-primary" type="submit">
          {t.common.search}
        </button>
      </form>
      <State loading={loading} error={error} empty={!data?.content.length} emptyMessage={t.matches.emptyMatches}>
        <div className="space-y-4">
          {data?.content.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </State>
    </div>
  );
}

function MatchCard({ match: m }: { match: Match }) {
  const { t } = useTranslation();
  const defaultClubName = '서원 FC';
  const home = m.homeTeam ?? (m.isHome !== false ? defaultClubName : m.opponent) ?? '-';
  const away = m.awayTeam ?? (m.isHome !== false ? m.opponent : defaultClubName) ?? '-';

  const statusLabel: Record<string, string> = {
    SCHEDULED: t.matches.scheduled,
    LIVE: t.matches.live,
    FINISHED: t.matches.finished,
    CANCELED: t.matches.canceled,
  };

  return (
    <article className="card grid items-center gap-4 p-5 sm:grid-cols-[1fr_2fr_1fr]">
      <div>
        <p className="text-xs font-medium">
          {[m.season, m.competition, m.round && `${m.round}R`].filter(Boolean).join(' · ')}
        </p>
        <p className="mt-2 text-xs text-muted">{formatKoreanDateTime(m.matchDate)} KST</p>
        <p className="mt-1 text-sm">{m.stadium || m.venue || t.matches.venueTbd}</p>
      </div>
      <div className="flex items-center justify-center gap-4 text-center">
        <strong className="w-28">{home}</strong>
        <span className="text-xl font-bold">
          {m.status === 'FINISHED' || m.status === 'LIVE' ? `${m.homeScore ?? 0} : ${m.awayScore ?? 0}` : 'VS'}
        </span>
        <strong className="w-28">{away}</strong>
      </div>
      <span className="justify-self-start rounded bg-surface px-3 py-1 text-xs sm:justify-self-end">
        {statusLabel[m.status] || m.status}
      </span>
    </article>
  );
}

export function StandingsPage() {
  const [season, setSeason] = useState('');
  const { data, loading, error } = useAsync(() => getStandings(season || undefined), [season]);
  const rows = data?.content;
  const { t } = useTranslation();

  const tableHeaders = [
    t.matches.rank,
    t.matches.team,
    t.matches.played,
    t.matches.win,
    t.matches.draw,
    t.matches.lose,
    t.matches.gf,
    t.matches.ga,
    t.matches.gd,
    t.matches.pts,
  ];

  return (
    <div className="container-page page-space">
      <PageHeader title={t.matches.standingsTitle} description={t.matches.standingsSubtitle} />
      <input
        className="field mb-8 max-w-xs"
        placeholder={t.matches.seasonPlaceholder}
        value={season}
        onChange={(e) => setSeason(e.target.value)}
      />
      <State loading={loading} error={error} empty={!rows?.length}>
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-surface">
              <tr>
                {tableHeaders.map((header) => (
                  <th className="p-4" key={header}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows?.map((r: Standing) => (
                <tr key={r.rank}>
                  <td className="p-4 font-bold">{r.rank}</td>
                  <td className="p-4 font-medium">{r.team ?? r.teamName ?? '-'}</td>
                  <td className="p-4">{r.played}</td>
                  <td className="p-4">{r.win ?? r.won ?? 0}</td>
                  <td className="p-4">{r.draw ?? r.drawn ?? 0}</td>
                  <td className="p-4">{r.lose ?? r.lost ?? 0}</td>
                  <td className="p-4">{r.goalsFor ?? '-'}</td>
                  <td className="p-4">{r.goalsAgainst ?? '-'}</td>
                  <td className="p-4">{r.goalDiff ?? r.goalDifference ?? '-'}</td>
                  <td className="p-4 font-bold">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </State>
    </div>
  );
}
