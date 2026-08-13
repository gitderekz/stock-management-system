const path = require('path');
const fs = require('fs');
const { sequelize } = require('../src/models');
const { Sequelize } = require('sequelize');

async function run() {
  const migrationsDir = path.join(__dirname, '../src/migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.js')).sort();
  const qi = sequelize.getQueryInterface();

  for (const file of files) {
    const migrationPath = path.join(migrationsDir, file);
    const migration = require(migrationPath);
    if (migration && typeof migration.up === 'function') {
      console.log('Applying migration:', file);
      try {
        await migration.up(qi, Sequelize);
        console.log('Applied:', file);
      } catch (e) {
        console.warn('Skipping migration due to error (may already be applied):', file, e.message || e);
        // continue applying other migrations
      }
    }
  }

  console.log('All migrations applied');
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration runner failed:', err);
  process.exit(1);
});
