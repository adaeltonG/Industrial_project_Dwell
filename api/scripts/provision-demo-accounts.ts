import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const vendorEmail = process.env.VENDOR_EMAIL?.trim().toLowerCase();
  const vendorPassword = process.env.VENDOR_PASSWORD;

  if (!adminEmail || !adminPassword || !vendorEmail || !vendorPassword) {
    throw new Error("ADMIN_EMAIL, ADMIN_PASSWORD, VENDOR_EMAIL and VENDOR_PASSWORD are required");
  }
  if (adminPassword.length < 8 || vendorPassword.length < 8) {
    throw new Error("Account passwords must contain at least eight characters");
  }

  const vendor = await prisma.vendor.findUnique({ where: { slug: "circuit-studio" } });
  if (!vendor) throw new Error("Circuit Studio vendor was not found");

  const [adminHash, vendorHash] = await Promise.all([
    bcrypt.hash(adminPassword, 12),
    bcrypt.hash(vendorPassword, 12)
  ]);

  await prisma.$transaction([
    prisma.user.upsert({
      where: { email: adminEmail },
      update: { name: "Dwell Admin", passwordHash: adminHash, role: UserRole.ADMIN, vendorId: null },
      create: { name: "Dwell Admin", email: adminEmail, passwordHash: adminHash, role: UserRole.ADMIN }
    }),
    prisma.user.upsert({
      where: { email: vendorEmail },
      update: { name: "Circuit Studio", passwordHash: vendorHash, role: UserRole.VENDOR, vendorId: vendor.id },
      create: { name: "Circuit Studio", email: vendorEmail, passwordHash: vendorHash, role: UserRole.VENDOR, vendorId: vendor.id }
    })
  ]);

  console.log("Administrator and Circuit Studio vendor accounts provisioned");
}

main().finally(async () => prisma.$disconnect());
