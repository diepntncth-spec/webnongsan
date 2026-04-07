import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Award, ShoppingCart, Package, Calendar, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../hooks/useAuth';

interface Batch {
  batch_id: number;
  batch_no: string;
  harvest_date: string;
  expiry_date: string;
  initial_quantity: number;
  current_quantity: number;
  status: string;
  product?: { product_name: string; unit_price: number };
}

interface Certification {
  certification_id: number;
  name: string;
  issue_date: string;
  expiry_date: string;
  issuing_authority: string;
}

interface Product {
  product_id: number;
  product_name: string;
  type: string;
  quality: string;
  species?: string;
  description?: string;
  unit_price: number;
  garden: {
    garden_id: number;
    name: string;
    city: string;
    street?: string;
    certifications: Certification[];
  };
  batches: Batch[];
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [addedBatch, setAddedBatch] = useState<number | null>(null);

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const getQty = (batchId: number) => quantities[batchId] || 1;
  const setQty = (batchId: number, val: number) =>
    setQuantities((prev) => ({ ...prev, [batchId]: Math.max(1, val) }));

  const handleAddToCart = (batch: Batch) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCart(
      {
        batch_id: batch.batch_id,
        product_id: product!.product_id,
        product_name: product!.product_name,
        batch_no: batch.batch_no,
        unit_price: product!.unit_price,
      },
      getQty(batch.batch_id)
    );
    setAddedBatch(batch.batch_id);
    setTimeout(() => setAddedBatch(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-500">Đang tải...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20 text-red-500">Không thể tải thông tin sản phẩm.</div>
    );
  }

  const availableBatches = product.batches.filter((b) => b.status === 'available' || b.status === 'active');

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-green-600 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Quay lại
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: product info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-5xl flex-shrink-0">
                🌿
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.product_name}</h1>
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.type && (
                    <span className="bg-lime-100 text-lime-700 text-sm px-3 py-1 rounded-full font-medium">
                      {product.type}
                    </span>
                  )}
                  {product.quality && (
                    <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-medium">
                      {product.quality}
                    </span>
                  )}
                </div>
                {product.species && (
                  <p className="text-gray-600 text-sm mb-1"><span className="font-medium">Giống:</span> {product.species}</p>
                )}
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {product.unit_price?.toLocaleString('vi-VN')}đ / kg
                </p>
              </div>
            </div>

            {product.description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-2">Mô tả</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>

          {/* Garden info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-green-600" />
              Thông tin vườn trồng
            </h3>
            <div className="space-y-2">
              <p className="text-gray-700"><span className="font-medium">Tên vườn:</span> {product.garden?.name}</p>
              <p className="text-gray-700"><span className="font-medium">Thành phố:</span> {product.garden?.city}</p>
              {product.garden?.street && (
                <p className="text-gray-700"><span className="font-medium">Địa chỉ:</span> {product.garden.street}</p>
              )}
            </div>
          </div>

          {/* Certifications */}
          {product.garden?.certifications?.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Award size={18} className="text-green-600" />
                Chứng nhận chất lượng
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.garden.certifications.map((cert) => {
                  const isExpired = new Date(cert.expiry_date) < new Date();
                  return (
                    <div key={cert.certification_id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <p className="font-medium text-gray-800 text-sm">{cert.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isExpired ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {isExpired ? 'Hết hạn' : 'Còn hiệu lực'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{cert.issuing_authority}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Hết hạn: {new Date(cert.expiry_date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: batches */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={18} className="text-green-600" />
              Lô hàng có sẵn ({availableBatches.length})
            </h3>

            {availableBatches.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Hiện chưa có lô hàng nào.</p>
            ) : (
              <div className="space-y-4">
                {availableBatches.map((batch) => (
                  <div key={batch.batch_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800 text-sm">{batch.batch_no}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Có sẵn</span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={11} />
                        Thu hoạch: {new Date(batch.harvest_date).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={11} />
                        Hết hạn: {new Date(batch.expiry_date).toLocaleDateString('vi-VN')}
                      </div>
                      <p>Còn lại: <span className="font-medium text-gray-700">{batch.current_quantity} kg</span></p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setQty(batch.batch_id, getQty(batch.batch_id) - 1)}
                          className="px-2 py-1.5 text-gray-600 hover:bg-gray-100 font-bold text-sm"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={batch.current_quantity}
                          value={getQty(batch.batch_id)}
                          onChange={(e) => setQty(batch.batch_id, parseInt(e.target.value) || 1)}
                          className="w-12 text-center text-sm border-none focus:outline-none py-1.5"
                        />
                        <button
                          onClick={() => setQty(batch.batch_id, getQty(batch.batch_id) + 1)}
                          className="px-2 py-1.5 text-gray-600 hover:bg-gray-100 font-bold text-sm"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleAddToCart(batch)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                          addedBatch === batch.batch_id
                            ? 'bg-green-500 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {addedBatch === batch.batch_id ? (
                          <><CheckCircle size={15} /> Đã thêm</>
                        ) : (
                          <><ShoppingCart size={15} /> Thêm vào giỏ</>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
