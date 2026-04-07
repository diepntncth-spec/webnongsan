import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Package, TreePine, Award, Leaf } from 'lucide-react';
import api from '../services/api';

interface Certification {
  certification_id: number;
  name: string;
  issuing_authority: string;
  expiry_date: string;
  is_active: boolean;
}

interface BatchLookup {
  batch_id: number;
  batch_no: string;
  harvest_date: string;
  expiry_date: string;
  initial_quantity: number;
  current_quantity: number;
  unit: string;
  status: string;
  product: {
    product_name: string;
    type: string;
    quality: string;
    species?: string;
  };
  garden: {
    name: string;
    city: string;
    street?: string;
    soil_type?: string;
    manager?: {
      full_name: string;
      organization_name?: string;
    };
  };
  certifications?: Certification[];
}

const statusLabel: Record<string, { label: string; cls: string }> = {
  available:   { label: 'Còn hàng',   cls: 'bg-green-100 text-green-700' },
  sold_out:    { label: 'Hết hàng',   cls: 'bg-gray-100 text-gray-600' },
  expired:     { label: 'Hết hạn',    cls: 'bg-red-100 text-red-700' },
  recalled:    { label: 'Thu hồi',    cls: 'bg-red-100 text-red-700' },
};

const LookupPage: React.FC = () => {
  const [batchNo, setBatchNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BatchLookup | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = batchNo.trim();
    if (!trimmed) return;

    setLoading(true);
    setResult(null);
    setNotFound(false);
    setSearched(false);

    try {
      const res = await api.get(`/batches/lookup?batch_no=${encodeURIComponent(trimmed)}`);
      setResult(res.data);
      setSearched(true);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setNotFound(true);
      }
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const isCertExpired = (expiry: string) => new Date(expiry) < new Date();

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Leaf className="text-green-600" size={36} />
          <h1 className="text-3xl font-bold text-gray-800">Tra cứu lô hàng</h1>
        </div>
        <p className="text-gray-500 text-base">
          Nhập mã lô hàng để kiểm tra nguồn gốc và tính xác thực của sản phẩm nông sản
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={batchNo}
            onChange={(e) => setBatchNo(e.target.value)}
            placeholder="Nhập mã lô hàng (VD: LOT-2024-001)..."
            className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 text-base shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !batchNo.trim()}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3.5 rounded-xl font-semibold transition-colors shadow-sm flex items-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Search size={20} />
          )}
          Tra cứu
        </button>
      </form>

      {/* Not found */}
      {searched && notFound && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <XCircle size={56} className="mx-auto text-red-400 mb-3" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Không tìm thấy lô hàng</h2>
          <p className="text-red-600 text-sm">
            Mã lô hàng <strong>"{batchNo}"</strong> không tồn tại trong hệ thống.
            Có thể đây là hàng giả mạo hoặc mã lô không chính xác.
          </p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Verified badge */}
          <div className="bg-green-50 border border-green-300 rounded-2xl p-5 flex items-center gap-4">
            <CheckCircle size={48} className="text-green-500 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-green-700">Hàng chính hãng</h2>
              <p className="text-green-600 text-sm mt-0.5">
                Lô hàng <strong>{result.batch_no}</strong> đã được xác minh trong hệ thống truy xuất nguồn gốc.
              </p>
            </div>
          </div>

          {/* Batch Info */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="bg-green-700 px-5 py-3 flex items-center gap-2">
              <Package size={18} className="text-green-200" />
              <h3 className="text-white font-semibold">Thông tin lô hàng</h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <InfoRow label="Mã lô hàng" value={result.batch_no} />
              <InfoRow
                label="Trạng thái"
                value={
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusLabel[result.status]?.cls || 'bg-gray-100 text-gray-600'}`}>
                    {statusLabel[result.status]?.label || result.status}
                  </span>
                }
              />
              <InfoRow label="Ngày thu hoạch" value={new Date(result.harvest_date).toLocaleDateString('vi-VN')} />
              <InfoRow label="Hạn sử dụng" value={new Date(result.expiry_date).toLocaleDateString('vi-VN')} />
              <InfoRow label="Số lượng ban đầu" value={`${result.initial_quantity} ${result.unit}`} />
              <InfoRow label="Số lượng còn lại" value={`${result.current_quantity} ${result.unit}`} />
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="bg-emerald-700 px-5 py-3 flex items-center gap-2">
              <Leaf size={18} className="text-emerald-200" />
              <h3 className="text-white font-semibold">Thông tin sản phẩm</h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <InfoRow label="Tên sản phẩm" value={result.product.product_name} />
              <InfoRow label="Loại" value={result.product.type} />
              <InfoRow label="Chất lượng" value={result.product.quality} />
              {result.product.species && <InfoRow label="Giống" value={result.product.species} />}
            </div>
          </div>

          {/* Garden Info */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="bg-teal-700 px-5 py-3 flex items-center gap-2">
              <TreePine size={18} className="text-teal-200" />
              <h3 className="text-white font-semibold">Thông tin vườn trồng</h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <InfoRow label="Tên vườn" value={result.garden.name} />
              <InfoRow label="Thành phố" value={result.garden.city} />
              {result.garden.street && <InfoRow label="Địa chỉ" value={result.garden.street} />}
              {result.garden.soil_type && <InfoRow label="Loại đất" value={result.garden.soil_type} />}
              {result.garden.manager && (
                <InfoRow label="Quản lý" value={result.garden.manager.full_name} />
              )}
              {result.garden.manager?.organization_name && (
                <InfoRow label="Tổ chức" value={result.garden.manager.organization_name} />
              )}
            </div>
          </div>

          {/* Certifications */}
          {result.certifications && result.certifications.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="bg-yellow-600 px-5 py-3 flex items-center gap-2">
                <Award size={18} className="text-yellow-100" />
                <h3 className="text-white font-semibold">Chứng nhận chất lượng</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Tên chứng nhận', 'Cơ quan cấp', 'Ngày hết hạn', 'Trạng thái'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {result.certifications.map((cert) => {
                      const expired = isCertExpired(cert.expiry_date);
                      return (
                        <tr key={cert.certification_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800 text-sm">{cert.name}</td>
                          <td className="px-4 py-3 text-gray-600 text-sm">{cert.issuing_authority}</td>
                          <td className="px-4 py-3 text-gray-600 text-sm">{new Date(cert.expiry_date).toLocaleDateString('vi-VN')}</td>
                          <td className="px-4 py-3">
                            {expired ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Hết hạn</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Còn hiệu lực</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Initial state */}
      {!searched && !loading && (
        <div className="text-center py-12 text-gray-400">
          <Search size={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-base">Nhập mã lô hàng để bắt đầu tra cứu</p>
          <p className="text-sm mt-1">Mã lô hàng thường được in trên nhãn sản phẩm</p>
        </div>
      )}
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value}</p>
  </div>
);

export default LookupPage;
