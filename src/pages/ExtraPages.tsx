import { Link, useParams } from 'react-router-dom';
import { getEvent, getEvents } from '../api/events';
import { getSponsors } from '../api/sponsors';
import { ImageFallback, PageHeader, State } from '../components/UI';
import { useAsync } from '../hooks/useAsync';
import { useTranslation } from '../i18n';

export function SponsorsPage() {
  const { data, loading, error } = useAsync(getSponsors, []);
  const { t } = useTranslation();
  const hasSponsors = Boolean(data?.content.length);

  return (
    <div className="container-page page-space">
      <PageHeader title={t.extra.sponsorsTitle} description={t.extra.sponsorsDesc} />
      <State loading={loading} error={error ? 'Failed to load sponsors' : ''}>
        {hasSponsors &&
          (['OFFICIAL', 'PARTNER'] as const).map((tier) => (
            <section className="mb-12" key={tier}>
              <h2 className="mb-5 text-xl font-semibold">
                {tier === 'OFFICIAL' ? t.extra.officialSponsors : t.extra.partners}
              </h2>
              <div
                className={`grid gap-4 ${
                  tier === 'OFFICIAL' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 md:grid-cols-4'
                }`}
              >
                {data?.content
                  .filter((s) => s.tier === tier)
                  .map((s) => {
                    const url = s.linkUrl || s.websiteUrl;
                    return (
                      <a
                        href={url || '#'}
                        target={url ? '_blank' : undefined}
                        rel="noreferrer"
                        className="card flex min-h-40 flex-col items-center justify-center gap-4 p-6"
                        key={s.id}
                      >
                        <ImageFallback
                          src={s.logoUrl}
                          alt={s.name}
                          className="max-h-20 max-w-full object-contain"
                        />
                        <strong className="text-center text-sm">{s.name}</strong>
                      </a>
                    );
                  })}
              </div>
            </section>
          ))}
      </State>
      <div className={`${hasSponsors ? 'mt-12 border-t pt-8' : 'py-20'} border-line text-center`}>
        <p className="text-sm text-muted">{t.extra.sponsorWithUs}</p>
        <Link className="btn-primary mt-4" to="/sponsors/apply">
          {t.extra.applySponsor}
        </Link>
      </div>
    </div>
  );
}

export function EventsPage() {
  const { data, loading, error } = useAsync(() => getEvents(), []);
  const { t } = useTranslation();

  return (
    <div className="container-page page-space">
      <PageHeader title={t.extra.eventsTitle} />
      <State loading={loading} error={error} empty={!data?.content.length}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data?.content.map((e) => (
            <Link to={`/events/${e.id}`} className="card overflow-hidden" key={e.id}>
              <ImageFallback
                src={e.imageUrl || e.thumbnailUrl}
                alt=""
                className="aspect-video w-full object-cover"
              />
              <div className="p-5">
                <span className="text-xs text-muted">{eventDate(e, t.extra.dateTbd)}</span>
                <h2 className="mt-2 text-lg font-medium">{e.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      </State>
    </div>
  );
}

export function EventDetailPage() {
  const { id = '' } = useParams();
  const { data, loading, error } = useAsync(() => getEvent(id), [id]);
  const { t } = useTranslation();

  return (
    <div className="container-page page-space">
      <State loading={loading} error={error} empty={!data}>
        {data && (
          <article className="mx-auto max-w-3xl">
            <Link to="/events" className="text-sm text-muted">
              {t.extra.eventList}
            </Link>
            <h1 className="mt-6 text-3xl font-bold md:text-5xl">{data.title}</h1>
            <p className="mt-4 text-sm text-muted">{eventDate(data, t.extra.dateTbd)}</p>
            {(data.imageUrl || data.thumbnailUrl) && (
              <img className="my-8 w-full rounded-lg" src={data.imageUrl || data.thumbnailUrl} alt="" />
            )}
            <div className="whitespace-pre-wrap py-6 leading-8">{data.content}</div>
            {data.winners && data.winners.length > 0 && (
              <section className="mt-12 border-t border-line pt-8">
                <h2 className="text-xl font-semibold">{t.extra.winners}</h2>
                <ul className="mt-4 space-y-2">
                  {data.winners.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </section>
            )}
          </article>
        )}
      </State>
    </div>
  );
}

const eventDate = (
  event: { eventDate?: string; startDate?: string; endDate?: string },
  defaultLabel = 'Date TBD'
) =>
  event.eventDate ||
  (event.startDate && event.endDate
    ? `${event.startDate} ~ ${event.endDate}`
    : event.startDate || event.endDate || defaultLabel);
