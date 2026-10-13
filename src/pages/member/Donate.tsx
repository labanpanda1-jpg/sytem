import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  HeartHandshake, Target, Users, Calendar, TrendingUp, CheckCircle,
  Smartphone, Landmark, CreditCard, AlertCircle,
} from 'lucide-react';
import { mockMember } from '@/api/mock';
import { queryKeys } from '@/lib/query';
import {
  Card, Badge, Button, Input, Select, PageHeader, Modal,
  EmptyState, ErrorState, LoadingState,
} from '@/components/ui';
import { formatCurrency, formatCurrencyShort, formatDate } from '@/lib/format';
import type { DonationCampaign } from '@/types';

type PayMethod = 'mpesa' | 'bank';

interface DonateForm {
  campaign: string;
  amount: string;
  method: PayMethod;
  phone: string;
}

const presetAmounts = [500, 1000, 2000, 5000];

export default function Donate() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<DonationCampaign | null>(null);
  const [form, setForm] = useState<DonateForm>({ campaign: '', amount: '', method: 'mpesa', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.memberDonationCampaigns,
    queryFn: () => mockMember.getDonationCampaigns(),
  });

  const campaigns = (data as DonationCampaign[] | undefined) ?? [];

  const donateMutation = useMutation({
    mutationFn: (payload: DonateForm) => mockMember.donate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.memberDonationCampaigns });
      queryClient.invalidateQueries({ queryKey: queryKeys.memberDashboard });
      setModalOpen(false);
      setSuccess('Donation initiated successfully. Thank you for your generosity!');
      setTimeout(() => setSuccess(''), 4000);
    },
  });

  const openDonate = (c: DonationCampaign) => {
    setSelectedCampaign(c);
    setForm({ campaign: c.id, amount: '', method: 'mpesa', phone: '' });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(form.amount);
    if (!form.campaign) {
      setError('Please select a campaign.');
      return;
    }
    if (!form.amount || Number.isNaN(amt) || amt < 100) {
      setError('Please enter an amount of at least KES 100.');
      return;
    }
    if (form.method === 'mpesa' && !form.phone) {
      setError('M-Pesa phone number is required.');
      return;
    }
    setError('');
    donateMutation.mutate(form);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Donate" subtitle="Support KHWWC welfare causes" icon={<HeartHandshake size={20} />} />

      {success && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-success-50 border border-success-200 text-sm text-success-700">
          <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {isLoading ? (
        <LoadingState text="Loading campaigns..." />
      ) : isError ? (
        <ErrorState message="We couldn't load donation campaigns." onRetry={() => refetch()} />
      ) : campaigns.length === 0 ? (
        <EmptyState icon={<HeartHandshake size={22} />} title="No active campaigns" message="There are no active donation campaigns right now." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c) => {
            const pct = c.target > 0 ? Math.min(Math.round((c.raised / c.target) * 100), 100) : 0;
            return (
              <Card key={c.id} className="p-5 flex flex-col">
                {c.image ? (
                  <img src={c.image} alt={c.title} className="w-full h-32 object-cover rounded-xl mb-3" />
                ) : (
                  <div className="w-full h-32 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                    <Target size={28} className="text-primary-300" />
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <Badge status={c.status}>{c.status}</Badge>
                  <span className="text-xs text-neutral-400 flex items-center gap-1"><Calendar size={11} /> Ends {formatDate(c.end_date)}</span>
                </div>
                <h3 className="text-sm font-semibold text-neutral-900">{c.title}</h3>
                <p className="mt-1 text-xs text-neutral-500 line-clamp-2 flex-1">{c.description}</p>

                {/* Progress */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-neutral-700">{formatCurrencyShort(c.raised)}</span>
                    <span className="text-neutral-400">of {formatCurrencyShort(c.target)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-xs text-neutral-500">
                    <span className="flex items-center gap-1"><TrendingUp size={12} /> {pct}% funded</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {c.contributors} donors</span>
                  </div>
                </div>

                <Button variant="primary" className="mt-4 w-full inline-flex items-center justify-center gap-2" onClick={() => openDonate(c)}>
                  <HeartHandshake size={15} /> Donate
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Donate modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Make a Donation">
        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedCampaign && (
            <div className="p-3 rounded-xl bg-primary-50">
              <p className="text-xs text-primary-600">Donating to</p>
              <p className="text-sm font-semibold text-primary-800">{selectedCampaign.title}</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-error-50 border border-error-200 text-sm text-error-700">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Select label="Campaign" value={form.campaign} onChange={(e) => setForm((f) => ({ ...f, campaign: e.target.value }))}>
            {campaigns.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </Select>

          <div>
            <label className="label">Amount (KES)</label>
            <Input type="number" min="100" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="e.g. 1000" />
            <div className="mt-2 flex flex-wrap gap-2">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, amount: String(amt) }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.amount === String(amt) ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                >
                  {formatCurrency(amt)}
                </button>
              ))}
            </div>
          </div>

          <Select label="Payment Method" value={form.method} onChange={(e) => { setForm((f) => ({ ...f, method: e.target.value as PayMethod })); setError(''); }}>
            <option value="mpesa">M-Pesa</option>
            <option value="bank">Bank Transfer</option>
          </Select>

          {form.method === 'mpesa' ? (
            <div>
              <label className="label">M-Pesa Phone Number</label>
              <div className="relative">
                <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="0712 345 678"
                  className="input-field pl-9"
                />
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-neutral-50 text-xs text-neutral-600 space-y-1">
              <p className="flex items-center gap-1.5 font-medium text-neutral-700"><Landmark size={13} /> Bank Transfer Details</p>
              <p>Account: KHWWC Welfare</p>
              <p>Account No: 0123 4567 8901</p>
              <p>Reference: DON-{selectedCampaign?.id}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={donateMutation.isPending} className="inline-flex items-center gap-2">
              {donateMutation.isPending ? 'Processing...' : <><CreditCard size={15} /> Donate{form.amount ? ` ${formatCurrency(Number(form.amount))}` : ''}</>}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
