import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { isAuthenticated, getUser, logout } from '../utils/auth';
import styles from '../styles/Layout.module.css';

export default function Layout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    setUser(getUser());
  }, [router]);

  const handleLogout = () => {
    logout();
  };

  if (!mounted) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Yükleniyor...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null;
  }

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/cariler', label: 'Cariler', icon: '👥' },
    { path: '/faturalar', label: 'Faturalar', icon: '📄' },
    { path: '/finansal', label: 'Finansal İşlemler', icon: '💰' },
    { path: '/raporlama', label: 'Raporlama', icon: '📈' },
  ];

  return (
    <div className={styles.container}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          <h2>Finalizer ERP</h2>
          <button
            className={styles.toggleBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.navItem} ${
                router.pathname === item.path ? styles.active : ''
              }`}
            >
              <span className={styles.icon}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          {sidebarOpen && (
            <div className={styles.userInfo}>
              <p className={styles.userName}>{user?.name || user?.username}</p>
              <p className={styles.userRole}>{user?.role || 'Kullanıcı'}</p>
            </div>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            {sidebarOpen ? 'Çıkış Yap' : '🚪'}
          </button>
        </div>
      </aside>
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}

