const { User, Role } = require('../src/models');
(async () => {
  try {
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    if (!adminRole) throw new Error('admin role not found');
    const user = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!user) throw new Error('admin user not found');
    user.roleId = adminRole.id;
    await user.save();
    console.log(`Assigned role ${adminRole.name} to ${user.email}`);
    process.exit(0);
  } catch (e) {
    console.error('Error', e.message || e);
    process.exit(1);
  }
})();
