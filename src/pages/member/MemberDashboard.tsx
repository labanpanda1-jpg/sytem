import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Wallet, AlertCircle, HeartHandshake, PiggyBank,
  Calendar, Bell, Download, ArrowRight, FileText,
} from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { mockMember } from '@/api/mock';
import { queryKeys } from '@/lib/query';
import {
  Card, StatCard, Badge, Button, PageHeader, SkeletonCard, SkeletonRow, EmptyState, ErrorState,
} from '@/components/ui';
import { formatCurrency, formatCurrencyShort, formatDate } from '@/lib/format';
import type { Contribution, EventItem } from '@/types';

export default function MemberDashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.memberDashboard,
    queryFn: () => mockMember.dashboard(),
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <PageHeader title="Dashboard" subtitle="Welcome back" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <Card className="p-5"><SkeletonRow /></Card>
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState message="We couldn't load your dashboard." onRetry={() => refetch()} />;
  }

  const upcoming = data.upcoming_events as EventItem[];
  const recent = data.recent_contributions as Contribution[];
  const firstName = user?.name?.split(' ')[0] ?? 'Member';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${firstName}`}
        subtitle="Here's an overview of your welfare account"
        action={
          data.unread_notifications > 0 ? (
            <Link to="/member/notifications" className="inline-flex items-center gap-2">
              <span className="relative inline-flex w-9 h-9 rounded-xl bg-primary-50 text-primary-700 items-center justify-center">
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 bg-error-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {data.unread_notifications}
                </span>
              </span>
            </Link>
          ) : undefined
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Contributions"
          value={formatCurrency(data.contributions_total)}
          icon={<PiggyBank size={20} />}
          color="primary"
        />
        <StatCard
          label="Penalties Outstanding"
          value={formatCurrencyShort(data.penalties_total)}
          icon={<AlertCircle size={20} />}
          color={data.penalties_total > 0 ? 'error' : 'success'}
        />
        <StatCard
          label="Donations Made"
          value={formatCurrencyShort(data.donations_total)}
          icon={<HeartHandshake size={20} />}
          color="accent"
        />
        <StatCard
          label="Wallet Balance"
          value={formatCurrencyShort(data.wallet_balance)}
          icon={<Wallet size={20} />}
          color="success"
        />
      </div>

      {/* Quick actions */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <Link to="/member/donate"><Button variant="primary" className="inline-flex items-center gap-2"><HeartHandshake size={16} /> Donate</Button></Link>
          <Link to="/member/pay-penalty"><Button variant="secondary" className="inline-flex items-center gap-2"><AlertCircle size={16} /> Pay Penalty</Button></Link>
          <Link to="/member/downloads"><Button variant="secondary" className="inline-flex items-center gap-2"><Download size={16} /> Download Statement</Button></Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent contributions */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-900">Recent Contributions</h2>
            <Link to="/member/downloads" className="text-xs font-medium text-primary-700 inline-flex items-center gap-1 hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState icon={<FileText size={22} />} title="No contributions yet" message="Your contribution history will appear here." />
          ) : (
            <ul className="divide-y divide-neutral-50">
              {recent.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{c.type}</p>
                    <p className="text-xs text-neutral-500">{formatDate(c.date)} · {c.method}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-neutral-900">{formatCurrency(c.amount)}</p>
                    <Badge status={c.status}>{c.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Upcoming events */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-900">Upcoming Events</h2>
            <Link to="/member/events" className="text-xs font-medium text-primary-700 inline-flex items-center gap-1 hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState icon={<Calendar size={22} />} title="No upcoming events" message="Check back later for new events." />
          ) : (
            <ul className="space-y-3">
              {upcoming.map((e) => (
                <li key={e.id} className="flex gap-3 p-3 rounded-xl bg-neutral-50">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex flex-col items-center justify-center">
                    <span className="text-xs font-medium leading-none">{new Date(e.date).toLocaleDateString('en-KE', { month: 'short' })}</span>
                    <span className="text-lg font-bold leading-none">{new Date(e.date).getDate()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900 truncate">{e.title}</p>
                    <p className="text-xs text-neutral-500 truncate">{e.location}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge status={e.status}>{e.status}</Badge>
                      <span className="text-xs text-neutral-400">{e.attendees_count} attending</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
