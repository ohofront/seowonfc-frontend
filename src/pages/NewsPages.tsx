import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNews, getNewsDetail } from '../api/news';
import { useAsync } from '../hooks/useAsync';
import { ImageFallback, PageHeader, Pagination, State } from '../components/UI';
import { useTranslation } from '../i18n';

export function NewsListPage() {
  const [page, setPage] = useState(0);
  const { data, loading, error } = useAsync(() => getNews(page), [page]);
  const { t, formatDate } = useTranslation();

  const getCategoryLabel = (val: string) => {
    const map: Record<string, string> = {
      CLUB: t.news.categoryClub,
      MATCH: t.news.categoryMatch,
      MEDIA: t.news.categoryMedia,
      NOTICE: t.news.categoryNotice,
    };
    return map[val] ?? val;
  };

  return (
    <div className="container-page page-space">
      <PageHeader title={t.news.title} description={t.news.subtitle} />
      <State loading={loading} error={error} empty={!data?.content.length}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data?.content.map((n) => (
            <Link to={`/news/${n.id}`} className="card overflow-hidden" key={n.id}>
              <ImageFallback
                src={n.thumbnailUrl || n.imageUrl}
                alt=""
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="p-5">
                {n.category && (
                  <p className="mb-2 text-xs font-medium text-ink">{getCategoryLabel(n.category)}</p>
                )}
                <h2 className="line-clamp-2 text-lg font-medium">{n.title}</h2>
                <p className="mt-4 text-xs text-muted">
                  {formatDate(n.publishedAt || n.createdAt)} · {t.common.views} {n.viewCount ?? 0}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <Pagination page={page} total={data?.totalPages || 0} onChange={setPage} />
      </State>
    </div>
  );
}

export function NewsDetailPage() {
  const { id = '' } = useParams();
  const { data, loading, error } = useAsync(() => getNewsDetail(id), [id]);
  const { t, formatDate } = useTranslation();

  const getCategoryLabel = (val: string) => {
    const map: Record<string, string> = {
      CLUB: t.news.categoryClub,
      MATCH: t.news.categoryMatch,
      MEDIA: t.news.categoryMedia,
      NOTICE: t.news.categoryNotice,
    };
    return map[val] ?? val;
  };

  return (
    <article className="container-page page-space">
      <State loading={loading} error={error} empty={!data}>
        {data && (
          <div className="mx-auto max-w-3xl">
            <Link to="/news" className="text-sm text-muted hover:text-ink">
              {t.common.backToList}
            </Link>
            {data.category && (
              <p className="mt-8 text-sm font-semibold">{getCategoryLabel(data.category)}</p>
            )}
            <h1 className="mt-3 text-3xl font-bold md:text-5xl">{data.title}</h1>
            <p className="mt-5 border-b border-line pb-6 text-sm text-muted">
              {formatDate(data.publishedAt || data.createdAt)} · {t.common.views} {data.viewCount ?? 0}
            </p>
            {(data.imageUrl || data.thumbnailUrl) && (
              <img className="my-8 w-full rounded-lg" src={data.imageUrl || data.thumbnailUrl} alt="" />
            )}
            <div className="whitespace-pre-wrap py-4 leading-8">{data.content}</div>
          </div>
        )}
      </State>
    </article>
  );
}
