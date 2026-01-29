const { Pool } = require('pg');

// Session Pooler URL（IPv4互換、Vercel本番環境用）
const DATABASE_URL = "postgresql://postgres.ddxkcjqxjnawecaohefm:wje5.q*g6UhTxiX@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

// Session Pooler Direct URL（IPv4互換、ローカル開発用）
const DIRECT_URL = "postgresql://postgres.ddxkcjqxjnawecaohefm:wje5.q*g6UhTxiX@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";

console.log('=== Supabase Session Pooler接続テスト（IPv4互換） ===\n');

// PgBouncer接続テスト
console.log('1. PgBouncer URL テスト（本番環境用）...');
const poolPgBouncer = new Pool({
  connectionString: DATABASE_URL,
  max: 1,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 10000,
  ssl: { rejectUnauthorized: false },
});

poolPgBouncer.query('SELECT NOW() as current_time, version() as pg_version', (err, res) => {
  if (err) {
    console.error('❌ PgBouncer接続エラー:', err.message);
  } else {
    console.log('✅ PgBouncer接続成功!');
    console.log('   現在時刻:', res.rows[0].current_time);
    console.log('   PostgreSQLバージョン:', res.rows[0].pg_version.substring(0, 50) + '...');
  }
  poolPgBouncer.end();

  // Direct接続テスト
  console.log('\n2. Direct URL テスト（ローカル開発用）...');
  const poolDirect = new Pool({
    connectionString: DIRECT_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  poolDirect.query('SELECT NOW() as current_time', (err2, res2) => {
    if (err2) {
      console.error('❌ Direct接続エラー:', err2.message);
    } else {
      console.log('✅ Direct接続成功!');
      console.log('   現在時刻:', res2.rows[0].current_time);
    }
    poolDirect.end();
  });
});
