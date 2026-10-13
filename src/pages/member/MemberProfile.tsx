import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Phone, MapPin, Building2, Save, CheckCircle } from 'lucide-react';
import { mockMember } from '@/api/mock';
import { queryKeys } from '@/lib/query';
import {
  Card, Button, Input, PageHeader, Avatar, LoadingState, ErrorState,
} from '@/components/ui';
import { useAuth } from '@/auth/AuthContext';
import type { Member } from '@/types';

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  county: string;
  workplace: string;
}

export default function MemberProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [saved, setSaved] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.memberProfile,
    queryFn: () => mockMember.getProfile(),
  });

  const profile = data as Member | undefined;

  // Sync form once data loads
  if (profile && !form) {
    setForm({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      county: profile.county,
      workplace: profile.workplace,
    });
  }

  const update = useMutation({
    mutationFn: (payload: Partial<Member>) => mockMember.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.memberProfile });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    update.mutate(form);
  };

  const set = (k: keyof ProfileForm, v: string) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const displayName = form?.name || profile?.name || user?.name || 'Member';

  if (isLoading) {
    return (
      <div className="space-y-5">
        <PageHeader title="My Profile" subtitle="Update your personal details" icon={<User size={20} />} />
        <LoadingState text="Loading profile..." />
      </div>
    );
  }

  if (isError || !profile || !form) {
    return (
      <div className="space-y-5">
        <PageHeader title="My Profile" subtitle="Update your personal details" icon={<User size={20} />} />
        <ErrorState message="We couldn't load your profile." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="My Profile" subtitle="Update your personal details" icon={<User size={20} />} />

      {/* Profile summary */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <Avatar name={displayName} src={profile.avatar} size="xl" />
          <div className="text-center sm:text-left">
            <h2 className="text-base font-bold text-neutral-900">{profile.name}</h2>
            <p className="text-sm text-neutral-500">{profile.email}</p>
            <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
              <span className="badge bg-primary-50 text-primary-700">{profile.member_number}</span>
              <span className="badge bg-success-100 text-success-700 capitalize">{profile.status}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit form */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-neutral-900 mb-4">Edit Details</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={(e) => set('name', e.target.value)} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            <Input label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            <Input label="County" value={form.county} onChange={(e) => set('county', e.target.value)} />
            <Input label="Workplace" value={form.workplace} onChange={(e) => set('workplace', e.target.value)} />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" className="inline-flex items-center gap-2" disabled={update.isPending}>
              {update.isPending ? 'Saving...' : <><Save size={16} /> Save Changes</>}
            </Button>
            {saved && (
              <span className="text-sm text-success-600 inline-flex items-center gap-1.5">
                <CheckCircle size={15} /> Saved successfully
              </span>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
