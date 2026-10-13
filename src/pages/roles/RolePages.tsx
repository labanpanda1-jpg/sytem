import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard, FileSearch, FileText, CalendarDays, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { mockSecretary, mockChairperson, mockOffice } from '@/api/mock';
import { queryKeys } from '@/lib/query';
import { Card, PageHeader, StatCard, Badge, Button, LoadingState, ErrorState, EmptyState, Modal, Input, Textarea, ConfirmDialog } from '@/components/ui';
import { formatDate, formatDateTime, relativeTime } from '@/lib/format';

// =================== Secretary ===================
export function SecretaryDashboard() {
  const { data, isLoading } = useQuery({ queryKey: queryKeys.secretaryDashboard, queryFn: () => mockSecretary.dashboard() });
  if (isLoading) return <LoadingState />;
  const d = data!;
  return (
    <div>
      <PageHeader title="Secretary Dashboard" subtitle="Meeting minutes and scheduling overview" icon={<LayoutDashboard size={20} />} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Pending Review" value={d.pending_minutes} icon={<Clock size={18} />} color="warning" />
        <StatCard label="Approved" value={d.approved_minutes} icon={<CheckCircle size={18} />} color="success" />
        <StatCard label="Upcoming Meetings" value={d.upcoming_meetings} icon={<CalendarDays size={18} />} />
        <StatCard label="Total Minutes" value={d.total_minutes} icon={<FileText size={18} />} color="secondary" />
      </div>
      <Card className="p-5 mt-4">
        <h3 className="text-sm font-bold mb-3">Recent Minutes</h3>
        <div className="space-y-2">
          {d.recent_minutes.map((m: any) => (
            <div key={m.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
              <div><p className="text-sm font-medium text-neutral-700">{m.title}</p><p className="text-xs text-neutral-400">{formatDate(m.meeting_date)} • {m.attendees} attendees</p></div>
              <Badge status={m.status}>{m.status.replace('_', ' ')}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function MinutesReview() {
  return <MinutesList title="Minutes Review" subtitle="Submit draft minutes for chairperson approval" filterStatus="pending_review" />;
}

export function MinutesManagement() {
  return <MinutesList title="Meeting Minutes" subtitle="Create and manage meeting minutes" showAll />;
}

function MinutesList({ title, subtitle, filterStatus, showAll }: { title: string; subtitle: string; filterStatus?: string; showAll?: boolean }) {
  const qc = useQueryClient();
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ title: '', meeting_date: '', content: '' });

  const { data, isLoading } = useQuery({ queryKey: queryKeys.secretaryMinutes, queryFn: () => mockSecretary.getMeetingMinutes() });
  const submitMutation = useMutation({ mutationFn: (id: string) => mockSecretary.submitForReview(id), onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.secretaryMinutes }) });
  const createMutation = useMutation({ mutationFn: (data: any) => mockSecretary.createMinutes(data), onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.secretaryMinutes }); setCreateModal(false); } });

  if (isLoading) return <LoadingState />;

  let items = data || [];
  if (filterStatus) items = items.filter((m: any) => m.status === filterStatus);

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} icon={showAll ? <FileText size={20} /> : <FileSearch size={20} />}
        action={showAll ? <Button onClick={() => setCreateModal(true)}><Plus size={16} /> New Minutes</Button> : undefined} />
      <Card className="p-4">
        {items.length === 0 ? <EmptyState icon={<FileText size={24} />} title="No minutes found" /> : (
          <div className="space-y-3">
            {items.map((m: any) => (
              <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-neutral-100">
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-800">{m.title}</p>
                  <p className="text-sm text-neutral-500">{formatDate(m.meeting_date)} • {m.attendees} attendees • By {m.prepared_by}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge status={m.status}>{m.status.replace('_', ' ')}</Badge>
                  {m.status === 'draft' && <Button size="sm" onClick={() => submitMutation.mutate(m.id)}>Submit for Review</Button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Meeting Minutes">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <Input label="Meeting Date" type="date" value={form.meeting_date} onChange={e => setForm({ ...form, meeting_date: e.target.value })} required />
          <div><label className="label">Minutes Content</label><Textarea rows={6} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required /></div>
          <Button className="w-full" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}>Create Minutes</Button>
        </div>
      </Modal>
    </div>
  );
}

export function MeetingScheduling() {
  const qc = useQueryClient();
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', time: '', location: '', type: '' });

  const { data, isLoading } = useQuery({ queryKey: queryKeys.secretarySchedule, queryFn: () => mockSecretary.getSchedule() });
  const createMutation = useMutation({ mutationFn: (data: any) => mockSecretary.createMeeting(data), onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.secretarySchedule }); setCreateModal(false); } });

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Meeting Scheduling" subtitle="Plan and schedule meetings" icon={<CalendarDays size={20} />}
        action={<Button onClick={() => setCreateModal(true)}><Plus size={16} /> Schedule Meeting</Button>} />
      <Card className="p-4">
        {(data || []).length === 0 ? <EmptyState icon={<CalendarDays size={24} />} title="No meetings scheduled" /> : (
          <div className="space-y-3">
            {data!.map((m: any) => (
              <div key={m.id} className="p-4 rounded-xl border border-neutral-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-neutral-800">{m.title}</p>
                    <p className="text-sm text-neutral-500">{formatDate(m.date)} at {m.time} • {m.location}</p>
                    <p className="text-xs text-neutral-400 mt-1">Type: {m.type} • {m.attendees_count} attendees</p>
                  </div>
                  <Badge status={m.status}>{m.status}</Badge>
                </div>
                {m.agenda?.length > 0 && (
                  <ul className="mt-3 text-sm text-neutral-600 space-y-1">
                    {m.agenda.map((a: string, i: number) => <li key={i} className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-neutral-400" />{a}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Schedule Meeting">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            <Input label="Time" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
          </div>
          <Input label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
          <Input label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="AGM, Executive, Planning..." required />
          <Button className="w-full" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}>Schedule</Button>
        </div>
      </Modal>
    </div>
  );
}

// =================== Chairperson ===================
export function ChairpersonDashboard() {
  const { data, isLoading } = useQuery({ queryKey: queryKeys.chairpersonDashboard, queryFn: () => mockChairperson.dashboard() });
  if (isLoading) return <LoadingState />;
  const d = data!;
  return (
    <div>
      <PageHeader title="Chairperson Dashboard" subtitle="Oversight and approval authority" icon={<LayoutDashboard size={20} />} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Pending Approvals" value={d.pending_approvals} icon={<Clock size={18} />} color="warning" />
        <StatCard label="Approved" value={d.approved_count} icon={<CheckCircle size={18} />} color="success" />
        <StatCard label="Rejected" value={d.rejected_count} icon={<XCircle size={18} />} color="error" />
        <StatCard label="Total" value={d.approved_count + d.rejected_count + d.pending_approvals} icon={<FileText size={18} />} />
      </div>
      {d.pending_items.length > 0 && (
        <Card className="p-5 mt-4">
          <h3 className="text-sm font-bold mb-3">Pending Approvals</h3>
          <div className="space-y-2">
            {d.pending_items.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                <div><p className="text-sm font-medium text-neutral-700">{m.title}</p><p className="text-xs text-neutral-400">{formatDate(m.meeting_date)}</p></div>
                <Badge status="pending_review">Pending</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export function ApproveMinutes() {
  const qc = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);

  const { data, isLoading } = useQuery({ queryKey: queryKeys.chairpersonApprovals, queryFn: () => mockChairperson.getPendingApprovals() });
  const mutation = useMutation({ mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) => mockChairperson.approveMinutes(id, action), onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.chairpersonApprovals }); qc.invalidateQueries({ queryKey: queryKeys.chairpersonDashboard }); setConfirmAction(null); } });

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Approve Minutes" subtitle="Review and approve meeting minutes" icon={<CheckCircle size={20} />} />
      <Card className="p-4">
        {(data || []).length === 0 ? <EmptyState icon={<CheckCircle size={24} />} title="No pending approvals" message="All minutes have been reviewed." /> : (
          <div className="space-y-3">
            {data!.map((m: any) => (
              <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-neutral-100">
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-800">{m.title}</p>
                  <p className="text-sm text-neutral-500">{formatDate(m.meeting_date)} • {m.attendees} attendees</p>
                  <p className="text-xs text-neutral-400 mt-1">Prepared by {m.prepared_by}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" onClick={() => setConfirmAction({ id: m.id, action: 'approve' })}><CheckCircle size={14} /> Approve</Button>
                  <Button size="sm" variant="danger" onClick={() => setConfirmAction({ id: m.id, action: 'reject' })}><XCircle size={14} /> Reject</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => confirmAction && mutation.mutate(confirmAction)}
        title={confirmAction?.action === 'approve' ? 'Approve Minutes' : 'Reject Minutes'}
        message={`Are you sure you want to ${confirmAction?.action} these minutes?`}
        confirmLabel={confirmAction?.action === 'approve' ? 'Approve' : 'Reject'}
        danger={confirmAction?.action === 'reject'}
      />
    </div>
  );
}

// =================== Office ===================
export function OfficeDashboard() {
  const { data, isLoading } = useQuery({ queryKey: queryKeys.officeDashboard, queryFn: () => mockOffice.dashboard() });
  if (isLoading) return <LoadingState />;
  const d = data!;
  return (
    <div>
      <PageHeader title="Office Dashboard" subtitle="Office operations and member services" icon={<LayoutDashboard size={20} />} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="Total Members" value={d.total_members} icon={<FileText size={18} />} />
        <StatCard label="Pending Applications" value={d.pending_applications} icon={<Clock size={18} />} color="warning" />
        <StatCard label="Pending Documents" value={d.pending_documents} icon={<FileText size={18} />} color="secondary" />
      </div>
      <Card className="p-5 mt-4">
        <h3 className="text-sm font-bold mb-3">Recent Activities</h3>
        <div className="space-y-2">
          {d.recent_activities.map((a: any, i: number) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
              <p className="text-sm text-neutral-700">{a.description}</p>
              <span className="text-xs text-neutral-400">{relativeTime(a.date)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
