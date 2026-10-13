import { GenericListPage, ImportPage } from '@/components/GenericPages';
import { mockTreasurer } from '@/api/mock';
import { queryKeys } from '@/lib/query';
import { Badge } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/format';
import { Landmark, Upload, Scale, BarChart3, Receipt, Wallet } from 'lucide-react';

export function BankStatementPage() {
  return <GenericListPage config={{
    title: 'Bank Statement', subtitle: 'View imported bank transactions', icon: Landmark,
    fetchFn: (p) => mockTreasurer.getBankStatement(p.page), queryKey: (p) => queryKeys.treasurerBankStatement(p.page),
    exportFilename: 'bank-statement.csv',
    statusFilters: [{ value: 'matched', label: 'Matched' }, { value: 'unmatched', label: 'Unmatched' }],
    columns: [
      { key: 'date', label: 'Date', render: r => formatDate(r.date) },
      { key: 'description', label: 'Description' },
      { key: 'reference', label: 'Reference', render: r => <span className="font-mono text-xs text-neutral-500">{r.reference}</span> },
      { key: 'amount', label: 'Amount', render: r => <span className={r.type === 'credit' ? 'text-success-600 font-semibold' : 'text-error-600 font-semibold'}>{r.type === 'credit' ? '+' : '-'}{formatCurrency(r.amount)}</span> },
      { key: 'matched', label: 'Status', render: r => <Badge status={r.matched ? 'confirmed' : 'pending'}>{r.matched ? 'Matched' : 'Unmatched'}</Badge> },
    ],
  }} />;
}

export function BankStatementImportPage() {
  return <ImportPage title="Import Bank Statement" icon={Upload} onImport={(file) => mockTreasurer.importBankStatement(file)} />;
}

export function BookBalanceImportPage() {
  return <ImportPage title="Import Book Balance" icon={Upload} onImport={(file) => mockTreasurer.importBookBalance(file)} />;
}

export function BookBalancePage() {
  return <GenericListPage config={{
    title: 'Book Balance', subtitle: 'Internal ledger balance and entries', icon: Scale,
    fetchFn: (p) => { void p; return mockTreasurer.getBookBalance().then(d => ({ data: d.entries, current_page: 1, last_page: 1, total: d.entries.length })); },
    queryKey: (p) => queryKeys.treasurerBookBalance,
    exportFilename: 'book-balance.csv',
    columns: [
      { key: 'description', label: 'Description' },
      { key: 'type', label: 'Type', render: r => <Badge status={r.type === 'credit' ? 'confirmed' : 'failed'}>{r.type}</Badge> },
      { key: 'amount', label: 'Amount', render: r => formatCurrency(r.amount) },
      { key: 'date', label: 'Date', render: r => formatDate(r.date) },
    ],
  }} />;
}

export function WalletReportsPage() {
  return <GenericListPage config={{
    title: 'Wallet Reports', subtitle: 'Summary reports for all wallets', icon: BarChart3,
    fetchFn: () => mockTreasurer.getWalletReports().then(d => ({ data: d, current_page: 1, last_page: 1, total: d.length })),
    queryKey: () => queryKeys.treasurerWalletReports,
    exportFilename: 'wallet-reports.csv',
    columns: [
      { key: 'wallet', label: 'Wallet' },
      { key: 'transactions', label: 'Transactions' },
      { key: 'balance', label: 'Balance', render: r => formatCurrency(r.balance) },
      { key: 'period', label: 'Period' },
    ],
  }} />;
}

export function ExpensesPage() {
  return <GenericListPage config={{
    title: 'Expenses & Payouts', subtitle: 'Manage operational expenses', icon: Receipt,
    fetchFn: (p) => mockTreasurer.getExpenses(p.page), queryKey: (p) => queryKeys.treasurerExpenses(p.page),
    exportFilename: 'expenses.csv',
    statusFilters: [{ value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'paid', label: 'Paid' }],
    columns: [
      { key: 'description', label: 'Description', render: r => <span className="font-medium">{r.description}</span> },
      { key: 'amount', label: 'Amount', render: r => formatCurrency(r.amount) },
      { key: 'category', label: 'Category' },
      { key: 'date', label: 'Date', render: r => formatDate(r.date) },
      { key: 'status', label: 'Status', render: r => <Badge status={r.status}>{r.status}</Badge> },
    ],
  }} />;
}
