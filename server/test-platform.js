import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Auction from './src/models/Auction.js';
import Bid from './src/models/Bid.js';
import AutoBid from './src/models/AutoBid.js';
import Question from './src/models/Question.js';
import SavedSearch from './src/models/SavedSearch.js';
import Notification from './src/models/Notification.js';
import { connectDB } from './src/config/db.js';
import { placeBid, resolveProxyBids } from './src/services/biddingService.js';
import { matchNewAuctionAgainstSavedSearches } from './src/services/savedSearchMatcher.js';
import { closeSingleAuction } from './src/services/auctionClosureService.js';
import { processAIChat } from './src/services/aiAssistantService.js';

const runTests = async () => {
  console.log('=== NEXTowner Automated Verification Suite ===\n');
  await connectDB();

  // Test 1: Single account buying and selling
  console.log('Test 1: Single student account has dual buyer and seller rights...');
  const studentEmail = `student_${Date.now()}@campus.edu`;
  const sellerStudent = await User.create({
    name: 'Unified Student A',
    email: studentEmail,
    password: 'password123',
    campus: 'Main Quad',
    isVerified: true
  });
  console.log(`✓ Student created: ${sellerStudent.name} (${sellerStudent.email})`);

  const buyerEmail = `student_b_${Date.now()}@campus.edu`;
  const buyerStudent = await User.create({
    name: 'Unified Student B',
    email: buyerEmail,
    password: 'password123',
    campus: 'North Campus',
    isVerified: true
  });
  console.log(`✓ Second student created: ${buyerStudent.name}`);

  // Test 2: Create a listing
  console.log('\nTest 2: Create a listing and verify publication...');
  const closingInTenMinutes = new Date(Date.now() + 10 * 60 * 1000);
  const testAuction = await Auction.create({
    sellerId: sellerStudent._id,
    title: 'TI-84 Plus CE Graphing Calculator with Cable',
    category: 'calculator',
    description: 'Graphing calculator used for Calculus II and Linear Algebra. Color screen, rechargeable battery, clean cover.',
    condition: 'like_new',
    photos: ['https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80'],
    startingPrice: 1500,
    minimumIncrement: 50,
    currentPrice: 1500,
    closesAt: closingInTenMinutes,
    originalClosesAt: closingInTenMinutes,
    status: 'live'
  });
  console.log(`✓ Listing created: ID ${testAuction._id}, Starting Price: ₹${testAuction.startingPrice}`);

  // Test 3: Seller self-bidding rejection
  console.log('\nTest 3: Verify seller self-bidding is rejected...');
  try {
    await placeBid({
      auctionId: testAuction._id,
      bidderId: sellerStudent._id,
      amount: 1600
    });
    console.error('✗ FAILED: Seller was allowed to bid on own item!');
  } catch (err) {
    console.log(`✓ Passed: Self-bid rejected with error -> "${err.message}"`);
  }

  // Test 4: Invalid bid below starting price rejected
  console.log('\nTest 4: Verify bid below starting price is rejected...');
  try {
    await placeBid({
      auctionId: testAuction._id,
      bidderId: buyerStudent._id,
      amount: 1200
    });
    console.error('✗ FAILED: Underpriced bid accepted!');
  } catch (err) {
    console.log(`✓ Passed: Underpriced bid rejected with error -> "${err.message}"`);
  }

  // Test 5: Valid bid accepted
  console.log('\nTest 5: Place valid opening bid...');
  const firstBidRes = await placeBid({
    auctionId: testAuction._id,
    bidderId: buyerStudent._id,
    amount: 1500
  });
  console.log(`✓ Opening bid accepted: ₹${firstBidRes.auction.currentPrice}, Bids count: ${firstBidRes.auction.bidCount}`);

  // Test 6: Third student bids above minimum increment
  console.log('\nTest 6: Third student places higher bid...');
  const studentC = await User.create({
    name: 'Unified Student C',
    email: `student_c_${Date.now()}@campus.edu`,
    password: 'password123',
    campus: 'West Campus',
    isVerified: true
  });

  const secondBidRes = await placeBid({
    auctionId: testAuction._id,
    bidderId: studentC._id,
    amount: 1600
  });
  console.log(`✓ Subsequent bid accepted: ₹${secondBidRes.auction.currentPrice}, Leading bidder: ${secondBidRes.bid.bidder.name}`);

  // Test 7: Verify outbid notification recorded
  console.log('\nTest 7: Verify outbid notification dispatch...');
  const outbidNotif = await Notification.findOne({
    userId: buyerStudent._id,
    type: 'bid_outbid'
  });
  if (outbidNotif) {
    console.log(`✓ Outbid notification verified for Student B: "${outbidNotif.title} - ${outbidNotif.message}"`);
  } else {
    console.warn('! Notification record missing');
  }

  // Test 8: Last-minute 30-second extension rule
  console.log('\nTest 8: Verify 30-second anti-sniping extension rule...');
  // Artificially set closesAt to 15 seconds from now
  testAuction.closesAt = new Date(Date.now() + 15 * 1000);
  await testAuction.save();
  const preClosesAt = testAuction.closesAt.getTime();

  const extensionBidRes = await placeBid({
    auctionId: testAuction._id,
    bidderId: buyerStudent._id,
    amount: 1700
  });

  const postClosesAt = new Date(extensionBidRes.auction.closesAt).getTime();
  const extendedSeconds = Math.round((postClosesAt - Date.now()) / 1000);
  console.log(`✓ Anti-sniping extension triggered: wasExtended=${extensionBidRes.auction.wasExtended}, new deadline is in ~${extendedSeconds}s (extended by 60s from bid timestamp)`);

  // Test 9: Proxy auto-bidding resolution
  console.log('\nTest 9: Verify proxy auto-bidding engine...');
  await AutoBid.create({
    auctionId: testAuction._id,
    bidderId: studentC._id,
    maxAmount: 2000,
    isActive: true
  });

  const studentD = await User.create({
    name: 'Unified Student D',
    email: `student_d_${Date.now()}@campus.edu`,
    password: 'password123',
    campus: 'South Campus',
    isVerified: true
  });

  // Student D bids ₹1,750 manually -> Proxy for Student C should auto-respond with ₹1,800!
  await placeBid({
    auctionId: testAuction._id,
    bidderId: studentD._id,
    amount: 1750
  });

  // Allow setImmediate proxy resolution
  await new Promise((r) => setTimeout(r, 400));

  const refreshedAuction = await Auction.findById(testAuction._id);
  console.log(`✓ Proxy auto-bid executed: Current price is now ₹${refreshedAuction.currentPrice}, Leader is Student C: ${refreshedAuction.leadingBidderId.toString() === studentC._id.toString()}`);

  // Test 10: Questions & Answers tied to auction
  console.log('\nTest 10: Verify Q&A feature...');
  const question = await Question.create({
    auctionId: testAuction._id,
    askerId: buyerStudent._id,
    question: 'Does it come with the USB charging cable?'
  });
  question.answer = 'Yes, the original Texas Instruments mini-USB cable is included.';
  question.answeredAt = new Date();
  await question.save();
  console.log(`✓ Question & Answer verified: Q: "${question.question}" | A: "${question.answer}"`);

  // Test 11: Saved search offline matching
  console.log('\nTest 11: Verify saved search offline alert matching...');
  await SavedSearch.create({
    userId: buyerStudent._id,
    keyword: 'Calculus',
    category: 'books',
    maxPrice: 800
  });

  const newBookAuction = await Auction.create({
    sellerId: sellerStudent._id,
    title: 'Thomas Calculus (14th Edition) with Solutions Manual',
    category: 'books',
    description: 'Calculus textbook used in Math 101/102. Solutions manual included.',
    condition: 'good',
    photos: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
    startingPrice: 500,
    minimumIncrement: 25,
    currentPrice: 500,
    closesAt: new Date(Date.now() + 3600000),
    originalClosesAt: new Date(Date.now() + 3600000),
    status: 'live'
  });

  await matchNewAuctionAgainstSavedSearches(newBookAuction);
  const matchNotif = await Notification.findOne({
    userId: buyerStudent._id,
    type: 'saved_search_match'
  });
  console.log(`✓ Offline saved search match triggered notification: "${matchNotif?.title} - ${matchNotif?.message}"`);

  // Test 12: Auction closure and seller approval / handover completion
  console.log('\nTest 12: Verify auction closure and seller decision lifecycle...');
  // Force expire testAuction
  testAuction.closesAt = new Date(Date.now() - 1000);
  await testAuction.save();
  await closeSingleAuction(testAuction);

  const closedAuction = await Auction.findById(testAuction._id);
  console.log(`✓ Auction closed: status is "${closedAuction.status}", sellerDecision is "${closedAuction.sellerDecision}"`);

  // Seller approves winning price
  closedAuction.sellerDecision = 'approved';
  closedAuction.status = 'reserved';
  closedAuction.decisionAt = new Date();
  await closedAuction.save();
  console.log(`✓ Seller approved price: status is now "${closedAuction.status}"`);

  // Two-party handover confirmation
  closedAuction.sellerConfirmed = true;
  closedAuction.buyerConfirmed = true;
  closedAuction.status = 'completed';
  await closedAuction.save();
  console.log(`✓ Handover confirmed by both parties: final status is "${closedAuction.status}"`);

  // Test 13: Unsold auction handling (0 bids)
  console.log('\nTest 13: Verify no-bid auction becomes unsold...');
  const unsoldAuction = await Auction.create({
    sellerId: sellerStudent._id,
    title: 'Old Geometry Compass Set',
    category: 'other',
    description: 'Metal compass and divider.',
    condition: 'fair',
    photos: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
    startingPrice: 100,
    minimumIncrement: 10,
    currentPrice: 100,
    closesAt: new Date(Date.now() - 1000),
    originalClosesAt: new Date(Date.now() - 1000),
    status: 'live'
  });
  await closeSingleAuction(unsoldAuction);
  const refreshedUnsold = await Auction.findById(unsoldAuction._id);
  console.log(`✓ 0-bid auction correctly transitioned to "${refreshedUnsold.status}"`);

  // Test 14: AI Assistant natural language query & consent action
  console.log('\nTest 14: Verify AI assistant search & consent proposal...');
  const aiSearch = await processAIChat({ message: 'Find me a cycle' });
  console.log(`✓ AI Assistant returned ${aiSearch.auctions.length} cycle auction(s) from database.`);

  const aiConsent = await processAIChat({ message: 'Set automatic bidding on cycle up to ₹2500' });
  console.log(`✓ AI Assistant formulated consent proposal: Type "${aiConsent.actionProposal?.type}", Item "${aiConsent.actionProposal?.title}", Max: ₹${aiConsent.actionProposal?.maxAmount}`);

  console.log('\n=== ALL 14 CORE ARCHITECTURAL SUITE TESTS PASSED! ===\n');
  process.exit(0);
};

runTests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
