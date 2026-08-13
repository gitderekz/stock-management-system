const { User, Role, Permission } = require('../src/models');
(async () => {
  try {
    const user = await User.findOne({ where: { email: 'admin@example.com' }, include: [{ model: Role, as: 'role', include: [{ model: Permission, as: 'permissions' }] }] });
    if (!user) {
      console.log('No admin user');
      process.exit(0);
    }
    console.log({ id: user.id, email: user.email, fullName: user.fullName, roleId: user.roleId, role: user.role ? user.role.name : null, rolePermissions: user.role ? user.role.permissions.map(p=>p.name) : [] });
    process.exit(0);
  } catch (e) {
    console.error('Error', e.message || e);
    process.exit(1);
  }
})();
