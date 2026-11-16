import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signup } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../i18n';

type LoginForm = { email: string; password: string; remember: boolean };
type SignupForm = Omit<LoginForm, 'remember'> & { name: string; passwordConfirm: string };

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ defaultValues: { remember: false } });
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const { t } = useTranslation();

  const submit = async (v: LoginForm) => {
    setError('');
    try {
      await signIn(v.email, v.password, v.remember);
      const redirect = new URLSearchParams(loc.search).get('redirect');
      nav(redirect || '/');
    } catch (e) {
      setError(e instanceof Error ? e.message : t.auth.loginFailed);
    }
  };

  return (
    <AuthShell title={t.auth.loginTitle}>
      <form className="space-y-5" onSubmit={handleSubmit(submit)}>
        <Field label={t.auth.email} error={errors.email?.message}>
          <input
            className="field"
            type="email"
            autoComplete="email"
            {...register('email', { required: t.auth.loginFailed })}
          />
        </Field>
        <Field label={t.auth.password} error={errors.password?.message}>
          <input
            className="field"
            type="password"
            autoComplete="current-password"
            {...register('password', { required: t.auth.loginFailed })}
          />
        </Field>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            className="h-4 w-4 rounded border-line accent-primary"
            type="checkbox"
            {...register('remember')}
          />
          <span>{t.auth.autoLogin}</span>
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? t.auth.loggingIn : t.auth.loginTitle}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        {t.auth.notMemberYet}{' '}
        <Link className="font-medium text-ink underline" to="/signup">
          {t.auth.signupTitle}
        </Link>
      </p>
    </AuthShell>
  );
}

export function SignupPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>();
  const [message, setMessage] = useState('');
  const { signIn } = useAuth();
  const nav = useNavigate();
  const { t } = useTranslation();

  const submit = async (v: SignupForm) => {
    setMessage('');
    try {
      await signup({ email: v.email, password: v.password, name: v.name });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : t.auth.signupFailed);
      return;
    }
    try {
      await signIn(v.email, v.password);
      sessionStorage.setItem('justSignedUp', 'true');
      nav('/');
    } catch {
      setMessage('회원가입은 완료되었지만 자동 로그인에 실패했습니다. 로그인 페이지에서 다시 로그인해주세요.');
    }
  };

  return (
    <AuthShell title={t.auth.signupTitle}>
      <form className="space-y-5" onSubmit={handleSubmit(submit)}>
        <Field label={t.auth.name} error={errors.name?.message}>
          <input className="field" autoComplete="name" {...register('name', { required: true })} />
        </Field>
        <Field label={t.auth.email} error={errors.email?.message}>
          <input
            type="email"
            className="field"
            autoComplete="email"
            {...register('email', { required: true })}
          />
        </Field>
        <Field label={t.auth.password} error={errors.password?.message}>
          <input
            type="password"
            className="field"
            autoComplete="new-password"
            {...register('password', { required: true, minLength: 8 })}
          />
        </Field>
        <Field label={t.auth.passwordConfirm} error={errors.passwordConfirm?.message}>
          <input
            type="password"
            className="field"
            autoComplete="new-password"
            {...register('passwordConfirm', {
              validate: (v) => v === watch('password') || '비밀번호가 일치하지 않습니다.',
            })}
          />
        </Field>
        {message && <p className="text-sm text-danger">{message}</p>}
        <button className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? t.auth.signingUp : t.auth.signupTitle}
        </button>
      </form>
    </AuthShell>
  );
}

const AuthShell = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="container-page page-space">
    <div className="mx-auto max-w-md">
      <h1 className="mb-8 text-3xl font-bold">{title}</h1>
      {children}
    </div>
  </div>
);

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="label">{label}</span>
    {children}
    {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
  </label>
);
