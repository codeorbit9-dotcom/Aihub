import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebase';

const PREBUILT_DEBATES = [
  {
    title: "Should India implement a national AI ethics board?",
    category: "AI & Regulation",
    description: "As AI integration grows, should there be a centralized body to oversee ethical implications in the Indian context?",
    status: "active",
    startTime: new Date(),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    votesA: 120,
    votesB: 85,
    sideA_user: "system",
    sideB_user: "system",
  },
  {
    title: "Data Sovereignty: Is local data storage mandatory for national security?",
    category: "Data Privacy",
    description: "Debating the impact of data localization on innovation versus national security and citizen privacy.",
    status: "active",
    startTime: new Date(),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    votesA: 245,
    votesB: 210,
    sideA_user: "system",
    sideB_user: "system",
  },
  {
    title: "Facial Recognition in Public Spaces: Security vs. Privacy",
    category: "Cybersecurity",
    description: "Should the government deploy facial recognition for public safety, or does it infringe too much on individual liberty?",
    status: "active",
    startTime: new Date(),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    votesA: 560,
    votesB: 610,
    sideA_user: "system",
    sideB_user: "system",
  }
];

export const seedDebates = async () => {
  try {
    const q = query(collection(db, 'debates'), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log("Seeding debates...");
      for (const debate of PREBUILT_DEBATES) {
        await addDoc(collection(db, 'debates'), debate);
      }
      console.log("Seeding complete.");
    }
  } catch (error) {
    console.error("Error seeding debates:", error);
  }
};
