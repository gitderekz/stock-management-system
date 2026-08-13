const sequelize = require('../src/config/database');

async function inspect() {
  try {
    await sequelize.authenticate();
    const qi = sequelize.getQueryInterface();
    console.log('Describing ALL tables...');
    const all = await qi.showAllTables();
    for (const t of all) {
      try {
        const desc = await qi.describeTable(t);
        console.log(`\nTable: ${t}`);
        console.table(desc);
      } catch (e) {
        console.warn(`Cannot describe table ${t}:`, e.message);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('DB connect error:', err.message);
    process.exit(1);
  }
}

inspect();
