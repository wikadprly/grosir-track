"use server";

import prisma from "@/lib/prisma";

export async function getUserProfile() {
  const user = await prisma.user.findFirst();
  return user ? { name: user.name } : null;
}
