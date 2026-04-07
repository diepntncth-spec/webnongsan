import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Star, Package } from 'lucide-react';
import api from '../../services/api';

interface Product {
  product_id: number;
  product_name: string;
  type: string;
  quality: string;
  unit_price: number;
  species?: string;
  garden: {
    name: string;
    city: string;
  };
  _count: {
    batches: number;
  };
}

const qualityColor: Record<string, string> = {
  'Loại 1': 'bg-blue-100 text-blue-700',
  'Hữu cơ': 'bg-green-100 text-green-700',
  'VietGAP': 'bg-emerald-100 text-emerald-700',
  'Loại 2': 'bg-gray-100 text-gray-600',
};

const typeColor: Record<string, string> = {
  'Rau': 'bg-lime-100 text-lime-700',
  'Quả': 'bg-orange-100 text-orange-700',
  'Củ': 'bg-amber-100 text-amber-700',
  'Hạt': 'bg-yellow-100 text-yellow-700',
};

const GradientColors = [
  'from-green-400 to-emerald-500',
  'from-lime-400 to-green-500',
  'from-teal-400 to-green-500',
  'from-emerald-400 to-teal-500',
  'from-green-500 to-lime-400',
];

const TYPE_FILTERS = ['Tất cả', 'Rau lá', 'Trái cây', 'Củ', 'Hạt'];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('Tất cả');

  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/products');
      return res.data;
    },
  });

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      p.garden?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.type?.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeType === 'Tất cả' || p.type === activeType;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      {/* Hero / Search */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 mb-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-2">Nông sản sạch, chất lượng đảm bảo</h2>
        <p className="text-green-100 mb-6">Mua sắm nông sản truy xuất nguồn gốc, chống hàng giả</p>
        <div className="max-w-lg mx-auto relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm, vườn trồng..."
            className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300 shadow-md"
          />
        </div>
        {/* Type filters */}
        <div className="flex flex-wrap gap-2 justify-center">
          {TYPE_FILTERS.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeType === type
                  ? 'bg-green-600 text-white shadow'
                  : 'bg-white/20 text-green-100 hover:bg-white/30 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-500">Đang tải sản phẩm...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
          Không thể tải sản phẩm. Vui lòng thử lại.
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              {search ? `Kết quả tìm kiếm: "${search}"` : 'Tất cả sản phẩm'}
              <span className="text-gray-400 font-normal ml-2">({filtered.length} sản phẩm)</span>
            </h3>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Package size={48} className="mx-auto mb-3 opacity-50" />
              <p>Không tìm thấy sản phẩm phù hợp</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((product, idx) => (
                <div
                  key={product.product_id}
                  onClick={() => navigate(`/products/${product.product_id}`)}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden"
                >
                  {/* Image placeholder */}
                  <div className={`h-44 bg-gradient-to-br ${GradientColors[idx % GradientColors.length]} flex items-center justify-center`}>
                    <div className="text-center text-white">
                      <div className="text-5xl mb-1">🌿</div>
                      <span className="text-sm font-medium opacity-80">{product.type}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors text-base mb-2 line-clamp-2">
                      {product.product_name}
                    </h4>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.type && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[product.type] || 'bg-gray-100 text-gray-600'}`}>
                          {product.type}
                        </span>
                      )}
                      {product.quality && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${qualityColor[product.quality] || 'bg-gray-100 text-gray-600'}`}>
                          {product.quality}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                      <MapPin size={12} />
                      <span className="truncate">{product.garden?.name} - {product.garden?.city}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-bold text-lg">
                        {product.unit_price?.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Star size={12} />
                        {product._count?.batches || 0} lô
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
