import { useQuery } from '@tanstack/react-query';
import {
  FileText, FileSpreadsheet, FileImage, File as FileIcon, Download, Calendar, HardDrive,
} from 'lucide-react';
import { mockMember } from '@/api/mock';
import { queryKeys } from '@/lib/query';
import {
  Card, Badge, Button, PageHeader, EmptyState, ErrorState, LoadingState,
} from '@/components/ui';
import { formatDate, statusColor } from '@/lib/format';
import type { Document } from '@/types';

function docIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes('sheet') || t.includes('excel') || t.includes('csv')) return <FileSpreadsheet size={18} />;
  if (t.includes('image') || t.includes('photo')) return <FileImage size={18} />;
  if (t.includes('pdf') || t.includes('document') || t.includes('text')) return <FileText size={18} />;
  return <FileIcon size={18} />;
}

export default function MemberDocuments() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.memberDocuments,
    queryFn: () => mockMember.getDocuments(),
  });

  const documents = (data as Document[] | undefined) ?? [];

  return (
    <div className="space-y-5">
      <PageHeader title="My Documents" subtitle="Files shared with you by KHWWC" icon={<FileText size={20} />} />

      {isLoading ? (
        <LoadingState text="Loading documents..." />
      ) : isError ? (
        <ErrorState message="We couldn't load your documents." onRetry={() => refetch()} />
      ) : documents.length === 0 ? (
        <EmptyState icon={<FileText size={22} />} title="No documents" message="Documents shared with you will appear here." />
      ) : (
        <Card className="divide-y divide-neutral-50">
          {documents.map((d) => (
            <div key={d.id} className="flex items-center gap-3 p-4">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center">
                {docIcon(d.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-900 truncate">{d.title}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-500">
                  <span className="flex items-center gap-1"><HardDrive size={12} /> {d.size}</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(d.date)}</span>
                  <span className="hidden sm:inline">by {d.uploaded_by}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge status={d.status}>{d.status}</Badge>
                <Button variant="ghost" size="sm" className="inline-flex items-center gap-1.5">
                  <Download size={14} /> <span className="hidden sm:inline">Download</span>
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
