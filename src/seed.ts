import 'dotenv/config';
import { connectDB } from './db/connection';
import { StaffMember, BanquetHall, FoodMenu, AdditionalService } from './db/models';
import { hashPassword } from './auth/jwt';

async function seed() {
  await connectDB();
  console.log('Connected to MongoDB');

  // Clear existing data
  await StaffMember.deleteMany({});
  await BanquetHall.deleteMany({});
  await FoodMenu.deleteMany({});
  await AdditionalService.deleteMany({});
  console.log('Cleared existing data');

  // Create staff members (password: 123)
  const hashedPassword = await hashPassword('123');
  const staffMembers = [
    {
      name: 'Nazim Zaidi',
      email: 'nazim.zaidi@ramada.com',
      password: hashedPassword,
      jobTitle: 'Director F&B',
      department: 'food',
      accessLevel: 'full',
    },
    {
      name: 'Areez Masood',
      email: 'areez.masood@ramada.com',
      password: hashedPassword,
      jobTitle: 'Asst. Sales & Ops Manager',
      department: 'sales',
      accessLevel: 'full',
    },
    {
      name: 'Asim Farrukh',
      email: 'asim.farrukh@ramada.com',
      password: hashedPassword,
      jobTitle: 'Asst. Sales Manager',
      department: 'sales',
      accessLevel: 'full',
    },
    {
      name: 'Ashi Moin',
      email: 'ashi.moin@ramada.com',
      password: hashedPassword,
      jobTitle: 'Banquet Sales Executive',
      department: 'sales',
      accessLevel: 'limited',
    },
    {
      name: 'Sonia Saeed',
      email: 'sonia.saeed@ramada.com',
      password: hashedPassword,
      jobTitle: 'Banquet Sales Executive',
      department: 'sales',
      accessLevel: 'limited',
    },
  ];

  await StaffMember.insertMany(staffMembers);
  console.log('Created staff members');

  // Create banquet halls
  const halls = [
    { name: 'Grand Ballroom', capacity: 500, baseRate: 250000, facilities: JSON.stringify(['Stage', 'Sound System', 'Projector', 'AC']) },
    { name: 'Crystal Hall', capacity: 300, baseRate: 180000, facilities: JSON.stringify(['Stage', 'Sound System', 'AC']) },
    { name: 'Pearl Room', capacity: 150, baseRate: 100000, facilities: JSON.stringify(['Sound System', 'AC']) },
    { name: 'Sapphire Suite', capacity: 80, baseRate: 60000, facilities: JSON.stringify(['AC', 'Private Entrance']) },
    { name: 'Garden Terrace', capacity: 200, baseRate: 150000, facilities: JSON.stringify(['Outdoor', 'Lighting', 'Stage']) },
  ];

  await BanquetHall.insertMany(halls);
  console.log('Created banquet halls');

  // Create food menus
  const menus = [
    { name: 'Premium Package', description: 'Full course meal with premium items', pricePerPerson: 3500, menuItems: JSON.stringify(['Appetizers', 'Main Course', 'Dessert', 'Beverages']) },
    { name: 'Standard Package', description: 'Standard buffet menu', pricePerPerson: 2500, menuItems: JSON.stringify(['Appetizers', 'Main Course', 'Dessert']) },
    { name: 'Economy Package', description: 'Basic menu options', pricePerPerson: 1800, menuItems: JSON.stringify(['Main Course', 'Dessert']) },
    { name: 'Hi-Tea Package', description: 'Afternoon tea service', pricePerPerson: 1200, menuItems: JSON.stringify(['Sandwiches', 'Pastries', 'Tea/Coffee']) },
  ];

  await FoodMenu.insertMany(menus);
  console.log('Created food menus');

  // Create additional services
  const services = [
    { name: 'DJ Services', description: 'Professional DJ with equipment', price: 50000, category: 'sound' },
    { name: 'Live Band', description: '5-piece live band', price: 80000, category: 'sound' },
    { name: 'Fog Machine', description: 'Stage fog effects', price: 15000, category: 'effects' },
    { name: 'Laser Lights', description: 'Professional laser light show', price: 25000, category: 'effects' },
    { name: 'Floral Decoration', description: 'Premium flower arrangements', price: 40000, category: 'decoration' },
    { name: 'Stage Decoration', description: 'Custom stage setup', price: 60000, category: 'decoration' },
    { name: 'Photography', description: 'Professional photography service', price: 35000, category: 'other' },
    { name: 'Videography', description: 'Professional video coverage', price: 45000, category: 'other' },
  ];

  await AdditionalService.insertMany(services);
  console.log('Created additional services');

  console.log('\\nSeed completed successfully!');
  console.log('\\nStaff login credentials:');
  console.log('Password for all staff: 123');
  staffMembers.forEach(s => console.log(`- ${s.name}: ${s.email}`));

  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
