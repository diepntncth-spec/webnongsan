import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/Pagination';

interface Report {
  report_id: number;
  detected_date: string;
  location: string;
  fake_method: string;
  evidence_url?: string;
  status: string;
  conclusion?: string;
  customer: { full_name: string; account: { username: string } };
  product: { product_name: string };
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-700' },
};

const PAGE_SIZE = 10;

const ReportManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [actionModal, setActionModal] = useState<{ report: Report; action: 'approve' | 'reject' } | null>(null);
  const [conclusion, setConclusion] = useState('');
  const [actionError, setActionError] = useState('');
  const [page, setPage] = useState(1);

  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: async () => (await api.get('/reports')).data,
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, conclusion }: { id: number; action: 'approve' | 'reject'; conclusion: string }) => {
      if (action === 'approve') {
        return api.put(`/reports/${id}/approve`, { conclusion });
      }
      return api.put(`/reports/${id}/reject`, { conclusion });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setActionModal(null);
      setConclusion('');
      setActionError('');
    },
    onError: (err: any) => setActionError(err?.response?.data?.message || 'Thao tác thất bại.'),
  });

  const openAction = (report: Report, action: 'approve' | 'reject') => {
    setActionModal({ report, action });
    setConclusion('');
    setActionError('');
  };

  const handleAction = () => {
    if (!actionModal) return;
    actionMutation.mutate({
      id: actionModal.report.report_id,
      action: actionModal.action,
      conclusion,
    });
  };

  const totalPages = Math.ceil(reports.length / PAGE_SIZE);
  const paged = reports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <AlertTriangle className="text-yellow-500" size={24} /> Báo cáo hàng giả
      </h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div></div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Ngày phát hiện', 'Khách hàng', 'Sản phẩm', 'Địa điểm', 'Phương thức giả', 'Trạng thái', 'Thao tác'].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">Chưa có báo cáo nào</td></tr>
                ) : paged.map((r) => {
                  const st = statusConfig[r.status] || { label: r.status, className: 'bg-gray-100 text-gray-600' };
                  return (
                    <tr key={r.report_id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-600">{new Date(r.detected_date).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-800">{r.customer?.full_name}</p>
                        <p className="text-xs text-gray-400">@{r.customer?.account?.username}</p>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-800">{r.product?.product_name}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 max-w-xs">
                        <span className="line-clamp-2">{r.location}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 max-w-xs">
                        <span className="line-clamp-2">{r.fake_method}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${st.className}`}>{st.label}</span>
                        {r.conclusion && (
                          <p className="text-xs text-gray-400 mt-1 max-w-xs line-clamp-1">{r.conclusion}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {r.status === 'pending' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => openAction(r, 'approve')}
                              className="flex items-center gap-1 px-2 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg font-medium transition-colors"
                            >
                              <CheckCircle size={13} /> Duyệt
                            </button>
                            <button
                              onClick={() => openAction(r, 'reject')}
                              className="flex items-center gap-1 px-2 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg font-medium transition-colors"
                            >
                              <XCircle size={13} /> Từ chối
                            </button>
                          </div>
                        )}
                        {r.status !== 'pending' && (
                          <span className="text-xs text-gray-400">Đã xử lý</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Action modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-800 text-lg">
                {actionModal.action === 'approve' ? 'Duyệt báo cáo' : 'Từ chối báo cáo'}
              </h2>
              <button onClick={() => setActionModal(null)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-5">
                <p className="text-sm font-semibold text-gray-700 mb-1">{actionModal.report.product?.product_name}</p>
                <p className="text-xs text-gray-500">Người báo cáo: {actionModal.report.customer?.full_name}</p>
                <p className="text-xs text-gray-500">Địa điểm: {actionModal.report.location}</p>
                <p className="text-xs text-gray-500 mt-1">Phương thức: {actionModal.report.fake_method}</p>
                {actionModal.report.evidence_url && (
                  <a href={actionModal.report.evidence_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline mt-1 block">
                    Xem bằng chứng
                  </a>
                )}
              </div>

              {actionError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{actionError}</div>
              )}

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kết luận {actionModal.action === 'reject' ? <span className="text-red-500">*</span> : ''}
                </label>
                <textarea
                  value={conclusion}
                  onChange={(e) => setConclusion(e.target.value)}
                  rows={3}
                  placeholder={actionModal.action === 'approve' ? 'Nhập kết luận điều tra...' : 'Lý do từ chối...'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setActionModal(null)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50">Hủy</button>
                <button
                  onClick={handleAction}
                  disabled={actionMutation.isPending}
                  className={`flex-1 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                    actionModal.action === 'approve'
                      ? 'bg-green-500 hover:bg-green-600 disabled:bg-green-300'
                      : 'bg-red-500 hover:bg-red-600 disabled:bg-red-300'
                  }`}
                >
                  {actionMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : actionModal.action === 'approve' ? (
                    <><CheckCircle size={16} /> Xác nhận duyệt</>
                  ) : (
                    <><XCircle size={16} /> Xác nhận từ chối</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;
