import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, FileText, Download, Receipt, Newspaper,
  Users, Bell, AlertCircle, HeartHandshake, User, Coins, Upload,
  UserPlus, CreditCard, AlertTriangle, MessageSquare, Settings,
  Landmark, PenTool, CheckCircle, Wallet, Megaphone, FileCheck,
  ClipboardList, BadgeCheck, Globe, FileEdit, Inbox, Image, Mail,
  SlidersHorizontal, BarChart3, RefreshCw, Scale, Activity, Database,
  Server, Search, Wrench, ScrollText, Shield, Key, Lock, LogIn,
  Home, X, ChevronDown, LogOut, UserCog, Heart, Menu,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth, roleLabels, roleDashboardPath } from '@/auth/AuthContext';
import { navConfig, memberBottomNav, type NavItem } from '@/config/nav';
import { classNames, initials } from '@/lib/format';
import type { UserRole } from '@/types';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, Calendar, FileText, Download, Receipt, Newspaper,
  Users, Bell, AlertCircle, HeartHandshake, User, Coins, Upload,
  UserPlus, CreditCard, AlertTriangle, MessageSquare, Settings,
  Landmark, PenTool, CheckCircle, Wallet, Megaphone, FileCheck,
  ClipboardList, BadgeCheck, Globe, FileEdit, Inbox, Image, Mail,
  SlidersHorizontal, BarChart3, RefreshCw, Scale, Activity, Database,
  Server, Search, Wrench, ScrollText, Shield, Key, Lock, LogIn,
  Home, Heart, UserCog,
};

function NavIcon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  const Icon = iconMap[name] || LayoutDashboard;
  return <Icon size={size} className={className} />;
}

export function AppLayout({ children }: { children?: ReactNode }) {
  const { user, logout, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  if (!user) return null;

  const role = user.role;
  const navItems = navConfig[role] || [];
  const isMember = role === 'member';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchRole = (newRole: UserRole) => {
    switchRole(newRole);
    setRoleMenuOpen(false);
    navigate(roleDashboardPath[newRole]);
  };

  const isActive = (path: string) => {
    if (path === `/${role}`) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const allRoles: UserRole[] = ['member', 'admin', 'treasurer', 'secretary', 'chairperson', 'office', 'super-admin'];

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-neutral-200 fixed inset-y-0 left-0 z-30">
        <div className="px-5 py-5 border-b border-neutral-100">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-700 flex items-center justify-center text-white">
              <Heart size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900 leading-tight">KHWWC</p>
              <p className="text-2xs text-neutral-400 leading-tight">Welfare Management</p>
            </div>
          </Link>
        </div>

        <div className="px-3 py-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-neutral-50">
            <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-semibold flex items-center justify-center text-sm flex-shrink-0">
              {initials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-800 truncate">{user.name}</p>
              <p className="text-xs text-neutral-400 truncate">{roleLabels[role]}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {navItems.map((item: NavItem) => (
            <Link
              key={item.path}
              to={item.path}
              className={classNames(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive(item.path)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
              )}
            >
              <NavIcon name={item.icon} size={18} className={classNames(isActive(item.path) ? 'text-primary-600' : 'text-neutral-400')} />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-neutral-100">
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <UserCog size={16} className="text-neutral-400" />
                <span>Switch Role</span>
              </span>
              <ChevronDown size={14} className={classNames('transition-transform', roleMenuOpen && 'rotate-180')} />
            </button>
            {roleMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-xl border border-neutral-200 shadow-elevated py-1 max-h-64 overflow-y-auto">
                {allRoles.map(r => (
                  <button
                    key={r}
                    onClick={() => handleSwitchRole(r)}
                    className={classNames(
                      'w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 transition-colors',
                      r === role ? 'text-primary-700 font-medium' : 'text-neutral-600',
                    )}
                  >
                    {roleLabels[r]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-error-600 hover:bg-error-50 transition-colors">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 animate-fade-in" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" />
          <aside className="absolute left-0 inset-y-0 w-72 bg-white shadow-float animate-slide-in-right overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-5 border-b border-neutral-100 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
                <div className="w-9 h-9 rounded-xl bg-primary-700 flex items-center justify-center text-white">
                  <Heart size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900 leading-tight">KHWWC</p>
                  <p className="text-2xs text-neutral-400 leading-tight">Welfare Management</p>
                </div>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="btn-ghost p-1.5">
                <X size={20} />
              </button>
            </div>
            <div className="px-3 py-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-neutral-50">
                <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-semibold flex items-center justify-center text-sm">
                  {initials(user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-neutral-800 truncate">{user.name}</p>
                  <p className="text-xs text-neutral-400 truncate">{roleLabels[role]}</p>
                </div>
              </div>
            </div>
            <nav className="px-3 py-3 space-y-0.5">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={classNames(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive(item.path) ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 hover:bg-neutral-50',
                  )}
                >
                  <NavIcon name={item.icon} size={18} className={isActive(item.path) ? 'text-primary-600' : 'text-neutral-400'} />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="px-3 py-3 border-t border-neutral-100 space-y-2">
              <div className="px-3">
                <p className="text-xs font-medium text-neutral-400 mb-2">Switch Role (Demo)</p>
                <div className="flex flex-wrap gap-1.5">
                  {allRoles.map(r => (
                    <button
                      key={r}
                      onClick={() => handleSwitchRole(r)}
                      className={classNames(
                        'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                        r === role ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
                      )}
                    >
                      {roleLabels[r]}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-error-600 hover:bg-error-50">
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between safe-top">
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost p-1.5 -ml-1.5" aria-label="Open menu">
            <Menu size={22} />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-700 flex items-center justify-center text-white">
              <Heart size={16} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold text-neutral-900">KHWWC</span>
          </Link>
          <Link to="/member/notifications" className="btn-ghost p-1.5 -mr-1.5 relative" aria-label="Notifications">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full" />
          </Link>
        </header>

        {/* Page Content */}
        <main className={classNames('flex-1 px-4 py-5 sm:px-6 lg:px-8', isMember && 'pb-20 lg:pb-5')}>
          {children || <Outlet />}
        </main>

        {/* Mobile Bottom Nav (Member only) */}
        {isMember && (
          <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-neutral-200 flex items-center justify-around px-2 py-1.5 safe-bottom">
            {memberBottomNav.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={classNames(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors',
                  isActive(item.path) ? 'text-primary-700' : 'text-neutral-400',
                )}
              >
                <NavIcon name={item.icon} size={20} />
                <span className="text-2xs font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
