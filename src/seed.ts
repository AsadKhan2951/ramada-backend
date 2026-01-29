import dotenv from "dotenv";
import { connectDB, disconnectDB } from "./db/connection.js";
import { hashPassword } from "./auth/jwt.js";
import {
  StaffMember,
  BanquetHall,
  FoodMenu,
  AdditionalService,
} from "./db/models.js";

dotenv.config();

async function seed() {
  try {
    console.log("[Seed] Connecting to database...");
    await connectDB();
    
    // Clear existing data
    console.log("[Seed] Clearing existing data...");
    await StaffMember.deleteMany({});
    await BanquetHall.deleteMany({});
    await FoodMenu.deleteMany({});
    await AdditionalService.deleteMany({});
    
    // Hash the default password
    const hashedPassword = await hashPassword("123");
    
    // Create staff members
    console.log("[Seed] Creating staff members...");
    const staffMembers = [
      {
        name: "Nazim Zaidi",
        email: "nazim.zaidi@ramadaplaza.com",
        password: hashedPassword,
        jobTitle: "Director F&B",
        department: "food" as const,
        accessLevel: "full" as const,
      },
      {
        name: "Areez Masood",
        email: "areez.masood@ramadaplaza.com",
        password: hashedPassword,
        jobTitle: "Asst. Sales & Operations Manager",
        department: "sales" as const,
        accessLevel: "full" as const,
      },
      {
        name: "Asim Farrukh",
        email: "asim.farrukh@ramadaplaza.com",
        password: hashedPassword,
        jobTitle: "Asst. Sales Manager",
        department: "sales" as const,
        accessLevel: "full" as const,
      },
      {
        name: "Ashi Moin",
        email: "ashi.moin@ramadaplaza.com",
        password: hashedPassword,
        jobTitle: "Banquet Sales Executive",
        department: "sales" as const,
        accessLevel: "limited" as const,
      },
      {
        name: "Sonia Saeed",
        email: "sonia.saeed@ramadaplaza.com",
        password: hashedPassword,
        jobTitle: "Banquet Sales Executive",
        department: "sales" as const,
        accessLevel: "limited" as const,
      },
    ];
    
    await StaffMember.insertMany(staffMembers);
    console.log(`[Seed] Created ${staffMembers.length} staff members`);
    
    // Create banquet halls
    console.log("[Seed] Creating banquet halls...");
    const banquetHalls = [
      { name: "Marquee", capacity: 2000, baseRate: "500000", facilities: JSON.stringify(["Stage", "Sound System", "AC", "Parking"]) },
      { name: "Eiffel 1", capacity: 1000, baseRate: "300000", facilities: JSON.stringify(["Stage", "Sound System", "AC"]) },
      { name: "Eiffel 2", capacity: 1000, baseRate: "300000", facilities: JSON.stringify(["Stage", "Sound System", "AC"]) },
      { name: "Dilshad Hall", capacity: 300, baseRate: "150000", facilities: JSON.stringify(["Sound System", "AC"]) },
      { name: "Noor Hall", capacity: 300, baseRate: "150000", facilities: JSON.stringify(["Sound System", "AC"]) },
      { name: "Qasr-e-Gul", capacity: 200, baseRate: "100000", facilities: JSON.stringify(["Sound System", "AC"]) },
      { name: "Qasr-e-Noor", capacity: 200, baseRate: "100000", facilities: JSON.stringify(["Sound System", "AC"]) },
      { name: "Lawn", capacity: 1500, baseRate: "400000", facilities: JSON.stringify(["Open Air", "Lighting", "Parking"]) },
      { name: "Pool Side", capacity: 500, baseRate: "200000", facilities: JSON.stringify(["Pool View", "Lighting"]) },
      { name: "Rooftop", capacity: 400, baseRate: "180000", facilities: JSON.stringify(["City View", "Lighting", "AC"]) },
    ];
    
    await BanquetHall.insertMany(banquetHalls);
    console.log(`[Seed] Created ${banquetHalls.length} banquet halls`);
    
    // Create food menus
    console.log("[Seed] Creating food menus...");
    const foodMenus = [
      {
        name: "Silver Package",
        description: "Basic menu package for budget-conscious events",
        pricePerPerson: "2500",
        menuItems: JSON.stringify([
          "Welcome Drink",
          "2 Starters",
          "Main Course (3 items)",
          "Rice",
          "Naan",
          "Dessert",
          "Tea/Coffee"
        ]),
      },
      {
        name: "Gold Package",
        description: "Premium menu package for standard events",
        pricePerPerson: "3500",
        menuItems: JSON.stringify([
          "Welcome Drink",
          "3 Starters",
          "Soup",
          "Main Course (5 items)",
          "Rice (2 varieties)",
          "Naan",
          "2 Desserts",
          "Tea/Coffee",
          "Soft Drinks"
        ]),
      },
      {
        name: "Platinum Package",
        description: "Luxury menu package for premium events",
        pricePerPerson: "5000",
        menuItems: JSON.stringify([
          "Welcome Drink",
          "Live Cooking Station",
          "4 Starters",
          "Soup",
          "Salad Bar",
          "Main Course (7 items)",
          "Rice (3 varieties)",
          "Naan & Breads",
          "3 Desserts",
          "Ice Cream Station",
          "Tea/Coffee",
          "Soft Drinks & Juices"
        ]),
      },
    ];
    
    await FoodMenu.insertMany(foodMenus);
    console.log(`[Seed] Created ${foodMenus.length} food menus`);
    
    // Create additional services
    console.log("[Seed] Creating additional services...");
    const additionalServices = [
      { name: "DJ Sound System", description: "Professional DJ with sound equipment", price: "50000", category: "sound" as const },
      { name: "Live Band", description: "5-piece live band performance", price: "150000", category: "sound" as const },
      { name: "Smoke Machine", description: "Stage smoke effects", price: "15000", category: "effects" as const },
      { name: "Cold Pyro", description: "Indoor fireworks display", price: "25000", category: "effects" as const },
      { name: "LED Dance Floor", description: "Illuminated dance floor", price: "40000", category: "effects" as const },
      { name: "Flower Decoration", description: "Fresh flower arrangements", price: "75000", category: "decoration" as const },
      { name: "Stage Decoration", description: "Premium stage setup", price: "100000", category: "decoration" as const },
      { name: "Photography", description: "Professional photography coverage", price: "80000", category: "other" as const },
      { name: "Videography", description: "Professional video coverage", price: "120000", category: "other" as const },
      { name: "Valet Parking", description: "Valet parking service", price: "30000", category: "other" as const },
    ];
    
    await AdditionalService.insertMany(additionalServices);
    console.log(`[Seed] Created ${additionalServices.length} additional services`);
    
    console.log("[Seed] Database seeding completed successfully!");
    
  } catch (error) {
    console.error("[Seed] Error:", error);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

seed();
