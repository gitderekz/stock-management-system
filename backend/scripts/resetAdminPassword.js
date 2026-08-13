const bcrypt = require('bcryptjs');
const { User } = require('../src/models');
(async () => {
  try {
    const user = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!user) {
      console.error('admin user not found');
      process.exit(1);
    }
    user.passwordHash = bcrypt.hashSync('Admin1234!', 10);
    await user.save();
    console.log('Password reset for admin@example.com');
    process.exit(0);
  } catch (e) {
    console.error('Error', e.message || e);
    process.exit(1);
  }
})();
