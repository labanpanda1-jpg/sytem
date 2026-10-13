import { useQuery } from '@tanstack/react-query';
import { Receipt, Download, Calendar, AlertCircle } from 'lucide-react';
import { mockMember } from '@/api/mock';
import { queryKeys } from '@/lib/query';
import {
  Card, Badge, Button, PageHeader, EmptyState, ErrorState, LoadingState,
} from '@/components/ui';
import { formatCurrency, formatDate, formatDateTime, downloadCSV } from '@/lib/format';
import type { WithdrawalRequest } from '@/types';

export default function WithdrawalReceipts() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.memberWithdrawalReceipts,
    queryFn: () => mockMember.getWithdrawalReceipts(),
  });

  const withdrawals = (data as WithdrawalRequest[] | undefined) ?? [];

  const downloadReceipt = (w: WithdrawalRequest) => {
    downloadCSV(`withdrawal-receipt-${w.id}.csv`, [
      { Field: 'Receipt No', Value: w.id },
      { Field: 'Amount', Value: w.amount },
      { Field: 'Reason', Value: w.reason },
      { Field: 'Status', Value: w.status },
      { Field: 'Requested Date', Value: formatDateTime(w.requested_date) },
      { Field: 'Approved Date', Value: w.approved_date ? formatDateTime(w.approved_date) : '—' },
      { Field: 'Approved By', Value: w.approved_by ?? '—' },
    ]);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Withdrawal Receipts" subtitle="History of your withdrawal requests" icon={<Receipt size={20} />} />

      {isLoading ? (
        <LoadingState text="Loading receipts..." />
      ) : isError ? (
        <ErrorState message="We couldn't load your withdrawal receipts." onRetry={() => refetch()} />
      ) : withdrawals.length === 0 ? (
        <EmptyState icon={<Receipt size={22} />} title="No withdrawal requests" message="Your withdrawal history will appear here." />
      ) : (
        <Card className="divide-y divide-neutral-50">
          {withdrawals.map((w) => (
            <div key={w.id} className="flex items-start gap-3 p-4">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center">
                <Receipt size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-neutral-900">{formatCurrency(w.amount)}</p>
                  <Badge status={w.status}>{w.status}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-neutral-600 line-clamp-2">{w.reason}</p>
                <div className="mt-1.5 flex items-center gap-1 text-xs text-neutral-500">
                  <Calendar size={12} className="text-neutral-400" />
                  Requested {formatDateTime(w.requested_date)}
                  {w.approved_date && <span className="ml-1">· Approved {formatDate(w.approved_date)}</span>}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0 inline-flex items-center gap-1.5"
                onClick={() => downloadReceipt(w)}
              >
                <Download size={14} /> <span className="hidden sm:inline">Receipt</span>
              </Button>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
