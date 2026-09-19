ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'VENDOR';

ALTER TABLE "users" ADD COLUMN "vendor_id" UUID;
CREATE UNIQUE INDEX "users_vendor_id_key" ON "users"("vendor_id");
ALTER TABLE "users" ADD CONSTRAINT "users_vendor_id_fkey"
FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
