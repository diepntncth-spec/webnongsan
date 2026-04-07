import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TreePine, MapPin, Layers, Package, Award, CheckCircle, AlertCircle } from 'lucide-react';
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
  type: string;
  quality: string;
  unit_price: number;
  species?: string;
  batches?: { batch_id: number }[];
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
  };
}

const StaffMyGarden: React.FC = () => {
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
        Không thể tải thông tin vườn. Vui lòng thử lại.
      </div>
    );
  }

  const { garden } = data;
  const now = new Date();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <TreePine className="text-teal-600" size={26} />
        Vườn của tôi
      </h1>

      {/* Garden details */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5">
          <h2 className="text-white font-bold text-2xl mb-1">{garden.name}</h2>
          <div className="flex items-center gap-2 text-teal-100 text-sm">
            <MapPin size={14} />
            <span>{garden.street ? `${garden.street}, ` : ''}{garden.city}</span>
          </div>
        </div>
        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-6">
          {garden.area != null && (
            <DetailItem label="Diện tích" value={`${garden.area} ha`} icon={<Layers size={16} className="text-teal-500" />} />
          )}
          {garden.soil_type && (
            <DetailItem label="Loại đất" value={garden.soil_type} icon={<Layers size={16} className="text-amber-500" />} />
          )}
          <DetailItem label="Số sản phẩm" value={`${garden.products.length} loại`} icon={<Package size={16} className="text-emerald-500" />} />
          <DetailItem label="Chứng nhận" value={`${garden.certifications.length} chứng nhận`} icon={<Award size={16} className="text-yellow-500" />} />
        </div>
      </div>

      {/* Products list */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Package size={18} className="text-emerald-600" /> Danh sách sản phẩm
          </h3>
        </div>
        {garden.products.length === 0 ? (
          <div className="text-center py-10 text-gray-400">Chưa có sản phẩm nào trong vườn</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Tên sản phẩm', 'Loại', 'Chất lượng', 'Giống', 'Giá', 'Số lô'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {garden.products.map((p) => (
                  <tr key={p.product_id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800 text-sm">{p.product_name}</td>
                    <td className="px-5 py-3 text-sm">
                      <span className="bg-lime-100 text-lime-700 px-2 py-0.5 rounded-full text-xs font-medium">{p.type}</span>
                    </td>
                    <td className="px-5 py-3 text-sm">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">{p.quality}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{p.species || '—'}</td>
                    <td className="px-5 py-3 text-sm text-green-600 font-semibold">{p.unit_price?.toLocaleString('vi-VN')}đ</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{p.batches?.length ?? 0} lô</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Certifications list */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Award size={18} className="text-yellow-600" /> Chứng nhận chất lượng
          </h3>
        </div>
        {garden.certifications.length === 0 ? (
          <div className="text-center py-10 text-gray-400">Chưa có chứng nhận nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Tên chứng nhận', 'Cơ quan cấp', 'Ngày cấp', 'Ngày hết hạn', 'Trạng thái'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {garden.certifications.map((cert) => {
                  const expired = new Date(cert.expiry_date) < now;
                  return (
                    <tr key={cert.certification_id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800 text-sm">{cert.name}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{cert.issuing_authority}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{new Date(cert.issue_date).toLocaleDateString('vi-VN')}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{new Date(cert.expiry_date).toLocaleDateString('vi-VN')}</td>
                      <td className="px-5 py-3">
                        {expired ? (
                          <span className="flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium w-fit">
                            <AlertCircle size={12} /> Hết hạn
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium w-fit">
                            <CheckCircle size={12} /> Còn hiệu lực
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-start gap-2">
    <div className="mt-0.5">{icon}</div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-800 text-sm">{value}</p>
    </div>
  </div>
);

export default StaffMyGarden;
