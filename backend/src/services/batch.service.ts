import prisma from '../lib/prisma';

export const getAllBatches = async () => {
  return prisma.batch.findMany({
    include: {
      product: {
        include: { garden: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });
};

export const getBatchesByProduct = async (product_id: number) => {
  return prisma.batch.findMany({
    where: { product_id },
    orderBy: { created_at: 'desc' },
  });
};

export const createBatch = async (data: {
  product_id: number;
  batch_no: string;
  harvest_date?: string;
  expiry_date?: string;
  initial_quantity?: number;
  current_quantity?: number;
  status?: string;
}) => {
  return prisma.batch.create({
    data: {
      product_id: Number(data.product_id),
      batch_no: data.batch_no,
      harvest_date: data.harvest_date ? new Date(data.harvest_date) : undefined,
      expiry_date: data.expiry_date ? new Date(data.expiry_date) : undefined,
      initial_quantity: data.initial_quantity !== undefined ? Number(data.initial_quantity) : undefined,
      current_quantity: data.current_quantity !== undefined ? Number(data.current_quantity) : undefined,
      status: data.status || 'available',
    },
  });
};

export const updateBatch = async (
  batch_id: number,
  data: {
    batch_no?: string;
    harvest_date?: string;
    expiry_date?: string;
    initial_quantity?: number;
    current_quantity?: number;
    status?: string;
  }
) => {
  return prisma.batch.update({
    where: { batch_id },
    data: {
      batch_no: data.batch_no,
      harvest_date: data.harvest_date ? new Date(data.harvest_date) : undefined,
      expiry_date: data.expiry_date ? new Date(data.expiry_date) : undefined,
      initial_quantity: data.initial_quantity !== undefined ? Number(data.initial_quantity) : undefined,
      current_quantity: data.current_quantity !== undefined ? Number(data.current_quantity) : undefined,
      status: data.status,
    },
  });
};

export const lookupBatch = async (batch_no: string) => {
  return prisma.batch.findFirst({
    where: { batch_no },
    include: {
      product: {
        include: {
          garden: {
            include: { certifications: true, manager: true },
          },
        },
      },
    },
  });
};

export const deleteBatch = async (batch_id: number) => {
  return prisma.batch.delete({
    where: { batch_id },
  });
};
