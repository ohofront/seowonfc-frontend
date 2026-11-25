import { Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation, type Language } from '../i18n';

function LanguageSelector({ className = '' }: { className?: string }) {
  const { language, setLanguage, languages } = useTranslation();

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      <Globe className="size-4 text-muted shrink-0" aria-hidden="true" />
      <select
        aria-label="Select Language"
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="rounded border border-line bg-transparent py-1.5 pl-2 pr-6 text-xs font-medium text-ink focus:border-ink focus:outline-none cursor-pointer"
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    setOpen(false);
    window.dispatchEvent(
      new CustomEvent('api:feedback', {
        detail: {
          type: 'success',
          title: t.auth.logoutSuccessTitle,
          message: t.auth.logoutSuccessMessage,
        },
      })
    );
    navigate('/');
  };

  const navLinks = [
    { to: '/news', label: t.nav.news },
    { to: '/players', label: t.nav.players },
    { to: '/matches', label: t.nav.matches },
    { to: '/boards/free', label: t.nav.community },
    { to: '/sponsors', label: t.nav.sponsors },
    { to: '/events', label: t.nav.events },
  ];

  const nav = (
    <>
      {navLinks.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `py-3 text-sm transition-colors ${
              isActive ? 'font-semibold underline underline-offset-8 text-ink' : 'text-muted hover:text-ink'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
      {isAdmin && (
        <NavLink
          to="/admin"
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `py-3 text-sm font-medium transition-colors ${
              isActive ? 'font-semibold underline underline-offset-8 text-ink' : 'text-muted hover:text-ink'
            }`
          }
        >
          {t.nav.admin}
        </NavLink>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-sm">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="text-xl font-black tracking-tight">
          SEOWON FC
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">{nav}</nav>
        <div className="hidden items-center gap-4 lg:flex">
          <LanguageSelector />
          <div className="h-4 w-px bg-line" aria-hidden="true" />
          {user ? (
            <>
              <Link to="/mypage" className="text-sm font-medium hover:underline">
                {user.name}
              </Link>
              <button className="btn-secondary min-h-9 px-3" onClick={handleLogout}>
                {t.nav.logout}
              </button>
            </>
          ) : (
            <Link className="btn-primary min-h-9 px-4" to="/login">
              {t.nav.login}
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSelector />
          <button
            className="p-2 text-ink hover:bg-surface rounded-md"
            aria-label="메뉴"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-line bg-white lg:hidden">
          <nav className="container-page flex flex-col py-3">
            {nav}
            <div className="mt-3 border-t border-line pt-3 flex items-center justify-between">
              {user ? (
                <>
                  <Link to="/mypage" onClick={() => setOpen(false)} className="text-sm font-medium">
                    {t.nav.mypage} ({user.name})
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary min-h-9 px-3 text-sm"
                  >
                    {t.nav.logout}
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="btn-primary min-h-9 px-4 text-sm font-medium"
                >
                  {t.nav.login}
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-page py-10">
        <p className="font-bold">SEOWON FC</p>
        <p className="mt-2 text-sm text-muted">{t.footer.description}</p>
        <p className="mt-6 text-xs text-muted">
          © {new Date().getFullYear()} Seowon FC. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
