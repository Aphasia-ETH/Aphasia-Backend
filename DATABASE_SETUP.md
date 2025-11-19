# Database Setup Guide

## Quick Fix for "Table does not exist" Error

If you see this error:
```
The table `public.User` does not exist in the current database.
```

**Solution**: Run database migrations:

```bash
cd Aphasia-Backend
npm run db:migrate:deploy
```

---

## Initial Database Setup

### 1. Ensure PostgreSQL is Running

```bash
# Check if PostgreSQL is running
pg_isready

# Or check with psql
psql -U your_user -d your_database -c "SELECT 1;"
```

### 2. Configure Database URL

Make sure your `.env` file has the correct `DATABASE_URL`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/aphasia_db"
```

### 3. Generate Prisma Client

```bash
npm run db:generate
# or
npx prisma generate
```

This creates the Prisma Client based on your schema.

### 4. Run Migrations

**For Development:**
```bash
npm run db:migrate
# or
npx prisma migrate dev
```

**For Production:**
```bash
npm run db:migrate:deploy
# or
npx prisma migrate deploy
```

This creates all the database tables defined in `prisma/schema.prisma`.

### 5. Verify Tables Exist

```bash
# Using Prisma Studio (visual database browser)
npm run db:studio

# Or using psql
psql -U your_user -d your_database -c "\dt"
```

---

## Common Issues

### Issue: "Table does not exist"

**Cause**: Migrations haven't been run.

**Fix**:
```bash
npm run db:migrate:deploy
```

### Issue: "Column does not exist" (e.g., `User.password`)

**Cause**: Database schema is out of sync with Prisma schema. The migration was created before the column was added.

**Fix** (Quick - for development):
```bash
npx prisma db push --accept-data-loss
```

**Fix** (Proper - creates migration):
```bash
npm run db:migrate
npm run db:migrate:deploy
```

**Note**: `db push` syncs schema without creating migration files (good for dev). Use `migrate` for production.

### Issue: "Database connection failed"

**Causes**:
- PostgreSQL not running
- Wrong DATABASE_URL
- Database doesn't exist
- Wrong credentials

**Fix**:
1. Check PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL in `.env`
3. Create database if needed: `createdb aphasia_db`
4. Check credentials

### Issue: "Migration already applied"

**Cause**: Migrations were already run.

**Fix**: This is fine! Your database is up to date.

### Issue: "Prisma Client not generated"

**Cause**: Prisma Client needs to be regenerated after schema changes.

**Fix**:
```bash
npm run db:generate
```

---

## Database Scripts

All database-related scripts are in `package.json`:

- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run migrations (dev mode, creates migration files)
- `npm run db:migrate:deploy` - Deploy migrations (production, no new files)
- `npm run db:studio` - Open Prisma Studio (visual database browser)
- `npm run db:reset` - Reset database (⚠️ deletes all data)
- `npm run db:seed` - Seed database with initial data

---

## Schema Changes

If you modify `prisma/schema.prisma`:

1. **Generate new migration**:
   ```bash
   npm run db:migrate
   ```
   This creates a new migration file.

2. **Apply migration**:
   ```bash
   npm run db:migrate:deploy
   ```

3. **Regenerate Prisma Client**:
   ```bash
   npm run db:generate
   ```

---

## Production Deployment

For production, always use:

```bash
npm run db:migrate:deploy
```

This applies migrations without creating new migration files (safer for production).

---

## Troubleshooting

### Check Migration Status

```bash
npx prisma migrate status
```

### View Database Schema

```bash
npm run db:studio
```

Opens a web interface at `http://localhost:5555` to browse your database.

### Reset Database (⚠️ Deletes All Data)

```bash
npm run db:reset
```

This will:
1. Drop all tables
2. Re-run all migrations
3. Run seed script (if exists)

---

## Quick Reference

```bash
# First time setup
npm install
npm run db:generate
npm run db:migrate:deploy

# After schema changes
npm run db:migrate        # Creates migration
npm run db:migrate:deploy # Applies migration
npm run db:generate       # Regenerates client

# Development
npm run db:studio         # Browse database visually
npm run dev               # Start server
```

