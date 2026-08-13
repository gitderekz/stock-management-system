const { Role, Permission, RolePermission } = require('../src/models');
(async () => {
  try {
    const admin = await Role.findOne({ where: { name: 'admin' } });
    if (!admin) throw new Error('admin role not found');
    const needed = ['products.create','products.update','products.delete','products.view'];
    for (const name of needed) {
      let perm = await Permission.findOne({ where: { name } });
      if (!perm) perm = await Permission.create({ name });
      await RolePermission.findOrCreate({ where: { roleId: admin.id, permissionId: perm.id }, defaults: { roleId: admin.id, permissionId: perm.id } });
    }
    console.log('Granted product permissions to admin');
    process.exit(0);
  } catch (e) {
    console.error('Error', e.message || e);
    process.exit(1);
  }
})();
