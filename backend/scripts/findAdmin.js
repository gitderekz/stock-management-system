const { User } = require('../src/models');
(async () => {
  try {
    const u = await User.findOne({ where: { email: 'admin@example.com' } });
    console.log('admin user:', u ? { id: u.id, email: u.email, fullName: u.fullName } : null);
    process.exit(0);
  } catch (e) {
    console.error('Error', e.message || e);
    process.exit(1);
  }
})();
