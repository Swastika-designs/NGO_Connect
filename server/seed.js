/**
 * NGO Connect — Seed Script
 * Run: cd server && node seed.js
 *
 * Admin login: admin@ngoconnect.in / admin123
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');
const NGO      = require('./models/NGO');
const Donation = require('./models/Donation');
const Event    = require('./models/Event');
const VolunteerInterest = require('./models/VolunteerInterest');
const Message  = require('./models/Message');
const VolunteerOpportunity = require('./models/VolunteerOpportunity');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Promise.all([
    User.deleteMany(), NGO.deleteMany(), Donation.deleteMany(),
    Event.deleteMany(), VolunteerInterest.deleteMany(), Message.deleteMany(), VolunteerOpportunity.deleteMany(),
  ]);
  console.log('Cleared existing data');

  const hash = (pw) => bcrypt.hash(pw, 12);

  // ── Users ──────────────────────────────────────────────────────────────────
  const [admin, ngoUser1, ngoUser2, donor1, donor2, vol1, vol2, vol3] = await User.insertMany([
    { name:'Admin Hansa',            email:'admin@ngoconnect.in',  password:await hash('admin123'),  role:'admin' },
    { name:'Green Earth Initiative', email:'ngo1@ngoconnect.in',   password:await hash('ngo12345'),  role:'ngo' },
    { name:'Education For All',      email:'ngo2@ngoconnect.in',   password:await hash('ngo12345'),  role:'ngo' },
    { name:'Priya Sharma',           email:'donor1@ngoconnect.in', password:await hash('donor123'),  role:'donor',     phone:'+91 9123456780', location:'Mumbai, Maharashtra', bio:'Passionate about education and environment.' },
    { name:'Raj Mehta',              email:'donor2@ngoconnect.in', password:await hash('donor123'),  role:'donor',     phone:'+91 9876543200', location:'Delhi',               bio:'Supporting NGOs for 5+ years.' },
    { name:'Ananya Patel',           email:'vol1@ngoconnect.in',   password:await hash('vol12345'),  role:'volunteer', phone:'+91 9001112223', location:'Bengaluru', bio:'Loves teaching and outdoor work.', skills:['Teaching','Physical Labor'], availability:['Weekends'] },
    { name:'Kiran Nair',             email:'vol2@ngoconnect.in',   password:await hash('vol12345'),  role:'volunteer', phone:'+91 9334445556', location:'Kochi',     skills:['Design','Communication'],       availability:['Weekdays','Evenings'] },
    { name:'Deepak Joshi',           email:'vol3@ngoconnect.in',   password:await hash('vol12345'),  role:'volunteer', phone:'+91 9667778889', location:'Pune',      skills:['Technical','Admin'],            availability:['Weekends','Evenings'] },
  ]);
  console.log('Created 8 users');

  // ── NGOs ───────────────────────────────────────────────────────────────────
  const [ngo1, ngo2, ngo3, ngo4, ngo5] = await NGO.insertMany([
    {
      name:'Green Earth Initiative',
      description:'Dedicated to environmental conservation, reforestation, and clean energy advocacy across rural India. We plant native trees, educate communities, and mobilise youth volunteers.',
      mission:'A greener India through community-led conservation.',
      category:'Environment',
      location:{ city:'Bengaluru', state:'Karnataka', country:'India' },
      contact:{ email:'info@greenearth.in', phone:'+91 9876543210', website:'https://greenearth.in' },
      socialMedia:{ instagram:'https://instagram.com/greenearth_in', twitter:'https://twitter.com/greenearth_in' },
      foundedYear:2012, registrationNumber:'KA/NGO/2012/001',
      tags:['environment','reforestation','sustainability','youth'],
      isFeatured:true, isVerified:true, isApproved:true, verificationTier:3,
      totalDonations:250000, donorCount:48, volunteerCount:120, beneficiaryCount:3500,
      createdBy:ngoUser1._id,
      documents:[
        { name:'Registration Certificate', url:'https://example.com/reg.pdf', type:'registration', verified:true, uploadedAt:new Date() },
        { name:'Tax Exemption Certificate', url:'https://example.com/tax.pdf', type:'tax', verified:true, uploadedAt:new Date() },
      ],
    },
    {
      name:'Education For All',
      description:'Bridging the education gap in under-resourced communities by providing free tutoring, digital literacy classes, and school supplies to children across rural Maharashtra.',
      mission:'Quality education for every child regardless of background.',
      category:'Education',
      location:{ city:'Pune', state:'Maharashtra', country:'India' },
      contact:{ email:'contact@educationforall.org', phone:'+91 9123456789', website:'https://educationforall.org' },
      foundedYear:2015, registrationNumber:'MH/NGO/2015/042',
      tags:['education','children','rural','literacy'],
      isFeatured:true, isVerified:true, isApproved:true, verificationTier:2,
      totalDonations:185000, donorCount:36, volunteerCount:85, beneficiaryCount:2100,
      createdBy:ngoUser2._id,
      documents:[
        { name:'Registration Certificate', url:'https://example.com/efa-reg.pdf', type:'registration', verified:true, uploadedAt:new Date() },
      ],
    },
    {
      name:'HealthFirst India',
      description:'Providing free preventive healthcare, mobile medical camps, and telemedicine to remote villages.',
      mission:'Affordable healthcare is a right, not a privilege.',
      category:'Healthcare',
      location:{ city:'Chennai', state:'Tamil Nadu', country:'India' },
      contact:{ email:'health@healthfirst.in', phone:'+91 9988776655' },
      foundedYear:2018, registrationNumber:'TN/NGO/2018/077',
      tags:['healthcare','rural','telemedicine'],
      isFeatured:false, isVerified:true, isApproved:true, verificationTier:1,
      totalDonations:95000, donorCount:22, volunteerCount:60, beneficiaryCount:8000,
      createdBy:admin._id,
    },
    {
      name:'Women Arise Foundation',
      description:'Empowering women through vocational training, micro-financing, legal aid, and support networks.',
      mission:'Every woman empowered is a community transformed.',
      category:'Women Empowerment',
      location:{ city:'Jaipur', state:'Rajasthan', country:'India' },
      contact:{ email:'arise@womenarisengo.org', phone:'+91 9001122334' },
      foundedYear:2010, registrationNumber:'RJ/NGO/2010/019',
      tags:['women','empowerment','vocational'],
      isFeatured:false, isVerified:true, isApproved:true, verificationTier:2,
      totalDonations:312000, donorCount:74, volunteerCount:45, beneficiaryCount:1800,
      createdBy:admin._id,
    },
    {
      name:'City Food Bank',
      description:'Fighting urban hunger by rescuing surplus food from restaurants and distributing it daily.',
      mission:'Zero food waste, zero hunger.',
      category:'Food & Hunger',
      location:{ city:'Mumbai', state:'Maharashtra', country:'India' },
      contact:{ email:'info@cityfoodbank.org', phone:'+91 9234567890' },
      foundedYear:2016, registrationNumber:'MH/NGO/2016/088',
      tags:['food','hunger','urban'],
      isFeatured:false, isVerified:false, isApproved:true, verificationTier:0,
      totalDonations:78000, donorCount:29, volunteerCount:200, beneficiaryCount:15000,
      createdBy:admin._id,
    },
  ]);
  console.log('Created 5 NGOs');

  // ── Donations ──────────────────────────────────────────────────────────────
  await Donation.insertMany([
    { donor:donor1._id, ngo:ngo1._id, amount:5000,  message:'Keep up the amazing work!', isAnonymous:false, paymentMethod:'upi',        status:'completed' },
    { donor:donor1._id, ngo:ngo2._id, amount:2500,  message:'Education is the future.',  isAnonymous:false, paymentMethod:'card',       status:'completed' },
    { donor:donor1._id, ngo:ngo3._id, amount:1000,                                       isAnonymous:false, paymentMethod:'upi',        status:'completed' },
    { donor:donor2._id, ngo:ngo1._id, amount:10000, message:'Proud to support!',         isAnonymous:false, paymentMethod:'netbanking', status:'completed' },
    { donor:donor2._id, ngo:ngo4._id, amount:3000,                                       isAnonymous:true,  paymentMethod:'upi',        status:'completed' },
    { donor:donor2._id, ngo:ngo5._id, amount:500,                                        isAnonymous:false, paymentMethod:'wallet',     status:'completed' },
  ]);
  console.log('Created 6 donations');

  // ── Events ─────────────────────────────────────────────────────────────────
  const tomorrow  = new Date(Date.now() +      86400000);
  const nextWeek  = new Date(Date.now() +  7 * 86400000);
  const nextMonth = new Date(Date.now() + 30 * 86400000);

  const [ev1] = await Event.insertMany([
    {
      title:'Coastal Mangrove Planting Drive',
      description:'Join us for a full-day event to plant native mangrove saplings. We cover transport, tools, lunch, and a certificate.',
      category:'Environment', targetAudience:'All ages', date:nextWeek, time:'07:00',
      locationType:'Physical', address:'Malpe Beach, Udupi, Karnataka',
      volunteersNeeded:50, requiredSkills:['Physical Labor','Communication'],
      status:'published', createdBy:ngo1._id,
      applicants:[vol1._id, vol2._id],
    },
    {
      title:'Digital Literacy Workshop for Rural Kids',
      description:'Teach basic computer skills to school children. Laptops provided; enthusiasm required.',
      category:'Education', targetAudience:'Students, Teachers', date:nextMonth, time:'10:00',
      locationType:'Physical', address:'Village Community Hall, Shirur, Pune',
      volunteersNeeded:20, requiredSkills:['Teaching','Technical','Communication'],
      status:'published', createdBy:ngo2._id,
      applicants:[vol3._id],
    },
    {
      title:'Weekend Mobile Medical Camp',
      description:'Volunteer doctors and nurses needed for a free health check-up camp.',
      category:'Healthcare', targetAudience:'Medical professionals & students', date:tomorrow, time:'09:00',
      locationType:'Physical', address:'Primary Health Centre, Kancheepuram, Tamil Nadu',
      volunteersNeeded:15, requiredSkills:['Medical','Admin'],
      status:'published', createdBy:ngo3._id,
      applicants:[],
    },
  ]);
  console.log('Created 3 events');

  // ── Volunteer Interest ──────────────────────────────────────────────────────
  await VolunteerInterest.create({
    volunteer:vol1._id, ngo:ngo1._id,
    message:'Passionate about environmental conservation and would love to contribute.',
    skills:['Teaching','Physical Labor'], availability:['Weekends'], status:'pending',
  });
  console.log('Created 1 volunteer interest');

  // ── Seed Messages ──────────────────────────────────────────────────────────
  await Message.insertMany([
    { sender:vol1._id, receiver:ngoUser1._id, content:'Hi! I applied to volunteer for the mangrove drive. Can you tell me more about the logistics?', ngoContext:ngo1._id },
    { sender:ngoUser1._id, receiver:vol1._id, content:'Hi Ananya! Thanks for applying. We will send transport details 2 days before. Please bring sturdy shoes!', ngoContext:ngo1._id },
    { sender:donor1._id, receiver:ngoUser1._id, content:'I just made a donation. Keep up the fantastic work with the reforestation!', ngoContext:ngo1._id },
  ]);
  console.log('Created 3 seed messages');

  // ── Volunteer Opportunities ───────────────────────────────────────────────
  await VolunteerOpportunity.insertMany([
    {
      title: 'English Tutors for Rural Children',
      description: 'We need passionate English tutors to teach basic English reading and writing to children aged 8-14 in rural Maharashtra. Sessions are conducted every Saturday morning. No prior teaching experience required — just enthusiasm and patience!',
      category: 'Education',
      commitmentType: 'recurring',
      duration: '3 months',
      hoursPerWeek: 3,
      startDate: new Date(Date.now() + 7 * 86400000),
      locationType: 'Physical',
      location: 'Shirur, Pune, Maharashtra',
      volunteersNeeded: 10,
      requiredSkills: ['Teaching', 'Communication'],
      requirements: 'Must be comfortable teaching children. Basic English proficiency required.',
      benefits: ['Certificate', 'Meals Provided', 'Letter of Recommendation'],
      status: 'open',
      ngo: ngo2._id,
      createdBy: ngoUser2._id,
      applications: [{ volunteer: vol1._id, message: 'I love teaching and have 2 years of tutoring experience.', status: 'pending' }],
    },
    {
      title: 'Tree Planting Drive Volunteers',
      description: 'Join our weekend reforestation drive along the Karnataka coastline. We will be planting native mangrove saplings. All equipment, food, and transport from Bengaluru city centre will be provided. Great for families and groups!',
      category: 'Environment',
      commitmentType: 'one-time',
      duration: 'Full day',
      startDate: new Date(Date.now() + 14 * 86400000),
      locationType: 'Physical',
      location: 'Udupi, Karnataka',
      volunteersNeeded: 40,
      requiredSkills: ['Physical Labor'],
      requirements: 'Must be physically fit. Open to all ages 16+.',
      benefits: ['Certificate', 'Meals Provided', 'Transport Reimbursement'],
      status: 'open',
      ngo: ngo1._id,
      createdBy: ngoUser1._id,
    },
    {
      title: 'Remote Content Creator for Health Awareness',
      description: 'Create social media posts, infographics, and short videos about preventive health care for our online awareness campaign. Work completely remote at your own pace. 2-3 posts per week.',
      category: 'Healthcare',
      commitmentType: 'flexible',
      duration: '2-4 weeks',
      locationType: 'Remote',
      location: 'Work from anywhere, India',
      volunteersNeeded: 3,
      requiredSkills: ['Design', 'Communication', 'Technical'],
      requirements: 'Experience with Canva, Figma, or similar design tools. Basic health knowledge a plus.',
      benefits: ['Certificate', 'Networking', 'Letter of Recommendation'],
      status: 'open',
      ngo: ngo3._id,
      createdBy: admin._id,
    },
  ]);
  console.log('Created 3 volunteer opportunities');

  console.log('\n✅ Seed complete! Credentials:');
  console.log('  Admin   → admin@ngoconnect.in  / admin123');
  console.log('  NGO 1   → ngo1@ngoconnect.in   / ngo12345  (Green Earth — Gold Tier)');
  console.log('  NGO 2   → ngo2@ngoconnect.in   / ngo12345  (Education For All — Silver Tier)');
  console.log('  Donor 1 → donor1@ngoconnect.in / donor123');
  console.log('  Donor 2 → donor2@ngoconnect.in / donor123');
  console.log('  Vol 1   → vol1@ngoconnect.in   / vol12345  (Skills: Teaching, Physical Labor)');
  console.log('  Vol 2   → vol2@ngoconnect.in   / vol12345  (Skills: Design, Communication)');
  console.log('  Vol 3   → vol3@ngoconnect.in   / vol12345  (Skills: Technical, Admin)');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
