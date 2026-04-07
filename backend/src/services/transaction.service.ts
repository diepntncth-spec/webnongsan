import prisma from '../lib/prisma';

export const getAllTransactions = async () => {
  return prisma.transaction.findMany({
    include: {
      customer: {
        include: { account: true },
      },
      transaction_details: {
        include: {
          batch: {
            include: { product: true },
          },
        },
      },
    },
    orderBy: { transaction_date: 'desc' },
  });
};

export const getMyTransactions = async (customer_id: number) => {
  return prisma.transaction.findMany({
    where: { customer_id },
    include: {
      transaction_details: {
        include: {
          batch: {
            include: { product: true },
          },
        },
      },
    },
    orderBy: { transaction_date: 'desc' },
  });
};

export const createTransaction = async (
  customer_id: number,
  data: {
    street?: string;
    city?: string;
    notes?: string;
    items: Array<{
      batch_id: number;
      quantity: number;
      unit_price: number;
    }>;
  }
) => {
  let total_amount = 0;
  for (const item of data.items) {
    total_amount += Number(item.quantity) * Number(item.unit_price);
  }

  const transaction = await prisma.transaction.create({
    data: {
      customer_id,
      street: data.street,
      city: data.city,
      notes: data.notes,
      status: 'pending',
      total_amount,
    },
  });

  for (const item of data.items) {
    await prisma.transactionDetail.create({
      data: {
        transaction_id: transaction.transaction_id,
        batch_id: Number(item.batch_id),
        unit_price: Number(item.unit_price),
        quantity: Number(item.quantity),
      },
    });

    const batch = await prisma.batch.findUnique({
      where: { batch_id: Number(item.batch_id) },
    });

    if (batch) {
      const newQuantity = Number(batch.current_quantity) - Number(item.quantity);
      await prisma.batch.updateMany({
        where: { batch_id: Number(item.batch_id) },
        data: {
          current_quantity: newQuantity < 0 ? 0 : newQuantity,
          status: newQuantity <= 0 ? 'sold_out' : 'available',
        },
      });
    }
  }

  return prisma.transaction.findFirst({
    where: { transaction_id: transaction.transaction_id },
    include: {
      transaction_details: {
        include: {
          batch: { include: { product: true } },
        },
      },
    },
  });
};

export const updateTransactionStatus = async (
  transaction_id: number,
  status: string
) => {
  await prisma.transaction.updateMany({
    where: { transaction_id },
    data: { status },
  });

  return prisma.transaction.findFirst({
    where: { transaction_id },
    include: {
      customer: { include: { account: true } },
      transaction_details: {
        include: {
          batch: { include: { product: true } },
        },
      },
    },
  });
};

export const getCustomerIdByAccountId = async (account_id: number) => {
  const customer = await prisma.customer.findUnique({
    where: { account_id },
  });
  return customer?.customer_id;
};
