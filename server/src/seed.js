import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Auction from './models/Auction.js';
import Bid from './models/Bid.js';
import { connectDB } from './config/db.js';

const seedData = async () => {
  await connectDB();

  // Create demo student sellers
  const students = [
    {
      name: 'Rohan Sharma',
      email: 'rohan.sharma@campus.edu',
      password: 'password123',
      campus: 'North Campus Hostel 4',
      studentId: 'STU-1021',
      phone: '+91 98765 43210',
      bio: 'Final year Mechanical. Moving out of dorm, clearing gear.',
      isVerified: true
    },
    {
      name: 'Priya Patel',
      email: 'priya.patel@campus.edu',
      password: 'password123',
      campus: 'South Campus Block B',
      studentId: 'STU-1022',
      phone: '+91 98765 43211',
      bio: 'Pre-med student. Textbook enthusiast.',
      isVerified: true
    },
    {
      name: 'Ananya Verma',
      email: 'ananya.verma@campus.edu',
      password: 'password123',
      campus: 'East Campus Hall',
      studentId: 'STU-1023',
      phone: '+91 98765 43212',
      bio: 'CS sophomore selling spare tech and monitors.',
      isVerified: true
    }
  ];

  const createdUsers = [];
  for (const s of students) {
    let u = await User.findOne({ email: s.email });
    if (!u) {
      u = await User.create(s);
    }
    createdUsers.push(u);
  }

  // Clear existing seed auctions to keep data fresh and clean
  await Auction.deleteMany({});
  await Bid.deleteMany({});

  const now = Date.now();

  const sampleAuctions = [
    {
      sellerId: createdUsers[0]._id,
      title: 'Hero Sprint 21-Speed Mountain Cycle with Helmet & Lock',
      category: 'cycle',
      description: 'Used for two semesters for cross-campus commuting between North Hostel and Academic Block. Front suspension in great condition, newly tuned dual disc brakes, includes heavy duty numeric combination lock and Decathlon helmet.',
      condition: 'good',
      photos: [
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80'
      ],
      startingPrice: 2200,
      minimumIncrement: 100,
      currentPrice: 2200,
      closesAt: new Date(now + 2 * 60 * 60 * 1000), // Closes in 2 hours (Closing soon)
      originalClosesAt: new Date(now + 2 * 60 * 60 * 1000),
      status: 'live'
    },
    {
      sellerId: createdUsers[1]._id,
      title: 'Casio fx-991EX ClassWiz Scientific Calculator',
      category: 'calculator',
      description: 'High-resolution LCD, approved for university engineering & mathematics examinations. Solar + battery dual power. Flawless protective slide-on hard case with formula reference card included.',
      condition: 'like_new',
      photos: [
        'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80'
      ],
      startingPrice: 450,
      minimumIncrement: 30,
      currentPrice: 450,
      closesAt: new Date(now + 45 * 60 * 1000), // Closes in 45 mins (Urgent closing soon)
      originalClosesAt: new Date(now + 45 * 60 * 1000),
      status: 'live'
    },
    {
      sellerId: createdUsers[1]._id,
      title: 'Introduction to Algorithms (CLRS 3rd Edition) + Notes',
      category: 'books',
      description: 'Hardcover edition of Cormen, Leiserson, Rivest, Stein. Unmarked clean pages, no highlighting on core algorithm chapters. Includes spiral-bound exam prep summary sheets.',
      condition: 'good',
      photos: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
      ],
      startingPrice: 600,
      minimumIncrement: 50,
      currentPrice: 600,
      closesAt: new Date(now + 24 * 60 * 60 * 1000), // Closes in 24 hours
      originalClosesAt: new Date(now + 24 * 60 * 60 * 1000),
      status: 'live'
    },
    {
      sellerId: createdUsers[2]._id,
      title: 'Dell 24-inch Full HD IPS Monitor (75Hz, HDMI/VGA)',
      category: 'electronics',
      description: 'Perfect second display for coding, assignments, and laptop dual-screen setups. Ultra-thin bezels, comfort view flicker-free panel. Includes HDMI cable and power adapter. Zero dead pixels.',
      condition: 'like_new',
      photos: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
      ],
      startingPrice: 3800,
      minimumIncrement: 150,
      currentPrice: 3800,
      closesAt: new Date(now + 3 * 24 * 60 * 60 * 1000), // Closes in 3 days
      originalClosesAt: new Date(now + 3 * 24 * 60 * 60 * 1000),
      status: 'live'
    },
    {
      sellerId: createdUsers[0]._id,
      title: 'Ergonomic Mesh Study Chair with Adjustable Lumbar Support',
      category: 'furniture',
      description: 'Breathable mesh back, hydraulic height lift, nylon castors. Very comfortable for long study sessions. Fits standard campus hostel desks.',
      condition: 'good',
      photos: [
        'https://images.unsplash.com/photo-1580481077195-c3a821a5060f?auto=format&fit=crop&w=800&q=80'
      ],
      startingPrice: 1200,
      minimumIncrement: 50,
      currentPrice: 1200,
      closesAt: new Date(now + 12 * 60 * 60 * 1000), // Closes in 12 hours
      originalClosesAt: new Date(now + 12 * 60 * 60 * 1000),
      status: 'live'
    },
    {
      sellerId: createdUsers[2]._id,
      title: 'Sony WH-CH520 Wireless Bluetooth Headphones (50hr Battery)',
      category: 'electronics',
      description: 'Matte black finish, DSEE sound enhancement, multi-point connection (connects to phone and laptop simultaneously). Clean earcups, USB-C fast charging cable included.',
      condition: 'like_new',
      photos: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
      ],
      startingPrice: 1400,
      minimumIncrement: 100,
      currentPrice: 1400,
      closesAt: new Date(now + 48 * 60 * 60 * 1000),
      originalClosesAt: new Date(now + 48 * 60 * 60 * 1000),
      status: 'live'
    }
  ];

  for (const item of sampleAuctions) {
    await Auction.create(item);
  }

  console.log(`[Seed Success] Populated ${sampleAuctions.length} real campus auction listings.`);
  process.exit(0);
};

seedData().catch((err) => {
  console.error('[Seed Failed]', err);
  process.exit(1);
});
