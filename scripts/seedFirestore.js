// Script to seed Firestore with sample course data
// Run this script once to populate your database with sample courses

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIP60-mFuLl_qmxD3RawJB0Z5t2T2D0AY",
  authDomain: "yogamanagementsystem.firebaseapp.com",
  databaseURL: "https://yogamanagementsystem-default-rtdb.firebaseio.com",
  projectId: "yogamanagementsystem",
  storageBucket: "yogamanagementsystem.firebasestorage.app",
  messagingSenderId: "72895669586",
  appId: "1:72895669586:web:0b6725b093ee52544e468b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample course data
const sampleCourses = [
  {
    title: 'Beginner Yoga Flow',
    instructor: 'Sarah Johnson',
    duration: '45 min',
    level: 'Beginner',
    price: 29.99,
    description: 'Perfect for beginners looking to start their yoga journey with gentle poses and breathing techniques.',
    createdAt: new Date(),
  },
  {
    title: 'Power Vinyasa Flow',
    instructor: 'Michael Chen',
    duration: '60 min',
    level: 'Intermediate',
    price: 39.99,
    description: 'Dynamic flow sequence that builds strength and flexibility through continuous movement.',
    createdAt: new Date(),
  },
  {
    title: 'Restorative Yoga',
    instructor: 'Emma Davis',
    duration: '30 min',
    level: 'All Levels',
    price: 24.99,
    description: 'Deep relaxation practice using props to support the body in gentle, healing poses.',
    createdAt: new Date(),
  },
  {
    title: 'Advanced Ashtanga',
    instructor: 'David Rodriguez',
    duration: '90 min',
    level: 'Advanced',
    price: 49.99,
    description: 'Traditional Ashtanga sequence for experienced practitioners seeking a challenging practice.',
    createdAt: new Date(),
  },
  {
    title: 'Yin Yoga Deep Stretch',
    instructor: 'Lisa Wang',
    duration: '75 min',
    level: 'Intermediate',
    price: 34.99,
    description: 'Long-held poses that target deep connective tissues and promote flexibility.',
    createdAt: new Date(),
  },
  {
    title: 'Morning Flow',
    instructor: 'Alex Thompson',
    duration: '20 min',
    level: 'Beginner',
    price: 19.99,
    description: 'Quick morning routine to energize your day with sun salutations and gentle stretches.',
    createdAt: new Date(),
  },
  {
    title: 'Meditation & Mindfulness',
    instructor: 'Priya Patel',
    duration: '15 min',
    level: 'All Levels',
    price: 14.99,
    description: 'Guided meditation practice to cultivate mindfulness and inner peace.',
    createdAt: new Date(),
  },
  {
    title: 'Yoga for Athletes',
    instructor: 'Chris Martinez',
    duration: '50 min',
    level: 'Intermediate',
    price: 44.99,
    description: 'Specialized sequences designed to complement athletic training and improve performance.',
    createdAt: new Date(),
  },
];

async function seedFirestore() {
  try {
    console.log('Starting to seed Firestore with sample courses...');
    
    for (const course of sampleCourses) {
      const docRef = await addDoc(collection(db, 'courses'), course);
      console.log(`Added course "${course.title}" with ID: ${docRef.id}`);
    }
    
    console.log('✅ Successfully seeded Firestore with sample courses!');
    console.log('You can now run your app and see the courses loaded from Firestore.');
    
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
  }
}

// Run the seeding function
seedFirestore(); 