import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// ============================================
// DAFTAR BARANG TOKO REMA
// ============================================
const products = [
  // Bahan Pokok
  { id: "p-beras1kg", name: "1kg Beras", defaultPrice: 15000, category: "Bahan Pokok" },
  { id: "p-minyak1l", name: "1kg Minyak", defaultPrice: 16500, category: "Bahan Pokok" },
  { id: "p-gulapasir1kg", name: "1kg Gula Pasir", defaultPrice: 18000, category: "Bahan Pokok" },
  { id: "p-terigu1kg", name: "1kg Terigu Curah", defaultPrice: 11000, category: "Bahan Pokok" },
  { id: "p-sakterigu", name: "1 sak Terigu", defaultPrice: 245000, category: "Bahan Pokok" },
  { id: "p-sakaci", name: "1 sak Aci", defaultPrice: 280000, category: "Bahan Pokok" },
  { id: "p-aci1kg", name: "1kg Aci", defaultPrice: 12000, category: "Bahan Pokok" },

  // Minyak & Tepung
  { id: "p-minyakita1l", name: "1 dus Minyakita 1L", defaultPrice: 185000, category: "Minyak & Tepung" },
  { id: "p-minyakita2l", name: "1 dus Minyakita 2L", defaultPrice: 185000, category: "Minyak & Tepung" },
  { id: "p-rizkykrat", name: "1 krat Rizky", defaultPrice: 155000, category: "Minyak & Tepung" },
  { id: "p-fitridus", name: "1 dus Fitri", defaultPrice: 160000, category: "Minyak & Tepung" },
  { id: "p-rosebrand-dus", name: "1 dus Tepung Rose Brand", defaultPrice: 145000, category: "Minyak & Tepung" },
  { id: "p-segitigabiru-dus", name: "1 dus Segitiga Biru", defaultPrice: 155000, category: "Minyak & Tepung" },
  { id: "p-boladeli-dus", name: "1 dus Tepung Bola Deli", defaultPrice: 165000, category: "Minyak & Tepung" },
  { id: "p-rosebrand200gr", name: "200gr Tepung Rose Brand", defaultPrice: 3500, category: "Minyak & Tepung" },
  { id: "p-rosebrand500gr", name: "500gr Tepung Rose Brand", defaultPrice: 7500, category: "Minyak & Tepung" },
  { id: "p-rosebrandketan", name: "1 bungkus Rose Brand Ketan", defaultPrice: 9000, category: "Minyak & Tepung" },
  { id: "p-segitigabiru200gr", name: "200gr Segitiga Biru", defaultPrice: 4000, category: "Minyak & Tepung" },
  { id: "p-segitigabiru500gr", name: "500gr Segitiga Biru", defaultPrice: 8000, category: "Minyak & Tepung" },
  { id: "p-segitigabiru1kg", name: "1kg Segitiga Biru", defaultPrice: 14500, category: "Minyak & Tepung" },
  { id: "p-boladelibungkus", name: "1 bungkus Tepung Bola Deli", defaultPrice: 8500, category: "Minyak & Tepung" },

  // Mi & Bihun
  { id: "p-soun1", name: "1 bungkus Soun 1", defaultPrice: 28000, category: "Mi & Bihun" },
  { id: "p-ekomi-dus", name: "1 dus Eko Mi", defaultPrice: 82000, category: "Mi & Bihun" },
  { id: "p-bihunball", name: "1 ball Bihun", defaultPrice: 120000, category: "Mi & Bihun" },
  { id: "p-mibakso2kg", name: "2kg Mi Bakso", defaultPrice: 42000, category: "Mi & Bihun" },
  { id: "p-mibakso-dus", name: "1 dus Mi Bakso", defaultPrice: 95000, category: "Mi & Bihun" },
  { id: "p-sedaap-goreng", name: "1 dus Sedaap Goreng", defaultPrice: 115000, category: "Mi & Bihun" },
  { id: "p-sedaap-ayambawang", name: "1 dus Sedaap Ayam Bawang", defaultPrice: 112000, category: "Mi & Bihun" },
  { id: "p-sedaap-soto", name: "1 dus Sedaap Soto", defaultPrice: 112000, category: "Mi & Bihun" },
  { id: "p-sedaap-kari", name: "1 dus Sedaap Kari", defaultPrice: 115000, category: "Mi & Bihun" },
  { id: "p-sedaap-koreanspicy", name: "1 dus Sedaap Korean Spicy", defaultPrice: 135000, category: "Mi & Bihun" },
  { id: "p-sedaap-singapore", name: "1 dus Sedaap Singapore Spicy Laksa", defaultPrice: 135000, category: "Mi & Bihun" },
  { id: "p-migunung", name: "1 dus Mi Gunung", defaultPrice: 85000, category: "Mi & Bihun" },
  { id: "p-ekomi2000", name: "1 bungkus Eko Mi 2000", defaultPrice: 2000, category: "Mi & Bihun" },
  { id: "p-ekomirenteng", name: "1 renteng Eko Mi", defaultPrice: 18000, category: "Mi & Bihun" },
  { id: "p-bihuntanamjagung", name: "1 bungkus Bihun Tanam Jagung", defaultPrice: 6000, category: "Mi & Bihun" },
  { id: "p-bihunsuperior", name: "1 bungkus Bihun Superior", defaultPrice: 7000, category: "Mi & Bihun" },
  { id: "p-kerupukabang", name: "1 ball Kerupuk Abang", defaultPrice: 65000, category: "Mi & Bihun" },

  // Kopi & Teh
  { id: "p-goodday-dus", name: "1 dus Good Day", defaultPrice: 140000, category: "Kopi & Teh" },
  { id: "p-kapalapi-mix-dus", name: "1 dus Kopi Kapal Api Mix", defaultPrice: 155000, category: "Kopi & Teh" },
  { id: "p-kapalapi30gr-dus", name: "1 dus Kopi Kapal Api 30gr", defaultPrice: 120000, category: "Kopi & Teh" },
  { id: "p-kapalapi60gr-dus", name: "1 dus Kopi Kapal Api 60gr", defaultPrice: 220000, category: "Kopi & Teh" },
  { id: "p-tehgopek-pak", name: "1 pak Teh Gopek", defaultPrice: 28000, category: "Kopi & Teh" },
  { id: "p-teh-dus", name: "1 dus Teh", defaultPrice: 90000, category: "Kopi & Teh" },
  { id: "p-tehgopek-ball", name: "1 ball Teh Gopek", defaultPrice: 85000, category: "Kopi & Teh" },
  { id: "p-goodday-merah", name: "1 renteng Good Day Merah", defaultPrice: 12500, category: "Kopi & Teh" },
  { id: "p-goodday-coklat", name: "1 renteng Good Day Coklat", defaultPrice: 12500, category: "Kopi & Teh" },
  { id: "p-goodday-vanila", name: "1 renteng Good Day Vanila", defaultPrice: 12500, category: "Kopi & Teh" },
  { id: "p-goodday-cappuccino", name: "1 renteng Good Day Cappuccino", defaultPrice: 18500, category: "Kopi & Teh" },
  { id: "p-topgulaaren", name: "1 renteng Top Gula Aren", defaultPrice: 11000, category: "Kopi & Teh" },
  { id: "p-luwakwk", name: "1 renteng Luwak White Koffie", defaultPrice: 13500, category: "Kopi & Teh" },
  { id: "p-topsusu", name: "1 renteng Top Susu", defaultPrice: 11000, category: "Kopi & Teh" },
  { id: "p-topplus", name: "1 renteng Top Plus", defaultPrice: 11000, category: "Kopi & Teh" },
  { id: "p-abcsusu-renteng", name: "1 renteng ABC Susu", defaultPrice: 12500, category: "Kopi & Teh" },
  { id: "p-abcplus", name: "1 renteng ABC Plus", defaultPrice: 11000, category: "Kopi & Teh" },
  { id: "p-kapalapi-mix-renteng", name: "1 renteng Kapal Api Mix", defaultPrice: 13500, category: "Kopi & Teh" },
  { id: "p-kapalapi30gr-renteng", name: "1 renteng Kapal Api 30gr", defaultPrice: 10500, category: "Kopi & Teh" },
  { id: "p-kapalapi60gr-renteng", name: "1 renteng Kapal Api 60gr", defaultPrice: 19500, category: "Kopi & Teh" },
  { id: "p-kapalapi120gr", name: "1 biji Kapal Api 120gr (+Gelas)", defaultPrice: 15000, category: "Kopi & Teh" },
  { id: "p-topwhite", name: "1 renteng Top White", defaultPrice: 11000, category: "Kopi & Teh" },
  { id: "p-pikopisusu", name: "1 renteng Pikopi Susu", defaultPrice: 10500, category: "Kopi & Teh" },
  { id: "p-pikopimix", name: "1 renteng Pikopi Mix", defaultPrice: 10500, category: "Kopi & Teh" },
  { id: "p-tehsariwangi-renteng", name: "1 renteng Teh Sariwangi", defaultPrice: 8500, category: "Kopi & Teh" },
  { id: "p-tehsariwangi-kotak", name: "1 kotak Teh Sariwangi", defaultPrice: 6500, category: "Kopi & Teh" },

  // Penyedap & Saus
  { id: "p-royco-dus", name: "1 dus Royco", defaultPrice: 115000, category: "Penyedap & Saus" },
  { id: "p-royco-renteng", name: "1 renteng Royco", defaultPrice: 5000, category: "Penyedap & Saus" },
  { id: "p-masako-dus", name: "1 dus Masako", defaultPrice: 115000, category: "Penyedap & Saus" },
  { id: "p-masako-renteng", name: "1 renteng Masako", defaultPrice: 5000, category: "Penyedap & Saus" },
  { id: "p-sedaapkaldu-dus", name: "1 dus Sedaap Kaldu", defaultPrice: 105000, category: "Penyedap & Saus" },
  { id: "p-sedaapkaldu-renteng", name: "1 renteng Sedaap Kaldu", defaultPrice: 4500, category: "Penyedap & Saus" },
  { id: "p-sasa-dus", name: "1 dus Sasa", defaultPrice: 105000, category: "Penyedap & Saus" },
  { id: "p-sasa-pcs", name: "1 pcs Sasa", defaultPrice: 4500, category: "Penyedap & Saus" },
  { id: "p-bango-dus", name: "1 dus Bango", defaultPrice: 115000, category: "Penyedap & Saus" },
  { id: "p-bango-renteng", name: "1 renteng Bango", defaultPrice: 10500, category: "Penyedap & Saus" },
  { id: "p-kecapabc-dus", name: "1 dus Kecap ABC", defaultPrice: 110000, category: "Penyedap & Saus" },
  { id: "p-kecapabc-renteng", name: "1 renteng Kecap ABC", defaultPrice: 10000, category: "Penyedap & Saus" },
  { id: "p-saosswan", name: "1 botol Saos Swan", defaultPrice: 12000, category: "Penyedap & Saus" },
  { id: "p-saosnikisari", name: "1 botol Saos Nikisari", defaultPrice: 13500, category: "Penyedap & Saus" },
  { id: "p-sambaldb-krat", name: "1 krat Sambal Dua Belibis Kaca", defaultPrice: 190000, category: "Penyedap & Saus" },
  { id: "p-sasa500-dus", name: "1 dus Sasa 500", defaultPrice: 95000, category: "Penyedap & Saus" },
  { id: "p-sasa500-pak", name: "1 pak Sasa 500", defaultPrice: 9500, category: "Penyedap & Saus" },
  { id: "p-sasa1000-dus", name: "1 dus Sasa 1000", defaultPrice: 95000, category: "Penyedap & Saus" },
  { id: "p-sasa1000-pak", name: "1 pak Sasa 1000", defaultPrice: 9500, category: "Penyedap & Saus" },
  { id: "p-sasa1per4", name: "1 bungkus Sasa 1/4", defaultPrice: 13000, category: "Penyedap & Saus" },
  { id: "p-bango3000", name: "1 bungkus Bango 3000", defaultPrice: 2500, category: "Penyedap & Saus" },
  { id: "p-bango10000", name: "1 bungkus Bango 10000", defaultPrice: 8500, category: "Penyedap & Saus" },

  // Sabun & Rumah Tangga
  { id: "p-sunlight-dus", name: "1 dus Sunlight", defaultPrice: 140000, category: "Sabun & Rumah Tangga" },
  { id: "p-sunlight-bungkus", name: "1 bungkus Sunlight", defaultPrice: 4500, category: "Sabun & Rumah Tangga" },
  { id: "p-ekonomidolet-dus", name: "1 dus Ekonomi Dolet", defaultPrice: 95000, category: "Sabun & Rumah Tangga" },
  { id: "p-soklin-dus", name: "1 dus So Klin", defaultPrice: 115000, category: "Sabun & Rumah Tangga" },
  { id: "p-daia-dus", name: "1 dus Daia", defaultPrice: 115000, category: "Sabun & Rumah Tangga" },
  { id: "p-molto-dus", name: "1 dus Molto", defaultPrice: 110000, category: "Sabun & Rumah Tangga" },
  { id: "p-downy-dus", name: "1 dus Downy", defaultPrice: 125000, category: "Sabun & Rumah Tangga" },
  { id: "p-rinsocair-dus", name: "1 dus Rinso Cair", defaultPrice: 145000, category: "Sabun & Rumah Tangga" },
  { id: "p-rinsobubuk-dus", name: "1 dus Rinso Bubuk", defaultPrice: 160000, category: "Sabun & Rumah Tangga" },
  { id: "p-sampozinc-dus", name: "1 dus Sampo Zinc", defaultPrice: 125000, category: "Sabun & Rumah Tangga" },
  { id: "p-sampolifebuoy-dus", name: "1 dus Sampo Lifebuoy", defaultPrice: 125000, category: "Sabun & Rumah Tangga" },
  { id: "p-sampoinsilk-dus", name: "1 dus Sampo Sunsilk", defaultPrice: 125000, category: "Sabun & Rumah Tangga" },
  { id: "p-sampopantene-dus", name: "1 dus Sampo Pantene", defaultPrice: 145000, category: "Sabun & Rumah Tangga" },
  { id: "p-sabungiv-dus", name: "1 dus Sabun Giv", defaultPrice: 135000, category: "Sabun & Rumah Tangga" },
  { id: "p-sabunlifebuoy-dus", name: "1 dus Sabun Lifebuoy", defaultPrice: 155000, category: "Sabun & Rumah Tangga" },
  { id: "p-sabunnuvo-dus", name: "1 dus Sabun Nuvo", defaultPrice: 135000, category: "Sabun & Rumah Tangga" },
  { id: "p-sunlight2000", name: "1 bungkus Sunlight 2000", defaultPrice: 1800, category: "Sabun & Rumah Tangga" },
  { id: "p-sunlightgede", name: "1 bungkus Sunlight Gede", defaultPrice: 14000, category: "Sabun & Rumah Tangga" },
  { id: "p-ekonomidolet-ecer", name: "1 bungkus Ekonomi Dolet (Ecer)", defaultPrice: 2500, category: "Sabun & Rumah Tangga" },
  { id: "p-ekonomisunlight", name: "1 bungkus Ekonomi Sunlight", defaultPrice: 4500, category: "Sabun & Rumah Tangga" },

  // Makanan Ringan
  { id: "p-romakelapa-pak", name: "1 pak Roma Kelapa", defaultPrice: 57000, category: "Makanan Ringan" },
  { id: "p-romakelapa-dus", name: "1 dus Roma Kelapa", defaultPrice: 115000, category: "Makanan Ringan" },
];

// ============================================
// SEED
// ============================================
async function main() {
  const existingProductCount = await prisma.product.count();
  if (existingProductCount > 0) {
    console.log("Database sudah berisi data. Skip seeding.");
    return;
  }

  // Seed products
  for (const p of products) {
    await prisma.product.create({ data: p });
  }
  console.log(`${products.length} produk ditambahkan.`);

  // Seed user
  const user = await prisma.user.findUnique({ where: { id: "user-default" } });
  if (!user) {
    const hashedPin = await bcrypt.hash("123456", 10);
    await prisma.user.create({
      data: { id: "user-default", pin: hashedPin, name: "Ibu" },
    });
    console.log("User default dibuat (PIN: 123456).");
  }

  // Seed customers
  const c1 = await prisma.customer.findUnique({ where: { id: "c-ito" } });
  if (!c1) {
    await prisma.customer.create({ data: { id: "c-ito", name: "Bu Ito" } });
  }
  const c2 = await prisma.customer.findUnique({ where: { id: "c-mus" } });
  if (!c2) {
    await prisma.customer.create({ data: { id: "c-mus", name: "Bu Mus" } });
  }
  console.log("Customer default siap.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
