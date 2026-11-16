import { CircleCheck, CircleX, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export type FeedbackDetail = { type: 'success' | 'error'; title: string; message: string };

/**
 * 귀여운 축구공 SVG 컴포넌트
 * 디테일한 오각형 패치와 클래식 축구공 라인, 귀여운 하이라이트 광택 포함
 */
export function SoccerBallIcon({
  className = 'size-8',
  spin = true,
}: {
  className?: string;
  spin?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 36 36"
      className={`${className} ${spin ? 'animate-spin' : ''}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={spin ? { animationDuration: '2.5s' } : undefined}
    >
      {/* 바깥 흰색 공 및 외곽선 */}
      <circle cx="18" cy="18" r="16" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.2" />

      {/* 중앙 오각형 (검정) */}
      <polygon points="18,12 23.7,16.1 21.5,22.8 14.5,22.8 12.3,16.1" fill="#0F172A" />

      {/* 중앙 오각형 꼭짓점에서 외곽으로 뻗는 솔기 라인 */}
      <line x1="18" y1="12" x2="18" y2="2" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
      <line x1="23.7" y1="16.1" x2="33.2" y2="13" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
      <line x1="21.5" y1="22.8" x2="27.4" y2="31" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
      <line x1="14.5" y1="22.8" x2="8.6" y2="31" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
      <line x1="12.3" y1="16.1" x2="2.8" y2="13" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />

      {/* 외곽 모서리 패치들 (검정) */}
      {/* 상단 패치 */}
      <path d="M14.5 2.6C15.6 2.2 16.8 2 18 2C19.2 2 20.4 2.2 21.5 2.6L18 6.5Z" fill="#0F172A" />
      {/* 우상단 패치 */}
      <path d="M32.5 10.5C33.5 12.3 34 14.3 34 16.5C34 17.5 33.8 18.5 33.5 19.5L29 16.5Z" fill="#0F172A" />
      {/* 우하단 패치 */}
      <path d="M29.5 29.5C28.2 30.8 26.6 31.8 24.8 32.5L24 27.5Z" fill="#0F172A" />
      {/* 좌하단 패치 */}
      <path d="M6.5 29.5C7.8 30.8 9.4 31.8 11.2 32.5L12 27.5Z" fill="#0F172A" />
      {/* 좌상단 패치 */}
      <path d="M3.5 10.5C2.5 12.3 2 14.3 2 16.5C2 17.5 2.2 18.5 2.5 19.5L7 16.5Z" fill="#0F172A" />

      {/* 귀여운 반짝임 광택 하이라이트 */}
      <ellipse cx="13" cy="8.5" rx="3.5" ry="1.8" transform="rotate(-30 13 8.5)" fill="#FFFFFF" opacity="0.75" />
    </svg>
  );
}

/**
 * 통통 튀는 귀여운 축구공 로딩 인디케이터
 */
export function SoccerSpinner({
  label,
  size = 'md',
  inline = false,
}: {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  inline?: boolean;
}) {
  const sizeMap = {
    sm: 'size-6',
    md: 'size-10',
    lg: 'size-14',
  };

  const shadowSizeMap = {
    sm: 'w-4 h-1',
    md: 'w-7 h-1.5',
    lg: 'w-10 h-2',
  };

  if (inline) {
    return (
      <span className="inline-flex items-center gap-2" role="status" aria-live="polite">
        <SoccerBallIcon className={sizeMap[size]} />
        {label && <span className="text-sm font-medium">{label}</span>}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-2" role="status" aria-live="polite">
      <div className="relative flex flex-col items-center justify-center">
        {/* 통통 튀면서 회전하는 축구공 */}
        <div className="animate-bounce">
          <SoccerBallIcon className={sizeMap[size]} />
        </div>
        {/* 공 바운스에 맞추어 크기가 변하는 귀여운 바닥 그림자 */}
        <div
          className={`${shadowSizeMap[size]} rounded-full bg-ink/20 blur-[1px] animate-pulse transition-all`}
        />
      </div>
      {label && <p className="text-sm font-medium text-ink tracking-tight animate-pulse">{label}</p>}
    </div>
  );
}

// 기존 코드와의 호환성을 위한 Spinner 별칭 export
export const Spinner = SoccerSpinner;

export default function GlobalFeedback() {
  const [requests, setRequests] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackDetail | null>(null);

  useEffect(() => {
    const start = () => setRequests((count) => count + 1);
    const end = () => setRequests((count) => Math.max(0, count - 1));
    const show = (event: Event) => setFeedback((event as CustomEvent<FeedbackDetail>).detail);
    addEventListener('api:request-start', start);
    addEventListener('api:request-end', end);
    addEventListener('api:feedback', show);
    return () => {
      removeEventListener('api:request-start', start);
      removeEventListener('api:request-end', end);
      removeEventListener('api:feedback', show);
    };
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFeedback(null);
    };
    addEventListener('keydown', close);
    return () => removeEventListener('keydown', close);
  }, [feedback]);

  return (
    <>
      {requests > 0 && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/25 backdrop-blur-[2px]"
          aria-label="요청 처리 중"
        >
          <div className="rounded-2xl border border-line bg-white/95 px-8 py-6 shadow-2xl">
            <SoccerSpinner label="처리 중..." size="lg" />
          </div>
        </div>
      )}
      {feedback && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onMouseDown={() => setFeedback(null)}
        >
          <section
            className="relative w-full max-w-sm rounded-lg border border-line bg-white p-6"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="absolute right-4 top-4 p-1 text-muted hover:text-ink"
              aria-label="닫기"
              onClick={() => setFeedback(null)}
            >
              <X className="size-5" />
            </button>
            {feedback.type === 'success' ? (
              <CircleCheck className="size-9 text-ink" />
            ) : (
              <CircleX className="size-9 text-danger" />
            )}
            <h2 id="feedback-title" className="mt-5 text-xl font-semibold">
              {feedback.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">{feedback.message}</p>
            <button className="btn-primary mt-6 w-full" autoFocus onClick={() => setFeedback(null)}>
              확인
            </button>
          </section>
        </div>
      )}
    </>
  );
}
