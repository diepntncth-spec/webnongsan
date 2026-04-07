import prisma from '../lib/prisma';

export const registerUser = async (data: {
  username: string;
  password: string;
  email: string;
  full_name: string;
  phone_number?: string;
  type?: 'manager' | 'customer';
  organization_name?: string;
}) => {
  const existing = await prisma.account.findFirst({
    where: {
      OR: [{ username: data.username }, { email: data.email }],
    },
  });

  if (existing) {
    throw new Error('Username or email already exists');
  }

  const accountType = data.type || 'customer';

  const account = await prisma.account.create({
    data: {
      username: data.username,
      password: data.password,
      email: data.email,
      type: accountType,
      status: 'active',
    },
  });

  if (accountType === 'manager') {
    await prisma.manager.create({
      data: {
        account_id: account.account_id,
        full_name: data.full_name,
        phone_number: data.phone_number,
        organization_name: data.organization_name,
      },
    });
  } else {
    await prisma.customer.create({
      data: {
        account_id: account.account_id,
        full_name: data.full_name,
        phone_number: data.phone_number,
      },
    });
  }

  return account;
};

export const loginUser = async (username: string, password: string) => {
  const account = await prisma.account.findUnique({
    where: { username },
  });

  if (!account) {
    throw new Error('Invalid credentials');
  }

  if (account.password !== password) {
    throw new Error('Invalid credentials');
  }

  if (account.status !== 'active') {
    throw new Error('Account is not active');
  }

  const token = `simple_token_${account.account_id}_${Date.now()}`;
  return { token, account };
};

export const getProfileByAccountId = async (account_id: number) => {
  const account = await prisma.account.findUnique({
    where: { account_id },
    include: {
      manager: true,
      customer: true,
      staff: true,
    },
  });

  if (!account) {
    throw new Error('Account not found');
  }

  return account;
};

export const updateCustomerProfile = async (
  account_id: number,
  data: { full_name?: string; phone_number?: string }
) => {
  const customer = await prisma.customer.findUnique({
    where: { account_id },
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  return prisma.customer.update({
    where: { account_id },
    data: {
      full_name: data.full_name ?? customer.full_name,
      phone_number: data.phone_number ?? customer.phone_number,
    },
  });
};

export const changePassword = async (
  account_id: number,
  old_password: string,
  new_password: string
) => {
  const account = await prisma.account.findUnique({
    where: { account_id },
  });

  if (!account) {
    throw new Error('Account not found');
  }

  if (account.password !== old_password) {
    throw new Error('Old password is incorrect');
  }

  return prisma.account.update({
    where: { account_id },
    data: { password: new_password },
  });
};
