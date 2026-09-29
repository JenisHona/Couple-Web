const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function run() {
  console.log('Running 18+ Intimacy & Velvet Vault migration...');
  
  await sql`
    CREATE TABLE IF NOT EXISTS intimacy_settings (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      pin_hash VARCHAR(255),
      is_age_confirmed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS intimacy_desire_levels (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      desire_level INTEGER NOT NULL,
      threshold INTEGER DEFAULT 60,
      note TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS intimacy_fantasy_votes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      fantasy_id VARCHAR(100) NOT NULL,
      vote VARCHAR(10) NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, fantasy_id)
    );
  `;

  console.log('✅ 18+ Intimacy tables created successfully!');
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
