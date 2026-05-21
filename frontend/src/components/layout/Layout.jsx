// Layout.jsx — Main authenticated layout
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const PAGE_TITLES = {
  '/dashboard': 'dashboard',
  '/diagnosis': 'diagnosisTitle',
  '/history': 'historyTitle',
  '/profile': 'profileTitle',
  '/admin': 'adminTitle',
};

export default function Layout() {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  let titleKey = PAGE_TITLES[location.pathname] || 'appName';
  if (isAdmin && location.pathname === '/history') {
    titleKey = 'adminUserHistoryTitle';
  }
  const title = t[titleKey] || t.appName;

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar title={title} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
