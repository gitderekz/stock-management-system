const { sequelize } = require('../src/models');
(async () => {
  try {
    const qi = sequelize.getQueryInterface();
    const info = await qi.describeTable('stock_balances');
    console.log('stock_balances columns:', info);
    process.exit(0);
  } catch (e) {
    console.error('Error describing table:', e.message || e);
    process.exit(1);
  }
})();
