import prisma from '../lib/prisma';

export const getCertificationsByGarden = async (garden_id: number) => {
  return prisma.certification.findMany({
    where: { garden_id },
    orderBy: { certification_id: 'desc' },
  });
};

export const createCertification = async (data: {
  garden_id: number;
  name: string;
  issue_date?: string;
  expiry_date?: string;
  issuing_authority?: string;
}) => {
  return prisma.certification.create({
    data: {
      garden_id: data.garden_id,
      name: data.name,
      issue_date: data.issue_date ? new Date(data.issue_date) : undefined,
      expiry_date: data.expiry_date ? new Date(data.expiry_date) : undefined,
      issuing_authority: data.issuing_authority,
    },
  });
};

export const deleteCertification = async (certification_id: number) => {
  return prisma.certification.delete({
    where: { certification_id },
  });
};

export const getAllCertifications = async () => {
  return prisma.certification.findMany({
    include: { garden: true },
    orderBy: { certification_id: 'desc' },
  });
};

export const updateCertification = async (
  certification_id: number,
  data: { name?: string; issue_date?: string; expiry_date?: string; issuing_authority?: string; garden_id?: number }
) => {
  return prisma.certification.update({
    where: { certification_id },
    data: {
      name: data.name,
      issue_date: data.issue_date ? new Date(data.issue_date) : undefined,
      expiry_date: data.expiry_date ? new Date(data.expiry_date) : undefined,
      issuing_authority: data.issuing_authority,
      garden_id: data.garden_id !== undefined ? Number(data.garden_id) : undefined,
    },
    include: { garden: true },
  });
};
