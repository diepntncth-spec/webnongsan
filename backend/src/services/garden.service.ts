import prisma from '../lib/prisma';

export const getAllGardens = async () => {
  return prisma.garden.findMany({
    include: {
      manager: true,
      _count: {
        select: { staff: true, certifications: true, products: true },
      },
    },
    orderBy: { garden_id: 'desc' },
  });
};

export const getGardenById = async (garden_id: number) => {
  return prisma.garden.findUnique({
    where: { garden_id },
    include: {
      manager: true,
      staff: {
        include: { account: true },
      },
      certifications: true,
      products: {
        include: {
          _count: { select: { batches: true } },
        },
      },
    },
  });
};

export const createGarden = async (data: {
  manager_id: number;
  name: string;
  area?: number;
  street?: string;
  city?: string;
  soil_type?: string;
}) => {
  return prisma.garden.create({
    data: {
      manager_id: data.manager_id,
      name: data.name,
      area: data.area,
      street: data.street,
      city: data.city,
      soil_type: data.soil_type,
    },
  });
};

export const updateGarden = async (
  garden_id: number,
  data: {
    name?: string;
    area?: number;
    street?: string;
    city?: string;
    soil_type?: string;
  }
) => {
  return prisma.garden.update({
    where: { garden_id },
    data,
  });
};

export const deleteGarden = async (garden_id: number) => {
  const productCount = await prisma.product.count({
    where: { garden_id },
  });

  if (productCount > 0) {
    throw new Error('Cannot delete garden with existing products');
  }

  return prisma.garden.delete({
    where: { garden_id },
  });
};

export const getManagerIdByAccountId = async (account_id: number) => {
  const manager = await prisma.manager.findUnique({
    where: { account_id },
  });
  return manager?.manager_id;
};
