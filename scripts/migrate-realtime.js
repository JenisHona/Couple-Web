const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function run() {
  console.log('Running real-time tables migration...');
  
  await sql`
    CREATE TABLE IF NOT EXISTS roulette_sessions (
      couple_code VARCHAR(100) PRIMARY KEY,
      category VARCHAR(50) DEFAULT 'food',
      partner1_options JSONB DEFAULT '[]'::jsonb,
      partner2_options JSONB DEFAULT '[]'::jsonb,
      last_winner VARCHAR(255),
      last_spun_by INTEGER,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  console.log('✅ Real-time roulette table created successfully!');
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
