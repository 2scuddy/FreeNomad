import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Default password for all test accounts (hashed)
const DEFAULT_PASSWORD = "Password123!";
const SALT_ROUNDS = 12;

// Sample Users Data (password will be added during seeding)
const users = [
  {
    email: "admin@freenomad.com",
    name: "Admin User",
    bio: "Platform administrator and digital nomad enthusiast.",
    location: "Remote",
    website: "https://freenomad.com",
    role: "ADMIN" as const,
    emailVerified: new Date(),
  },
  {
    email: "sarah.nomad@example.com",
    name: "Sarah Johnson",
    bio: "Full-stack developer and digital nomad. Love exploring new cities and cultures while building amazing products.",
    location: "Currently in Lisbon",
    website: "https://sarahjohnson.dev",
    role: "USER" as const,
    emailVerified: new Date(),
  },
  {
    email: "marco.travel@example.com",
    name: "Marco Rodriguez",
    bio: "UX Designer passionate about remote work and sustainable travel. Always looking for the next great coworking space.",
    location: "Nomadic",
    website: "https://marcodesigns.com",
    role: "USER" as const,
    emailVerified: new Date(),
  },
  {
    email: "alex.code@example.com",
    name: "Alex Chen",
    bio: "Software engineer and startup founder. Building the future of remote work one line of code at a time.",
    location: "Bali, Indonesia",
    website: "https://alexchen.tech",
    role: "USER" as const,
    emailVerified: new Date(),
  },
  {
    email: "emma.writer@example.com",
    name: "Emma Thompson",
    bio: "Content writer and blogger documenting the digital nomad lifestyle. Coffee enthusiast and culture explorer.",
    location: "Mexico City",
    website: "https://emmawrites.blog",
    role: "USER" as const,
    emailVerified: new Date(),
  },
  {
    email: "david.startup@example.com",
    name: "David Kim",
    bio: "Entrepreneur and product manager. Building remote-first companies and exploring emerging markets.",
    location: "Medellín, Colombia",
    website: "https://davidkim.co",
    role: "USER" as const,
    emailVerified: new Date(),
  },
  {
    email: "lisa.design@example.com",
    name: "Lisa Anderson",
    bio: "Graphic designer and photographer capturing the beauty of nomad destinations around the world.",
    location: "Tbilisi, Georgia",
    website: "https://lisaanderson.art",
    role: "USER" as const,
    emailVerified: new Date(),
  },
];

// Sample Cities Data (Expanded)
const cities = [
  {
    name: "Lisbon",
    country: "Portugal",
    region: "Lisbon District",
    latitude: 38.7223,
    longitude: -9.1393,
    population: 547733,
    timezone: "Europe/Lisbon",
    costOfLiving: 1200,
    internetSpeed: 85.5,
    safetyRating: 8.5,
    walkability: 8.0,
    nightlife: 7.5,
    culture: 9.0,
    weather: 8.5,
    description:
      "Lisbon is a vibrant coastal city known for its historic neighborhoods, excellent food scene, and thriving digital nomad community. The city offers a perfect blend of old-world charm and modern amenities.",
    shortDescription:
      "Historic coastal capital with great nomad infrastructure",
    imageUrl: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b",
    imageAttribution: "Photo by Luca Bravo on Unsplash",
    featured: true,
    verified: true,
  },
  {
    name: "Bali",
    country: "Indonesia",
    region: "Bali Province",
    latitude: -8.4095,
    longitude: 115.1889,
    population: 4362000,
    timezone: "Asia/Makassar",
    costOfLiving: 800,
    internetSpeed: 45.2,
    safetyRating: 7.5,
    walkability: 6.0,
    nightlife: 8.5,
    culture: 9.5,
    weather: 9.0,
    description:
      "Bali is a tropical paradise that has become the ultimate destination for digital nomads. With its beautiful beaches, rich culture, affordable living costs, and growing coworking scene.",
    shortDescription: "Tropical paradise with strong nomad community",
    imageUrl: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1",
    imageAttribution: "Photo by Artem Beliaikin on Unsplash",
    featured: true,
    verified: true,
  },
  {
    name: "Mexico City",
    country: "Mexico",
    region: "Mexico City",
    latitude: 19.4326,
    longitude: -99.1332,
    population: 9209944,
    timezone: "America/Mexico_City",
    costOfLiving: 900,
    internetSpeed: 65.8,
    safetyRating: 6.5,
    walkability: 7.5,
    nightlife: 9.0,
    culture: 9.5,
    weather: 7.5,
    description:
      "Mexico City is a massive, vibrant metropolis with incredible food, rich history, and a growing tech scene. The city offers excellent value for money and countless cultural experiences.",
    shortDescription: "Vibrant metropolis with rich culture and great food",
    imageUrl: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a",
    imageAttribution: "Photo by Jezael Melgoza on Unsplash",
    featured: true,
    verified: true,
  },
  {
    name: "Medellín",
    country: "Colombia",
    region: "Antioquia",
    latitude: 6.2442,
    longitude: -75.5812,
    population: 2508452,
    timezone: "America/Bogota",
    costOfLiving: 700,
    internetSpeed: 55.3,
    safetyRating: 7.0,
    walkability: 7.0,
    nightlife: 8.0,
    culture: 8.5,
    weather: 9.5,
    description:
      'Known as the "City of Eternal Spring" for its perfect year-round climate, Medellín has transformed into a modern, innovative city with excellent infrastructure and a welcoming atmosphere.',
    shortDescription: "City of eternal spring with perfect climate",
    imageUrl: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5",
    imageAttribution: "Photo by Willian Justen de Vasconcellos on Unsplash",
    featured: true,
    verified: true,
  },
  {
    name: "Tbilisi",
    country: "Georgia",
    region: "Tbilisi",
    latitude: 41.7151,
    longitude: 44.8271,
    population: 1158717,
    timezone: "Asia/Tbilisi",
    costOfLiving: 600,
    internetSpeed: 78.9,
    safetyRating: 8.0,
    walkability: 8.5,
    nightlife: 7.0,
    culture: 9.0,
    weather: 7.0,
    description:
      "Tbilisi is an emerging nomad destination offering incredible value, fast internet, beautiful architecture, and a unique blend of European and Asian cultures.",
    shortDescription: "Emerging destination with great value and culture",
    imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da",
    imageAttribution: "Photo by Levan Badzgaradze on Unsplash",
    featured: false,
    verified: true,
  },
  {
    name: "Prague",
    country: "Czech Republic",
    region: "Prague",
    latitude: 50.0755,
    longitude: 14.4378,
    population: 1309000,
    timezone: "Europe/Prague",
    costOfLiving: 1000,
    internetSpeed: 72.3,
    safetyRating: 8.8,
    walkability: 9.0,
    nightlife: 8.5,
    culture: 9.5,
    weather: 6.5,
    description:
      "Prague is a fairy-tale city with stunning architecture, rich history, and a growing tech scene. The city offers excellent value for money and a high quality of life.",
    shortDescription: "Fairy-tale city with excellent value and culture",
    imageUrl: "https://images.unsplash.com/photo-1541849546-216549ae216d",
    imageAttribution: "Photo by Rodrigo Kugnharski on Unsplash",
    featured: false,
    verified: true,
  },
  {
    name: "Buenos Aires",
    country: "Argentina",
    region: "Buenos Aires",
    latitude: -34.6118,
    longitude: -58.396,
    population: 2890151,
    timezone: "America/Argentina/Buenos_Aires",
    costOfLiving: 650,
    internetSpeed: 58.7,
    safetyRating: 6.0,
    walkability: 8.0,
    nightlife: 9.5,
    culture: 9.0,
    weather: 7.0,
    description:
      "Buenos Aires is the Paris of South America, known for its European architecture, tango culture, incredible food scene, and vibrant nightlife.",
    shortDescription: "Paris of South America with incredible culture",
    imageUrl: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849",
    imageAttribution: "Photo by Nico Baum on Unsplash",
    featured: false,
    verified: true,
  },
  {
    name: "Chiang Mai",
    country: "Thailand",
    region: "Chiang Mai Province",
    latitude: 18.7883,
    longitude: 98.9853,
    population: 127240,
    timezone: "Asia/Bangkok",
    costOfLiving: 550,
    internetSpeed: 62.1,
    safetyRating: 8.5,
    walkability: 7.5,
    nightlife: 7.0,
    culture: 9.0,
    weather: 8.0,
    description:
      "Chiang Mai is a digital nomad haven in northern Thailand, offering low costs, great food, rich culture, and a strong expat community.",
    shortDescription: "Digital nomad haven with low costs and rich culture",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    imageAttribution: "Photo by Sumit Chinchane on Unsplash",
    featured: false,
    verified: true,
  },
];

// Sample Reviews Data Template
const reviewsData = [
  {
    userEmail: "sarah.nomad@example.com",
    cityName: "Lisbon",
    rating: 5,
    title: "Perfect nomad destination!",
    content:
      "Lisbon exceeded all my expectations. The internet is blazing fast, the coworking spaces are amazing, and the food scene is incredible. The cost of living is reasonable for Western Europe, and the weather is fantastic year-round. Highly recommend for any digital nomad!",
    internetRating: 5,
    costRating: 4,
    safetyRating: 5,
    funRating: 5,
    helpful: 12,
    verified: true,
  },
  {
    userEmail: "alex.code@example.com",
    cityName: "Bali",
    rating: 4,
    title: "Great for long-term stays",
    content:
      "Bali is amazing for digital nomads, especially if you're planning a longer stay. Canggu and Ubud have excellent coworking spaces. The internet can be spotty during rainy season, but overall it's reliable. The community here is incredible - so many like-minded people!",
    internetRating: 3,
    costRating: 5,
    safetyRating: 4,
    funRating: 5,
    helpful: 8,
    verified: true,
  },
  {
    userEmail: "emma.writer@example.com",
    cityName: "Mexico City",
    rating: 5,
    title: "Cultural paradise with great value",
    content:
      "CDMX is absolutely incredible! The food scene is unmatched, the culture is rich and vibrant, and the cost of living is very reasonable. Roma Norte and Condesa are perfect for nomads. Just be aware of the altitude adjustment period.",
    internetRating: 4,
    costRating: 5,
    safetyRating: 3,
    funRating: 5,
    helpful: 15,
    verified: true,
  },
  {
    userEmail: "david.startup@example.com",
    cityName: "Medellín",
    rating: 5,
    title: "City of eternal spring lives up to its name",
    content:
      "Medellín has the perfect climate, friendly people, and a growing tech scene. El Poblado is great for nomads with plenty of coworking spaces and cafes. The transformation of this city is remarkable, and it feels very safe in the main areas.",
    internetRating: 4,
    costRating: 5,
    safetyRating: 4,
    funRating: 4,
    helpful: 9,
    verified: true,
  },
  {
    userEmail: "lisa.design@example.com",
    cityName: "Tbilisi",
    rating: 4,
    title: "Hidden gem with incredible value",
    content:
      "Tbilisi is such a hidden gem! The internet is surprisingly fast, the cost of living is incredibly low, and the architecture is stunning. The food is amazing and the wine culture is fantastic. Perfect for nomads looking for something different.",
    internetRating: 5,
    costRating: 5,
    safetyRating: 4,
    funRating: 4,
    helpful: 6,
    verified: true,
  },
  {
    userEmail: "marco.travel@example.com",
    cityName: "Prague",
    rating: 4,
    title: "Beautiful city with great infrastructure",
    content:
      "Prague is like living in a fairy tale. The architecture is breathtaking, the beer is cheap and amazing, and the internet infrastructure is excellent. Winters can be tough, but the city has so much character and history.",
    internetRating: 5,
    costRating: 4,
    safetyRating: 5,
    funRating: 4,
    helpful: 7,
    verified: true,
  },
  {
    userEmail: "sarah.nomad@example.com",
    cityName: "Buenos Aires",
    rating: 4,
    title: "European vibes in South America",
    content:
      "Buenos Aires has incredible European architecture and amazing food culture. The nightlife is legendary and the people are passionate about everything. Internet is decent, and the cost of living is very affordable. Just be prepared for economic volatility.",
    internetRating: 3,
    costRating: 5,
    safetyRating: 3,
    funRating: 5,
    helpful: 11,
    verified: true,
  },
  {
    userEmail: "alex.code@example.com",
    cityName: "Chiang Mai",
    rating: 5,
    title: "Digital nomad paradise",
    content:
      "Chiang Mai is the OG digital nomad destination for a reason. Super affordable, great food, reliable internet, and an amazing community. Nimman area is perfect for nomads. The only downside is the burning season air quality.",
    internetRating: 4,
    costRating: 5,
    safetyRating: 5,
    funRating: 4,
    helpful: 18,
    verified: true,
  },
  {
    userEmail: "emma.writer@example.com",
    cityName: "Lisbon",
    rating: 4,
    title: "Great for European base",
    content:
      "Lisbon is perfect if you want a European base. Great weather, excellent food, and easy access to the rest of Europe. The nomad community is growing rapidly. Only downside is it's getting more expensive as it becomes more popular.",
    internetRating: 5,
    costRating: 3,
    safetyRating: 5,
    funRating: 4,
    helpful: 5,
    verified: false,
  },
  {
    userEmail: "david.startup@example.com",
    cityName: "Bali",
    rating: 3,
    title: "Good but overhyped",
    content:
      "Bali is beautiful and the community is great, but it's becoming quite crowded and touristy. Traffic in Canggu is getting bad, and the internet can be unreliable. Still worth visiting, but maybe not for long-term stays anymore.",
    internetRating: 2,
    costRating: 3,
    safetyRating: 4,
    funRating: 4,
    helpful: 3,
    verified: false,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create users first
  console.log("👥 Creating users...");
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
  const createdUsers = [];
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: hashedPassword,
      },
    });
    createdUsers.push(user);
    console.log(`✅ Created user: ${user.name} (${user.email})`);
  }
  
  console.log(`\n🔑 All test accounts use password: "${DEFAULT_PASSWORD}"`);
  console.log(`📧 Admin account: admin@freenomad.com`);
  console.log(`📧 Test accounts: sarah.nomad@example.com, alex.code@example.com, etc.`);

  // Create cities
  console.log("🏙️ Creating cities...");
  const createdCities = [];
  for (const cityData of cities) {
    const city = await prisma.city.upsert({
      where: { name: cityData.name },
      update: {},
      create: cityData,
    });
    createdCities.push(city);
    console.log(`✅ Created city: ${city.name}`);
  }

  // Create reviews with proper relationships
  console.log("⭐ Creating reviews...");
  for (const reviewData of reviewsData) {
    const user = createdUsers.find(u => u.email === reviewData.userEmail);
    const city = createdCities.find(c => c.name === reviewData.cityName);

    if (user && city) {
      try {
        const review = await prisma.review.create({
          data: {
            rating: reviewData.rating,
            title: reviewData.title,
            content: reviewData.content,
            internetRating: reviewData.internetRating,
            costRating: reviewData.costRating,
            safetyRating: reviewData.safetyRating,
            funRating: reviewData.funRating,
            helpful: reviewData.helpful,
            verified: reviewData.verified,
            userId: user.id,
            cityId: city.id,
          },
        });
        console.log(
          `✅ Created review: ${review.title} by ${user.name} for ${city.name}`
        );
      } catch (error) {
        // Skip if review already exists (unique constraint)
        console.log(
          `⚠️ Skipped duplicate review for ${user.name} -> ${city.name}`
        );
      }
    }
  }

  // Display summary statistics
  const userCount = await prisma.user.count();
  const cityCount = await prisma.city.count();
  const reviewCount = await prisma.review.count();
  const featuredCityCount = await prisma.city.count({
    where: { featured: true },
  });
  const verifiedReviewCount = await prisma.review.count({
    where: { verified: true },
  });

  console.log("\n📊 Database seeding summary:");
  console.log(`👥 Users: ${userCount}`);
  console.log(`🏙️ Cities: ${cityCount} (${featuredCityCount} featured)`);
  console.log(`⭐ Reviews: ${reviewCount} (${verifiedReviewCount} verified)`);
  console.log("\n🎉 Seeding completed successfully!");
}

main()
  .catch(e => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
