import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Tạo tài khoản Manager
  const managerAccount = await prisma.account.create({
    data: {
      username: 'ql_demo',
      password: await bcrypt.hash('demo123', 10),
      email: 'quanly@demo.com',
      type: 'manager',
      status: 'active',
      manager: {
        create: {
          full_name: 'Trần Thị Bình',
          phone_number: '0912345678',
          organization_name: 'Nông Sản Sạch Co.',
        },
      },
    },
    include: { manager: true },
  });
  console.log('✓ Manager created:', managerAccount.username);

  // Tạo vườn
  const garden1 = await prisma.garden.create({
    data: {
      manager_id: managerAccount.manager!.manager_id,
      name: 'Vườn Rau Sạch Đà Lạt',
      city: 'Đà Lạt',
      street: '123 Đường Hoa Hồng',
      area: 5000,
      soil_type: 'Đất phù sa',
    },
  });

  const garden2 = await prisma.garden.create({
    data: {
      manager_id: managerAccount.manager!.manager_id,
      name: 'Vườn Rau Công Nghệ Cao HCM',
      city: 'TP.HCM',
      street: '45 Đường Nguyễn Văn Linh',
      area: 3000,
      soil_type: 'Thủy canh',
    },
  });

  const garden3 = await prisma.garden.create({
    data: {
      manager_id: managerAccount.manager!.manager_id,
      name: 'Vườn Trái Cây Tiền Giang',
      city: 'Tiền Giang',
      street: '78 Quốc Lộ 1A',
      area: 10000,
      soil_type: 'Đất phù sa đồng bằng',
    },
  });
  console.log('✓ Gardens created');

  // Tạo chứng nhận
  await prisma.certification.createMany({
    data: [
      { garden_id: garden1.garden_id, name: 'VietGAP', issuing_authority: 'Bộ Nông nghiệp và Phát triển Nông thôn', issue_date: new Date('2023-01-15'), expiry_date: new Date('2026-01-15') },
      { garden_id: garden1.garden_id, name: 'ISO 22000', issuing_authority: 'Bureau Veritas', issue_date: new Date('2023-09-01'), expiry_date: new Date('2026-09-01') },
      { garden_id: garden2.garden_id, name: 'GlobalGAP', issuing_authority: 'FoodPLUS GmbH', issue_date: new Date('2022-06-01'), expiry_date: new Date('2025-06-01') },
      { garden_id: garden3.garden_id, name: 'Hữu cơ USDA', issuing_authority: 'USDA Organic', issue_date: new Date('2021-03-10'), expiry_date: new Date('2024-03-10') },
    ],
  });
  console.log('✓ Certifications created');

  // Tạo tài khoản Staff
  const staffAccount = await prisma.account.create({
    data: {
      username: 'nv_demo',
      password: await bcrypt.hash('demo123', 10),
      email: 'nhanvien@demo.com',
      type: 'staff',
      status: 'active',
      staff: {
        create: {
          full_name: 'Nguyễn Thị Mai',
          position: 'Kỹ thuật viên',
          phone: '0987654321',
          garden_id: garden1.garden_id,
        },
      },
    },
  });
  console.log('✓ Staff created:', staffAccount.username);

  // Tạo sản phẩm
  const products = await Promise.all([
    prisma.product.create({ data: { garden_id: garden1.garden_id, product_name: 'Xà lách Romaine', type: 'Rau lá', quality: 'VietGAP', unit_price: 30000, species: 'Romaine' } }),
    prisma.product.create({ data: { garden_id: garden1.garden_id, product_name: 'Cải thìa baby', type: 'Rau lá', quality: 'VietGAP', unit_price: 24000, species: 'Baby bok choy' } }),
    prisma.product.create({ data: { garden_id: garden2.garden_id, product_name: 'Rau muống thủy canh', type: 'Rau lá', quality: 'VietGAP', unit_price: 20000 } }),
    prisma.product.create({ data: { garden_id: garden2.garden_id, product_name: 'Cải ngọt thủy canh', type: 'Rau lá', quality: 'VietGAP', unit_price: 18000 } }),
    prisma.product.create({ data: { garden_id: garden3.garden_id, product_name: 'Dưa lưới Nhật', type: 'Trái cây', quality: 'Hữu cơ', unit_price: 120000 } }),
    prisma.product.create({ data: { garden_id: garden3.garden_id, product_name: 'Xoài cát Hòa Lộc', type: 'Trái cây', quality: 'VietGAP', unit_price: 75000 } }),
    prisma.product.create({ data: { garden_id: garden1.garden_id, product_name: 'Cà rốt Đà Lạt', type: 'Củ', quality: 'Loại 1', unit_price: 22000 } }),
    prisma.product.create({ data: { garden_id: garden3.garden_id, product_name: 'Đậu phộng rang', type: 'Hạt', quality: 'Loại 1', unit_price: 55000 } }),
  ]);
  console.log('✓ Products created');

  // Tạo lô hàng
  await prisma.batch.createMany({
    data: [
      { product_id: products[0].product_id, batch_no: 'LOT-2024-001', harvest_date: new Date('2024-03-01'), expiry_date: new Date('2024-04-01'), initial_quantity: 500, current_quantity: 350, status: 'available' },
      { product_id: products[1].product_id, batch_no: 'LOT-2024-002', harvest_date: new Date('2024-03-05'), expiry_date: new Date('2024-04-05'), initial_quantity: 300, current_quantity: 200, status: 'available' },
      { product_id: products[4].product_id, batch_no: 'LOT-2024-003', harvest_date: new Date('2024-02-20'), expiry_date: new Date('2024-05-20'), initial_quantity: 200, current_quantity: 0, status: 'sold' },
      { product_id: products[5].product_id, batch_no: 'LOT-2024-004', harvest_date: new Date('2024-03-10'), expiry_date: new Date('2024-06-10'), initial_quantity: 1000, current_quantity: 800, status: 'available' },
    ],
  });
  console.log('✓ Batches created');

  // Tạo tài khoản Customer
  const customerAccount = await prisma.account.create({
    data: {
      username: 'kh_demo',
      password: await bcrypt.hash('demo123', 10),
      email: 'khachhang@demo.com',
      type: 'customer',
      status: 'active',
      customer: {
        create: {
          full_name: 'Nguyễn Văn An',
          phone_number: '0901234567',
        },
      },
    },
    include: { customer: true },
  });
  console.log('✓ Customer created:', customerAccount.username);

  // Tạo đơn hàng
  const batch1 = await prisma.batch.findFirst({ where: { batch_no: 'LOT-2024-001' } });
  const batch2 = await prisma.batch.findFirst({ where: { batch_no: 'LOT-2024-004' } });

  if (batch1 && batch2 && customerAccount.customer) {
    await prisma.transaction.create({
      data: {
        customer_id: customerAccount.customer.customer_id,
        status: 'delivered',
        total_amount: 150000,
        street: '10 Nguyễn Huệ',
        city: 'TP.HCM',
        transaction_details: {
          create: [{ batch_id: batch1.batch_id, unit_price: 30000, quantity: 5 }],
        },
      },
    });

    await prisma.transaction.create({
      data: {
        customer_id: customerAccount.customer.customer_id,
        status: 'shipping',
        total_amount: 150000,
        street: '10 Nguyễn Huệ',
        city: 'TP.HCM',
        transaction_details: {
          create: [{ batch_id: batch2.batch_id, unit_price: 75000, quantity: 2 }],
        },
      },
    });
  }
  console.log('✓ Transactions created');

  console.log('\n✅ Seed hoàn tất!');
  console.log('Tài khoản demo:');
  console.log('  Khách hàng: kh_demo / demo123');
  console.log('  Quản lý:    ql_demo / demo123');
  console.log('  Nhân viên:  nv_demo / demo123');
}

main()
  .catch((e) => {
    console.error('Seed thất bại:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
