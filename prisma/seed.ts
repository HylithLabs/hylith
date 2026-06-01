import { PrismaClient, RoleType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Permissions
  const permissionsData = [
    { name: 'meetings:create', description: 'Book new discovery calls' },
    { name: 'meetings:read', description: 'View personal meetings' },
    { name: 'meetings:update', description: 'Request rescheduling of personal meetings' },
    { name: 'meetings:delete', description: 'Request cancellation of personal meetings' },
    { name: 'admin:meetings:read', description: 'View all global agency meetings' },
    { name: 'admin:meetings:write', description: 'Update status or reschedule any meeting' },
    { name: 'availability:manage', description: 'Edit agency operational hours and slots' },
    { name: 'users:manage', description: 'Create, update, block, or delete users' },
    { name: 'settings:manage', description: 'Modify global integration systems' },
  ];

  console.log('Seeding permissions...');
  const permissions: Record<string, any> = {};
  for (const perm of permissionsData) {
    permissions[perm.name] = await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
  }

  // 2. Seed Roles
  console.log('Seeding roles...');
  const userRole = await prisma.role.upsert({
    where: { name: RoleType.USER },
    update: {},
    create: {
      name: RoleType.USER,
      description: 'Standard client user who can book and view meetings',
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: RoleType.ADMIN },
    update: {},
    create: {
      name: RoleType.ADMIN,
      description: 'Agency host who can manage schedules and availability',
    },
  });

  const superAdminRole = await prisma.role.upsert({
    where: { name: RoleType.SUPER_ADMIN },
    update: {},
    create: {
      name: RoleType.SUPER_ADMIN,
      description: 'Platform owner with full system access rights',
    },
  });

  // 3. Map Permissions to Roles
  console.log('Mapping permissions to roles...');
  
  // USER permissions
  const userPerms = ['meetings:create', 'meetings:read', 'meetings:update', 'meetings:delete'];
  for (const name of userPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: permissions[name].id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: permissions[name].id,
      },
    });
  }

  // ADMIN permissions
  const adminPerms = [...userPerms, 'admin:meetings:read', 'admin:meetings:write', 'availability:manage'];
  for (const name of adminPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permissions[name].id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permissions[name].id,
      },
    });
  }

  // SUPER_ADMIN permissions (All permissions)
  const superAdminPerms = Object.keys(permissions);
  for (const name of superAdminPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permissions[name].id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permissions[name].id,
      },
    });
  }

  // 4. Create Default Admin User
  console.log('Creating default administrator...');
  const adminEmail = 'admin@hylith.com';
  const hashedPassword = await bcrypt.hash('hylithadmin123', 12);

  const defaultAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: hashedPassword },
    create: {
      email: adminEmail,
      name: 'Hylith Administrator',
      passwordHash: hashedPassword,
    },
  });

  // Assign SUPER_ADMIN role to default admin
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: defaultAdmin.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: defaultAdmin.id,
      roleId: superAdminRole.id,
    },
  });

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
