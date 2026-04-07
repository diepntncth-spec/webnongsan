import prisma from '../lib/prisma';

export const getStaffByGarden = async (garden_id: number) => {
  return prisma.staff.findMany({
    where: { garden_id },
    include: { account: true },
  });
};

export const createStaff = async (data: {
  garden_id: number;
  full_name: string;
  phone?: string;
  position?: string;
}) => {
  return prisma.staff.create({
    data: {
      garden_id: data.garden_id,
      full_name: data.full_name,
      phone: data.phone,
      position: data.position,
    },
  });
};

export const deleteStaff = async (staff_id: number) => {
  return prisma.staff.delete({
    where: { staff_id },
  });
};

export const getAllStaff = async () => {
  return prisma.staff.findMany({
    include: { garden: true, account: true },
    orderBy: { staff_id: 'desc' },
  });
};

export const updateStaff = async (staff_id: number, data: { full_name?: string; phone?: string; position?: string; garden_id?: number }) => {
  return prisma.staff.update({
    where: { staff_id },
    data: {
      full_name: data.full_name,
      phone: data.phone,
      position: data.position,
      garden_id: data.garden_id !== undefined ? Number(data.garden_id) : undefined,
    },
    include: { garden: true, account: true },
  });
};

export const getStaffByAccountId = async (account_id: number) => {
  return prisma.staff.findUnique({
    where: { account_id },
    include: {
      garden: {
        include: {
          certifications: true,
          products: { include: { batches: { orderBy: { created_at: 'desc' } } } },
        },
      },
      account: true,
    },
  });
};
