const { Role, Permission } = require('../src/models');
(async () => {
  try {
    const admin = await Role.findOne({ where: { name: 'admin' }, include: [{ model: Permission, as: 'permissions' }] });
    console.log('Admin role:', admin ? { id: admin.id, name: admin.name, permissions: admin.permissions.map(p=>p.name) } : null);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
