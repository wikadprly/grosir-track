import "dotenv/config";
import prisma from "../src/lib/prisma";

async function main() {
  const constraints = await prisma.$queryRaw<{ conname: string; conrelid_text: string; confdeltype: string }[]>`
    SELECT conname,
           conrelid::regclass::text AS "conrelid_text",
           confdeltype::text AS "confdeltype"
    FROM pg_constraint
    WHERE contype = 'f'
    ORDER BY conname
  `;
  console.table(constraints);

  const product = await prisma.product.findUnique({ where: { id: "p-gula1kg" } });
  console.log("product p-gula1kg masih ada:", !!product);
  const detailCount = await prisma.transactionDetail.count({ where: { productId: "p-gula1kg" } });
  console.log("jumlah detail yang merujuk p-gula1kg:", detailCount);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
