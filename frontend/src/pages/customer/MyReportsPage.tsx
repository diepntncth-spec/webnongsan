import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Plus, X, CheckCircle, Clock } from 'lucide-react';
import api from '../../services/api';

interface Product {
  product_id: number;
  product_name: string;
}

interface Report {
  report_id: number;
  report_date: string;
  location: string;
  status: 'pending' | 'confirmed' | 'rejected';
  conclusion?: string;
  product: {
    product_name: string;
  };
}

interface ReportForm {
  product_id: string;
  location: string;
  detected_date: string;
  fake_method: string;
  evidence_url: string;
}

const statusBadge: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
};

const statusLabel: Record<string, string> = {
  pending:   'Đang xử lý',
  confirmed: 'Đã xác nhận',
  rejected:  'Đã từ chối',
};

const MyReportsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<ReportForm>({
    product_id: '',
    location: '',
    detected_date: '',
    fake_method: '',
    evidence_url: '',
  });

  const { data: myReports = [], isLoading: reportsLoading } = useQuery<Report[]>({
    queryKey: ['my-reports'],
    queryFn: async () => (await api.get('/reports/my')).data,
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products-list'],
    queryFn: async () => {
      const res = await api.get('/products');
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post('/reports', {
        product_id: parseInt(form.product_id),
        location: form.location,
        detected_date: form.detected_date,
        fake_method: form.fake_method,
        evidence_url: form.evidence_url || undefined,
      });
    },
    onSuccess: () => {
      setSuccess(true);
      setForm({ product_id: '', location: '', detected_date: '', fake_method: '', evidence_url: '' });
      queryClient.invalidateQueries({ queryKey: ['my-reports'] });
      setTimeout(() => {
        setSuccess(false);
        setShowModal(false);
      }, 2000);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Gửi báo cáo thất bại. Vui lòng thử lại.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id) { setError('Vui lòng chọn sản phẩm.'); return; }
    setError('');
    mutation.mutate();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openModal = () => {
    setSuccess(false);
    setError('');
    setForm({ product_id: '', location: '', detected_date: '', fake_method: '', evidence_url: '' });
    setShowModal(true);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <AlertTriangle className="text-yellow-500" size={26} />
          Báo cáo hàng giả
        </h1>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Gửi báo cáo mới
        </button>
      </div>

      {/* Info card */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
        <div className="flex gap-3">
          <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">Hướng dẫn báo cáo hàng giả</h3>
            <p className="text-yellow-700 text-sm leading-relaxed">
              Nếu bạn phát hiện sản phẩm nông sản giả mạo hoặc không đúng chất lượng, hãy gửi báo cáo để chúng tôi điều tra.
              Cung cấp càng nhiều thông tin chi tiết càng tốt để giúp chúng tôi xử lý nhanh chóng.
            </p>
          </div>
        </div>
      </div>

      {/* Past reports list */}
      {reportsLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : myReports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-16 text-center">
          <AlertTriangle size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-2">Chưa có báo cáo nào</p>
          <p className="text-gray-400 text-sm mb-6">Báo cáo ngay khi phát hiện hàng giả, hàng kém chất lượng</p>
          <button
            onClick={openModal}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Tạo báo cáo đầu tiên
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-sm text-gray-500">{myReports.length} báo cáo</span>
          </div>
          <div className="divide-y divide-gray-100">
            {myReports.map((report) => (
              <div key={report.report_id} className="px-5 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{report.product?.product_name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{report.location}</p>
                    {report.conclusion && (
                      <p className="text-gray-600 text-xs mt-1 italic">Kết luận: {report.conclusion}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge[report.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel[report.status] || report.status}
                    </span>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(report.report_date).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-800 text-lg">Báo cáo hàng giả</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
            </div>

            <div className="p-6">
              {success ? (
                <div className="text-center py-8">
                  <CheckCircle size={56} className="text-green-500 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-800 text-lg">Gửi báo cáo thành công!</h3>
                  <p className="text-gray-500 text-sm mt-1">Chúng tôi sẽ xem xét và phản hồi sớm nhất.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sản phẩm bị giả mạo <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="product_id"
                      value={form.product_id}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                      <option value="">-- Chọn sản phẩm --</option>
                      {products.map((p) => (
                        <option key={p.product_id} value={p.product_id}>
                          {p.product_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa điểm phát hiện <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      required
                      placeholder="VD: Chợ Bến Thành, TP. Hồ Chí Minh"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày phát hiện <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="detected_date"
                      value={form.detected_date}
                      onChange={handleChange}
                      required
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phương thức làm giả <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="fake_method"
                      value={form.fake_method}
                      onChange={handleChange}
                      required
                      rows={3}
                      placeholder="Mô tả cách thức làm giả sản phẩm..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link bằng chứng (ảnh/video)
                    </label>
                    <input
                      type="url"
                      name="evidence_url"
                      value={form.evidence_url}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {mutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : 'Gửi báo cáo'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReportsPage;
