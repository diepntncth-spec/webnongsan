import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TreePine, Package, ShoppingCart, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../../services/api';

interface StatsState {
  gardens: number;
  products: number;
  transactions: number;
  pendingReports: number;
  transactionsByStatus: { status: string; count: number }[];
}

const statusColors: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  shipping: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444',
  rejected: '#EF4444',
};

const statusLabels: Record<string, string> = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
  rejected: 'Từ chối',
};

const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = React.useState<StatsState>({
    gardens: 0,
    products: 0,
    transactions: 0,
    pendingReports: 0,
    transactionsByStatus: [],
  });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAll = async () => {
      const results = await Promise.allSettled([
        api.get('/gardens'),
        api.get('/products'),
        api.get('/transactions'),
        api.get('/reports'),
      ]);

      const gardens = results[0].status === 'fulfilled' ? results[0].value.data : [];
      const products = results[1].status === 'fulfilled' ? results[1].value.data : [];
      const transactions = results[2].status === 'fulfilled' ? results[2].value.data : [];
      const reports = results[3].status === 'fulfilled' ? results[3].value.data : [];

      // Group transactions by status
      const statusMap: Record<string, number> = {};
      transactions.forEach((tx: any) => {
        statusMap[tx.status] = (statusMap[tx.status] || 0) + 1;
      });
      const transactionsByStatus = Object.entries(statusMap).map(([status, count]) => ({
        status,
        count,
      }));

      const pendingReports = reports.filter((r: any) => r.status === 'pending').length;

      setStats({
        gardens: gardens.length,
        products: products.length,
        transactions: transactions.length,
        pendingReports,
        transactionsByStatus,
      });
      setIsLoading(false);
    };
    fetchAll();
  }, []);

  const statCards = [
    {
      label: 'Vườn trồng',
      value: stats.gardens,
      icon: TreePine,
      color: 'bg-green-500',
      path: '/manager/gardens',
    },
    {
      label: 'Sản phẩm',
      value: stats.products,
      icon: Package,
      color: 'bg-blue-500',
      path: '/manager/products',
    },
    {
      label: 'Đơn hàng',
      value: stats.transactions,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      path: '/manager/transactions',
    },
    {
      label: 'Báo cáo chờ duyệt',
      value: stats.pendingReports,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      path: '/manager/reports',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-500">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, path }) => (
          <div
            key={label}
            onClick={() => navigate(path)}
            className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow flex items-center gap-4"
          >
            <div className={`${color} rounded-xl p-3 flex-shrink-0`}>
              <Icon size={24} className="text-white" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{label}</p>
              <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="font-bold text-gray-800 mb-6">Đơn hàng theo trạng thái</h2>

        {stats.transactionsByStatus.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400">
            Chưa có dữ liệu đơn hàng
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={stats.transactionsByStatus.map((d) => ({
                ...d,
                name: statusLabels[d.status] || d.status,
              }))}
              margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [value, 'Số đơn']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {stats.transactionsByStatus.map((entry, index) => (
                  <Cell key={index} fill={statusColors[entry.status] || '#6B7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
