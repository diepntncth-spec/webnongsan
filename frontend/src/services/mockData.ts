// Mock data for demo mode (when backend is not available)

export const DEMO_ACCOUNTS: Record<string, any> = {
  kh_demo: {
    token: 'demo-token-customer',
    user: {
      account_id: 1,
      username: 'kh_demo',
      email: 'khachhang@demo.com',
      type: 'customer',
      status: 'active',
      customer: { customer_id: 1, full_name: 'Nguyễn Văn An', phone_number: '0901234567' },
    },
  },
  ql_demo: {
    token: 'demo-token-manager',
    user: {
      account_id: 2,
      username: 'ql_demo',
      email: 'quanly@demo.com',
      type: 'manager',
      status: 'active',
      manager: { manager_id: 1, full_name: 'Trần Thị Bình', phone_number: '0912345678', organization_name: 'Nông Sản Sạch Co.' },
    },
  },
  nv_demo: {
    token: 'demo-token-staff',
    user: {
      account_id: 3,
      username: 'nv_demo',
      email: 'nhanvien@demo.com',
      type: 'staff',
      status: 'active',
    },
  },
};

export const DEMO_PASSWORD = '123456';

export const mockProducts = [
  { product_id: 1, product_name: 'Xà lách Romaine', type: 'Rau lá', quality: 'VietGAP', unit_price: 30000, species: 'Romaine', garden: { name: 'Vườn Rau Sạch Đà Lạt', city: 'Đà Lạt' }, _count: { batches: 2 } },
  { product_id: 2, product_name: 'Cải thìa baby', type: 'Rau lá', quality: 'VietGAP', unit_price: 24000, species: 'Baby bok choy', garden: { name: 'Vườn Rau Sạch Đà Lạt', city: 'Đà Lạt' }, _count: { batches: 2 } },
  { product_id: 3, product_name: 'Rau muống thủy canh', type: 'Rau lá', quality: 'VietGAP', unit_price: 20000, species: 'Ipomoea aquatica', garden: { name: 'Vườn Rau Công Nghệ Cao HCM', city: 'TP.HCM' }, _count: { batches: 1 } },
  { product_id: 4, product_name: 'Cải ngọt thủy canh', type: 'Rau lá', quality: 'VietGAP', unit_price: 18000, species: 'Brassica chinensis', garden: { name: 'Vườn Rau Công Nghệ Cao HCM', city: 'TP.HCM' }, _count: { batches: 1 } },
  { product_id: 5, product_name: 'Dưa lưới Nhật', type: 'Trái cây', quality: 'Hữu cơ', unit_price: 120000, species: 'Cucumis melo', garden: { name: 'Vườn Trái Cây Tiền Giang', city: 'Tiền Giang' }, _count: { batches: 3 } },
  { product_id: 6, product_name: 'Xoài cát Hòa Lộc', type: 'Trái cây', quality: 'VietGAP', unit_price: 75000, species: 'Mangifera indica', garden: { name: 'Vườn Trái Cây Tiền Giang', city: 'Tiền Giang' }, _count: { batches: 4 } },
  { product_id: 7, product_name: 'Cà rốt Đà Lạt', type: 'Củ', quality: 'Loại 1', unit_price: 22000, species: 'Daucus carota', garden: { name: 'Vườn Rau Sạch Đà Lạt', city: 'Đà Lạt' }, _count: { batches: 2 } },
  { product_id: 8, product_name: 'Đậu phộng rang', type: 'Hạt', quality: 'Loại 1', unit_price: 55000, species: 'Arachis hypogaea', garden: { name: 'Nông Trại Tây Ninh', city: 'Tây Ninh' }, _count: { batches: 1 } },
];

export const mockGardens = [
  { garden_id: 1, name: 'Vườn Rau Sạch Đà Lạt', city: 'Đà Lạt', area: 5000, street: '123 Đường Hoa Hồng', soil_type: 'Đất phù sa', products: [mockProducts[0], mockProducts[1], mockProducts[6]], certifications: [], _count: { batches: 6 } },
  { garden_id: 2, name: 'Vườn Rau Công Nghệ Cao HCM', city: 'TP.HCM', area: 3000, street: '45 Đường Nguyễn Văn Linh', soil_type: 'Thủy canh', products: [mockProducts[2], mockProducts[3]], certifications: [], _count: { batches: 2 } },
  { garden_id: 3, name: 'Vườn Trái Cây Tiền Giang', city: 'Tiền Giang', area: 10000, street: '78 Quốc Lộ 1A', soil_type: 'Đất phù sa đồng bằng', products: [mockProducts[4], mockProducts[5]], certifications: [], _count: { batches: 7 } },
  { garden_id: 4, name: 'Nông Trại Tây Ninh', city: 'Tây Ninh', area: 8000, street: '200 Đường Lê Duẩn', soil_type: 'Đất đỏ bazan', products: [mockProducts[7]], certifications: [], _count: { batches: 1 } },
];

export const mockCertifications = [
  { certification_id: 1, name: 'VietGAP', issuing_authority: 'Bộ Nông nghiệp và Phát triển Nông thôn', issue_date: '2023-01-15', expiry_date: '2026-01-15', is_active: true, garden_id: 1 },
  { certification_id: 2, name: 'GlobalGAP', issuing_authority: 'FoodPLUS GmbH', issue_date: '2022-06-01', expiry_date: '2025-06-01', is_active: true, garden_id: 2 },
  { certification_id: 3, name: 'Hữu cơ USDA', issuing_authority: 'USDA Organic', issue_date: '2021-03-10', expiry_date: '2024-03-10', is_active: false, garden_id: 3 },
  { certification_id: 4, name: 'ISO 22000', issuing_authority: 'Bureau Veritas', issue_date: '2023-09-01', expiry_date: '2026-09-01', is_active: true, garden_id: 1 },
];

export const mockBatches = [
  { batch_id: 1, batch_code: 'LOT-2024-001', product_id: 1, garden_id: 1, harvest_date: '2024-03-01', quantity: 500, unit: 'kg', status: 'available', product: { product_name: 'Xà lách Romaine' }, garden: { name: 'Vườn Rau Sạch Đà Lạt' } },
  { batch_id: 2, batch_code: 'LOT-2024-002', product_id: 2, garden_id: 1, harvest_date: '2024-03-05', quantity: 300, unit: 'kg', status: 'available', product: { product_name: 'Cải thìa baby' }, garden: { name: 'Vườn Rau Sạch Đà Lạt' } },
  { batch_id: 3, batch_code: 'LOT-2024-003', product_id: 5, garden_id: 3, harvest_date: '2024-02-20', quantity: 200, unit: 'quả', status: 'sold', product: { product_name: 'Dưa lưới Nhật' }, garden: { name: 'Vườn Trái Cây Tiền Giang' } },
  { batch_id: 4, batch_code: 'LOT-2024-004', product_id: 6, garden_id: 3, harvest_date: '2024-03-10', quantity: 1000, unit: 'kg', status: 'available', product: { product_name: 'Xoài cát Hòa Lộc' }, garden: { name: 'Vườn Trái Cây Tiền Giang' } },
];

export const mockTransactions = [
  { transaction_id: 1, customer_id: 1, status: 'delivered', total_amount: 150000, transaction_date: '2024-03-01T10:00:00Z', items: [{ product_name: 'Xà lách Romaine', quantity: 5, unit_price: 30000 }], customer: { full_name: 'Nguyễn Văn An' } },
  { transaction_id: 2, customer_id: 1, status: 'shipping', total_amount: 240000, transaction_date: '2024-03-08T14:00:00Z', items: [{ product_name: 'Dưa lưới Nhật', quantity: 2, unit_price: 120000 }], customer: { full_name: 'Nguyễn Văn An' } },
  { transaction_id: 3, customer_id: 2, status: 'pending', total_amount: 75000, transaction_date: '2024-03-10T09:30:00Z', items: [{ product_name: 'Xoài cát Hòa Lộc', quantity: 1, unit_price: 75000 }], customer: { full_name: 'Lê Thị Cúc' } },
  { transaction_id: 4, customer_id: 3, status: 'confirmed', total_amount: 110000, transaction_date: '2024-03-09T16:00:00Z', items: [{ product_name: 'Cà rốt Đà Lạt', quantity: 5, unit_price: 22000 }], customer: { full_name: 'Phạm Văn Dũng' } },
  { transaction_id: 5, customer_id: 1, status: 'cancelled', total_amount: 55000, transaction_date: '2024-02-28T11:00:00Z', items: [{ product_name: 'Đậu phộng rang', quantity: 1, unit_price: 55000 }], customer: { full_name: 'Nguyễn Văn An' } },
];

export const mockReports = [
  { report_id: 1, customer_id: 1, product_id: 1, status: 'confirmed', location: 'Chợ Bến Thành, TP.HCM', detected_date: '2024-01-20T00:00:00Z', fake_method: 'Dán nhãn giả VietGAP không đúng quy cách', evidence_url: null, conclusion: 'Đã xác minh hàng giả, đã xử lý cơ sở vi phạm', report_date: '2024-01-20T10:00:00Z', customer: { full_name: 'Nguyễn Văn An', account: { username: 'kh_demo' } }, product: { product_name: 'Xà lách Romaine' } },
  { report_id: 2, customer_id: 2, product_id: 7, status: 'pending', location: 'Siêu thị BigC Q.10, TP.HCM', detected_date: '2024-02-05T00:00:00Z', fake_method: 'Sản phẩm không có mã lô hàng truy xuất nguồn gốc', evidence_url: null, conclusion: null, report_date: '2024-02-05T10:00:00Z', customer: { full_name: 'Lê Thị Lan', account: { username: 'kh_lan' } }, product: { product_name: 'Dưa lưới Nhật' } },
  { report_id: 3, customer_id: 3, product_id: 8, status: 'pending', location: 'Chợ Cái Răng, Cần Thơ', detected_date: '2024-02-15T00:00:00Z', fake_method: 'Hàng không đúng xuất xứ ghi trên bao bì', evidence_url: null, conclusion: null, report_date: '2024-02-15T10:00:00Z', customer: { full_name: 'Phạm Văn Dũng', account: { username: 'kh_dung' } }, product: { product_name: 'Xoài cát Hòa Lộc' } },
  { report_id: 4, customer_id: 4, product_id: 2, status: 'rejected', location: 'Cửa hàng 123 Hoàng Hoa Thám, HN', detected_date: '2024-03-01T00:00:00Z', fake_method: 'Màu sắc và mùi vị không đúng tiêu chuẩn', evidence_url: null, conclusion: 'Đây là sản phẩm hợp lệ, khách nhầm lô hàng', report_date: '2024-03-01T10:00:00Z', customer: { full_name: 'Trần Thị Hoa', account: { username: 'kh_hoa' } }, product: { product_name: 'Cải thìa baby' } },
  { report_id: 5, customer_id: 5, product_id: 1, status: 'pending', location: 'Chợ Đông Ba, Huế', detected_date: '2024-03-08T00:00:00Z', fake_method: 'Bao bì giả mạo thương hiệu Nông Sản Sạch', evidence_url: null, conclusion: null, report_date: '2024-03-08T10:00:00Z', customer: { full_name: 'Võ Minh Khoa', account: { username: 'kh_minh' } }, product: { product_name: 'Xà lách Romaine' } },
];

export const mockStaff = [
  { staff_id: 1, full_name: 'Nguyễn Thị Mai', position: 'Kỹ thuật viên', phone_number: '0987654321', garden_id: 1, garden: { name: 'Vườn Rau Sạch Đà Lạt' }, account: { username: 'nv_demo', email: 'nhanvien@demo.com' } },
  { staff_id: 2, full_name: 'Trần Văn Hùng', position: 'Giám sát vườn', phone_number: '0976543210', garden_id: 2, garden: { name: 'Vườn Rau Công Nghệ Cao HCM' }, account: { username: 'nv02', email: 'nv02@demo.com' } },
  { staff_id: 3, full_name: 'Lê Minh Tuấn', position: 'Kỹ thuật viên', phone_number: '0965432109', garden_id: 3, garden: { name: 'Vườn Trái Cây Tiền Giang' }, account: { username: 'nv03', email: 'nv03@demo.com' } },
];

export const mockMyGarden = {
  staff_id: 1,
  full_name: 'Nguyễn Thị Mai',
  position: 'Kỹ thuật viên',
  garden: {
    garden_id: 1,
    name: 'Vườn Rau Sạch Đà Lạt',
    city: 'Đà Lạt',
    area: 5000,
    street: '123 Đường Hoa Hồng',
    soil_type: 'Đất phù sa',
    products: [
      { product_id: 1, product_name: 'Xà lách Romaine', _count: { batches: 2 } },
      { product_id: 2, product_name: 'Cải thìa baby', _count: { batches: 2 } },
      { product_id: 7, product_name: 'Cà rốt Đà Lạt', _count: { batches: 2 } },
    ],
    certifications: [
      { certification_id: 1, name: 'VietGAP', issuing_authority: 'Bộ Nông nghiệp và Phát triển Nông thôn', issue_date: '2023-01-15', expiry_date: '2026-01-15', is_active: true },
      { certification_id: 4, name: 'ISO 22000', issuing_authority: 'Bureau Veritas', issue_date: '2023-09-01', expiry_date: '2026-09-01', is_active: true },
    ],
    _count: { batches: 6 },
  },
};

export const mockMyOrders = mockTransactions.filter(t => t.customer_id === 1);
export const mockMyReports = mockReports.filter(r => r.customer_id === 1);
export const mockCart: any[] = [];

// Mock lookup data
export const mockLookup: Record<string, any> = {
  'LOT-2024-001': { ...mockBatches[0], product: mockProducts[0], garden: mockGardens[0] },
  'LOT-2024-002': { ...mockBatches[1], product: mockProducts[1], garden: mockGardens[0] },
  'LOT-2024-003': { ...mockBatches[2], product: mockProducts[4], garden: mockGardens[2] },
  'LOT-2024-004': { ...mockBatches[3], product: mockProducts[5], garden: mockGardens[2] },
};

// Route mock responses based on URL
export function getMockResponse(url: string, method: string = 'GET'): any {
  // Products
  if (url.match(/^\/products\/(\d+)$/)) {
    const id = parseInt(url.split('/')[2]);
    return mockProducts.find(p => p.product_id === id) || mockProducts[0];
  }
  if (url === '/products') return mockProducts;

  // Gardens
  if (url === '/gardens') return mockGardens;
  if (url.match(/^\/gardens\/(\d+)$/)) {
    const id = parseInt(url.split('/')[2]);
    return mockGardens.find(g => g.garden_id === id) || mockGardens[0];
  }

  // Transactions
  if (url === '/transactions') return mockTransactions;
  if (url === '/transactions/my') return mockMyOrders;

  // Reports
  if (url === '/reports') return mockReports;
  if (url === '/reports/my') return mockMyReports;

  // Batches
  if (url === '/batches') return mockBatches;
  if (url.match(/^\/batches\/lookup/)) return null;

  // Staff
  if (url === '/staff') return mockStaff;
  if (url === '/staff/my-garden') return mockMyGarden;

  // Certifications
  if (url === '/certifications') return mockCertifications;

  // Cart
  if (url === '/cart') return mockCart;

  // Auth
  if (url === '/auth/profile/me') return null; // handled separately

  // Lookup
  if (url.match(/^\/lookup/)) return null;

  return null;
}
