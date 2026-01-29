const { Pool } = require('pg');

const DIRECT_URL = "postgresql://postgres:wje5.q*g6UhTxiX@db.ddxkcjqxjnawecaohefm.supabase.co:5432/postgres";

console.log('Supabase接続テスト開始...');

const pool = new Pool({
  connectionString: DIRECT_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

pool.query('SELECT NOW() as current_time, version() as pg_version', (err, res) => {
  if (err) {
    console.error('❌ 接続エラー:', err.message);
    console.error('詳細:', err);
  } else {
    console.log('✅ 接続成功!');
    console.log('現在時刻:', res.rows[0].current_time);
    console.log('PostgreSQLバージョン:', res.rows[0].pg_version);
  }
  pool.end();
});
