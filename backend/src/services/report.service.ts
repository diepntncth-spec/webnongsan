import prisma from '../lib/prisma';

export const getAllReports = async () => {
  return prisma.counterfeitReport.findMany({
    include: {
      customer: { include: { account: true } },
      product: { include: { garden: true } },
      manager: true,
    },
    orderBy: { report_date: 'desc' },
  });
};

export const createReport = async (
  customer_id: number,
  data: {
    product_id: number;
    location?: string;
    detected_date?: string;
    fake_method?: string;
    evidence_url?: string;
  }
) => {
  const isPostgres = process.env.DATABASE_URL?.startsWith('postgresql');

  if (isPostgres) {
    // PostgreSQL (Supabase/Render): dùng Prisma create bình thường
    return prisma.counterfeitReport.create({
      data: {
        customer_id,
        product_id: Number(data.product_id),
        location: data.location,
        detected_date: data.detected_date ? new Date(data.detected_date) : null,
        fake_method: data.fake_method,
        evidence_url: data.evidence_url,
        status: 'pending',
      },
    });
  }

  // SQL Server (local): dùng raw SQL để tránh OUTPUT clause bug với NVarChar(Max)
  const detected = data.detected_date ? new Date(data.detected_date) : null;
  await prisma.$executeRaw`
    INSERT INTO Counterfeit_Report (customer_id, product_id, location, detected_date, fake_method, evidence_url, status)
    VALUES (${customer_id}, ${Number(data.product_id)}, ${data.location ?? null}, ${detected}, ${data.fake_method ?? null}, ${data.evidence_url ?? null}, 'pending')
  `;

  return prisma.counterfeitReport.findFirst({
    where: { customer_id, product_id: Number(data.product_id) },
    orderBy: { report_id: 'desc' },
  });
};

export const approveReport = async (
  report_id: number,
  manager_id: number,
  conclusion?: string
) => {
  // Use updateMany + findFirst to avoid SQL Server OUTPUT clause bug (conclusion is NVarChar(Max))
  await prisma.counterfeitReport.updateMany({
    where: { report_id },
    data: {
      status: 'confirmed',
      conclusion: conclusion || 'Báo cáo đã được xác nhận.',
      resolved_by: manager_id,
      resolved_at: new Date(),
    },
  });

  return prisma.counterfeitReport.findFirst({
    where: { report_id },
    include: {
      customer: { include: { account: true } },
      product: true,
      manager: true,
    },
  });
};

export const rejectReport = async (
  report_id: number,
  manager_id: number,
  conclusion?: string
) => {
  // Use updateMany + findFirst to avoid SQL Server OUTPUT clause bug
  await prisma.counterfeitReport.updateMany({
    where: { report_id },
    data: {
      status: 'rejected',
      conclusion: conclusion || 'Báo cáo đã bị từ chối.',
      resolved_by: manager_id,
      resolved_at: new Date(),
    },
  });

  return prisma.counterfeitReport.findFirst({
    where: { report_id },
    include: {
      customer: { include: { account: true } },
      product: true,
      manager: true,
    },
  });
};

export const getMyReports = async (customer_id: number) => {
  return prisma.counterfeitReport.findMany({
    where: { customer_id },
    include: {
      product: { include: { garden: true } },
      manager: true,
    },
    orderBy: { report_date: 'desc' },
  });
};

export const getCustomerIdByAccountId = async (account_id: number) => {
  const customer = await prisma.customer.findUnique({
    where: { account_id },
  });
  return customer?.customer_id;
};

export const getManagerIdByAccountId = async (account_id: number) => {
  const manager = await prisma.manager.findUnique({
    where: { account_id },
  });
  return manager?.manager_id;
};
