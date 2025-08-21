// server/migrate.ts
import { query } from "./db.js";

async function main() {
  // Minimal schema for demo; extend as needed
  await query(`
    create table if not exists staff_members (
      id uuid primary key default gen_random_uuid(),
      username text unique not null,
      password_hash text not null,
      role text not null default 'staff',
      created_at timestamptz not null default now()
    );
  `);

  await query(`
    create table if not exists suppliers (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      contact text,
      email text unique,
      rating numeric(2,1) default 5.0,
      created_at timestamptz not null default now()
    );
  `);

  await query(`
    create table if not exists inventory_items (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      unit text,
      current_stock integer not null default 0,
      created_at timestamptz not null default now()
    );
  `);

  await query(`
    create table if not exists orders (
      id uuid primary key default gen_random_uuid(),
      customer_name text,
      status text not null default 'pending',
      total_amount numeric(10,2) not null default 0,
      created_at timestamptz not null default now()
    );
  `);

  console.log("✅ Migration complete");
}

main()
  .catch((e) => {
    console.error("Migration failed", e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
