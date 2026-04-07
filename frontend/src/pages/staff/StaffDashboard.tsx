import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, TreePine, Package, Boxes, Award, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';

interface Certification {
  certification_id: number;
  name: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date: string;
  is_active: boolean;
}

interface Product {
  product_id: number;
  product_name: string;
  _count?: { batches: number };
}

interface MyGarden {
  staff_id: number;
  full_name: string;
  position?: string;
  garden: {
    garden_id: number;
    name: string;
    city: string;
    area?: number;
    street?: string;
    soil_type?: string;
    products: Product[];
    certifications: Certification[];
    _count?: { batches: number };
  };
}

const StaffDashboard: React.FC = () => {
  const { data, isLoading, error } = useQuery<MyGarden>({
    queryKey: ['staff-my-garden'],
    queryFn: async () => (await api.get('/staff/my-garden')).data,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        Không thể tải thông tin. Vui lòng thử lại.
      </div>
    );
  }

  const { garden } = data;
  const totalBatches = garden.products.reduce((acc, p) => acc + (p._count?.batches || 0), 0);
  const now = new Date();
  const activeCerts = garden.certifications.filter((c) => new Date(c.expiry_date) >= now);
  const expiredCerts = garden.certifications.filter((c) => new Date(c.expiry_date) < now);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <LayoutDashboard className="text-teal-600" size={26} />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
          <p className="text-gray-500 text-sm">Xin chào, <span className="font-semibold text-teal-600">{data.full_name}</span>{data.position ? ` — ${data.position}` : ''}</p>
        </div>
      </div>

      {/* Garden card */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <TreePine size={22} className="text-teal-200" />
          <h2 className="text-xl font-bold">{garden.name}</h2>
        </div>
        <p className="text-teal-100 text-sm">{garden.street ? `${garden.street}, ` : ''}{garden.city}</p>
        {garden.soil_type && <p className="text-teal-200 text-xs mt-1">Loại đất: {garden.soil_type}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<Package className="text-teal-600" size={22} />}
          label="Sản phẩm"
          value={garden.products.length}
          bg="bg-teal-50"
        />
        <StatCard
          icon={<Boxes className="text-emerald-600" size={22} />}
          label="Tổng lô hàng"
          value={totalBatches}
          bg="bg-emerald-50"
        />
        <StatCard
          icon={<Award className="text-yellow-600" size={22} />}
          label="Chứng nhận"
          value={garden.certifications.length}
          bg="bg-yellow-50"
        />
      </div>

      {/* Certifications */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Award size={18} className="text-yellow-600" /> Chứng nhận chất lượng
          </h3>
          <div className="flex gap-2 text-xs">
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{activeCerts.length} còn hiệu lực</span>
            {expiredCerts.length > 0 && (
              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{expiredCerts.length} hết hạn</span>
            )}
          </div>
        </div>
        {garden.certifications.length === 0 ? (
          <div className="text-center py-10 text-gray-400">Chưa có chứng nhận nào</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {garden.certifications.map((cert) => {
              const expired = new Date(cert.expiry_date) < now;
              return (
                <div key={cert.certification_id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{cert.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{cert.issuing_authority}</p>
                    <p className="text-gray-400 text-xs">Hết hạn: {new Date(cert.expiry_date).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {expired ? (
                      <span className="flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                        <AlertCircle size={12} /> Hết hạn
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                        <CheckCircle size={12} /> Hiệu lực
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; bg: string }> = ({ icon, label, value, bg }) => (
  <div className={`${bg} rounded-xl p-5 flex items-center gap-4`}>
    <div className="p-3 bg-white rounded-lg shadow-sm">{icon}</div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  </div>
);

export default StaffDashboard;
