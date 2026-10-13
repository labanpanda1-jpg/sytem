import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle, CreditCard, Smartphone, Landmark, CheckCircle, Calendar, Wallet,
} from 'lucide-react';
import { mockMember } from '@/api/mock';
import { queryKeys } from '@/lib/query';
import {
  Card, Badge, Button, Input, Select, PageHeader, Modal,
  EmptyState, ErrorState, LoadingState,
} from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Penalty } from '@/types';

type PayMethod = 'mpesa' | 'bank';

interface PayForm {
  method: PayMethod;
  phone: string;
}

export default function PayPenalty() {
  const queryClient = useQueryClient();
  const [payTarget, setPayTarget] = useState<Penalty | null>(null);
  const [form, setForm] = useState<PayForm>({ method: 'mpesa', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.memberPenalties,
    queryFn: () => mockMember.getPenalties(),
  });

  const penalties = (data as Penalty[] | undefined) ?? [];
  const unpaid = penalties.filter((p) => p.status === 'unpaid');
  const totalUnpaid = unpaid.reduce((sum, p) => sum + p.amount, 0);

  const payMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PayForm }) => mockMember.payPenalty(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.memberPenalties });
      queryClient.invalidateQueries({ queryKey: queryKeys.memberDashboard });
      setPayTarget(null);
      setSuccess('Penalty payment initiated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    },
  });

  const openPay = (p: Penalty) => {
    setPayTarget(p);
    setForm({ method: 'mpesa', phone: '' });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTarget) return;
    if (form.method === 'mpesa' && !form.phone) {
      setError('M-Pesa phone number is required.');
      return;
    }
    setError('');
    payMutation.mutate({ id: payTarget.id, payload: form });
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Pay Penalties" subtitle="Clear your outstanding penalties" icon={<AlertCircle size={20} />} />

      {/* Summary */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-500">Total Outstanding</p>
            <p className={`mt-1 text-2xl font-bold ${totalUnpaid > 0 ? 'text-error-600' : 'text-success-600'}`}>
              {formatCurrency(totalUnpaid)}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${totalUnpaid > 0 ? 'bg-error-50 text-error-600' : 'bg-success-50 text-success-600'}`}>
            <Wallet size={22} />
          </div>
        </div>
      </Card>

      {success && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-success-50 border border-success-200 text-sm text-success-700">
          <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {isLoading ? (
        <LoadingState text="Loading penalties..." />
      ) : isError ? (
        <ErrorState message="We couldn't load your penalties." onRetry={() => refetch()} />
      ) : unpaid.length === 0 ? (
        <EmptyState
          icon={<CheckCircle size={22} />}
          title="No outstanding penalties"
          message="You have cleared all your penalties. Great job!"
        />
      ) : (
        <Card className="divide-y divide-neutral-50">
          {unpaid.map((p) => (
            <div key={p.id} className="flex items-start gap-3 p-4">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-error-50 text-error-600 flex items-center justify-center">
                <AlertCircle size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-900">{formatCurrency(p.amount)}</p>
                <p className="mt-0.5 text-xs text-neutral-600 line-clamp-2">{p.reason}</p>
                <p className="mt-1 text-xs text-neutral-400 flex items-center gap-1">
                  <Calendar size={11} /> Incurred {formatDate(p.date)}
                </p>
              </div>
              <Button variant="primary" size="sm" className="flex-shrink-0" onClick={() => openPay(p)}>
                Pay Now
              </Button>
            </div>
          ))}
        </Card>
      )}

      {/* Pay modal */}
      <Modal open={!!payTarget} onClose={() => setPayTarget(null)} title="Pay Penalty">
        {payTarget && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-neutral-50 flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500">Amount Due</p>
                <p className="text-lg font-bold text-neutral-900">{formatCurrency(payTarget.amount)}</p>
              </div>
              <Badge status="unpaid">{payTarget.status}</Badge>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-error-50 border border-error-200 text-sm text-error-700">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

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
                <p>Reference: {payTarget.id}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setPayTarget(null)}>Cancel</Button>
              <Button type="submit" disabled={payMutation.isPending} className="inline-flex items-center gap-2">
                {payMutation.isPending ? 'Processing...' : <><CreditCard size={15} /> Pay {formatCurrency(payTarget.amount)}</>}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
