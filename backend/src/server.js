const { app, server } = require('./app');
const env = require('./config/env');
const { sequelize } = require('./models');
const { seedDatabase } = require('./seed');
const { seedPhase2 } = require('./seedPhase2');
const { execSync } = require('child_process');

async function start() {
  try {
    // Run migrations automatically at startup (safe runner)
    try {
      console.log('Running migration runner...');
      execSync('node scripts/runMigrations.js', { stdio: 'inherit' });
      console.log('Migration runner finished.');
    } catch (mErr) {
      console.warn('Migration runner encountered an error or skipped migrations:', mErr.message);
    }
    await sequelize.authenticate();
    console.log('Database connection established using Sequelize.');

    await sequelize.sync({ alter: false });
    console.log('Sequelize model synchronization completed safely.');

    await seedDatabase();
    console.log('Seed data initialization completed.');

    await seedPhase2();
    console.log('Phase 2 seed data initialization completed.');

    server.listen(env.port, () => {
      console.log(`Stock Management System API running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Sequelize database initialization failed:');
    try {
      console.error('name:', error && error.name);
      console.error('message:', error && error.message);
      console.error('parent:', error && error.parent);
      console.error('original:', error && error.original);
      console.error('sql:', error && error.sql);
      console.error(error && error.stack ? error.stack : error);
    } catch (e) {
      console.error('Error printing detailed DB error:', e);
      console.error(error);
    }
    process.exit(1);
  }
}

start();
