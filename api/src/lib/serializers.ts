import type { Prisma } from "@prisma/client";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { vendor: true; category: true };
}>;

export function serializeProduct(product: ProductWithRelations) {
  return {
    ...product,
    price: product.price.toFixed(2)
  };
}

export function serializeUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return user;
}
