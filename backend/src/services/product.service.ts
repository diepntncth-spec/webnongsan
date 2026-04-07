import prisma from '../lib/prisma';

export const getAllProducts = async () => {
  return prisma.product.findMany({
    include: {
      garden: true,
      _count: { select: { batches: true } },
    },
    orderBy: { created_at: 'desc' },
  });
};

export const getProductById = async (product_id: number) => {
  return prisma.product.findUnique({
    where: { product_id },
    include: {
      garden: {
        include: { certifications: true },
      },
      batches: {
        orderBy: { created_at: 'desc' },
      },
    },
  });
};

export const createProduct = async (data: {
  garden_id: number;
  product_name: string;
  type?: string;
  description?: string;
  quality?: string;
  area?: number;
  species?: string;
  unit_price?: number;
}) => {
  return prisma.product.create({
    data: {
      garden_id: Number(data.garden_id),
      product_name: data.product_name,
      type: data.type,
      description: data.description,
      quality: data.quality,
      area: data.area !== undefined ? Number(data.area) : undefined,
      species: data.species,
      unit_price: data.unit_price !== undefined ? Number(data.unit_price) : undefined,
    },
  });
};

export const updateProduct = async (
  product_id: number,
  data: {
    product_name?: string;
    type?: string;
    description?: string;
    quality?: string;
    area?: number;
    species?: string;
    unit_price?: number;
    garden_id?: number;
  }
) => {
  // Use updateMany + findFirst to avoid SQL Server OUTPUT clause bug on NVarChar(Max)
  await prisma.product.updateMany({
    where: { product_id },
    data: {
      product_name: data.product_name,
      type: data.type,
      description: data.description,
      quality: data.quality,
      area: data.area !== undefined ? Number(data.area) : undefined,
      species: data.species,
      unit_price: data.unit_price !== undefined ? Number(data.unit_price) : undefined,
      garden_id: data.garden_id !== undefined ? Number(data.garden_id) : undefined,
    },
  });

  return prisma.product.findFirst({
    where: { product_id },
    include: {
      garden: true,
      _count: { select: { batches: true } },
    },
  });
};

export const deleteProduct = async (product_id: number) => {
  return prisma.product.delete({
    where: { product_id },
  });
};

export const getDistinctCategories = async () => {
  const products = await prisma.product.findMany({
    select: { type: true },
    distinct: ['type'],
    where: { type: { not: null } },
  });
  return products.map((p) => p.type).filter(Boolean);
};
