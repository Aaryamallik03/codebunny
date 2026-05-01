import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const INITIAL_PROBLEMS = [
  {
    title: "Bunny Hop Addition",
    difficulty: "Easy",
    category: "Arrays",
    description: "Write a function that takes an array of numbers and returns their sum. Help the bunnies count their carrots!\n\n**Example:**\n`input: [1, 2, 3] -> output: 6`",
    functionName: "sumCarrots",
    testCases: [
      { input: "[1, 2, 3]", output: "6", hidden: false },
      { input: "[10, 20]", output: "30", hidden: false },
      { input: "[5, -5, 10]", output: "10", hidden: true }
    ]
  },
  {
    title: "Palindrome Warren",
    difficulty: "Easy",
    category: "Strings",
    description: "Check if a given string is the same forward and backward. The bunnies love symmetrical tunnels!\n\n**Example:**\n`input: 'racecar' -> output: true`",
    functionName: "isPalindrome",
    testCases: [
      { input: "'racecar'", output: "true", hidden: false },
      { input: "'bunny'", output: "false", hidden: false },
      { input: "'level'", output: "true", hidden: true }
    ]
  },
  {
    title: "Find the Alpha Rabbit",
    difficulty: "Medium",
    category: "Arrays",
    description: "Given an array of integers representing rabbit weights, find the maximum weight. Avoid using built-in Math.max if you want to be a pro!\n\n**Example:**\n`input: [1, 5, 2, 10, 3] -> output: 10`",
    functionName: "findAlpha",
    testCases: [
      { input: "[1, 5, 2, 10, 3]", output: "10", hidden: false },
      { input: "[-1, -5, -2]", output: "-1", hidden: false },
      { input: "[100, 200, 50, 300]", output: "300", hidden: true }
    ]
  },
  {
    title: "Vowel Muncher",
    difficulty: "Easy",
    category: "Strings",
    description: "Count the number of vowels in a given string. Bunnies love 'a', 'e', 'i', 'o', 'u'!\n\n**Example:**\n`input: 'codebunny' -> output: 3`",
    functionName: "countVowels",
    testCases: [
      { input: "'codebunny'", output: "3", hidden: false },
      { input: "'rabbit'", output: "2", hidden: false },
      { input: "'AEIOU'", output: "5", hidden: true }
    ]
  },
  {
    title: "Burrow Fibonnaci",
    difficulty: "Medium",
    category: "Math",
    description: "Rabbits multiply fast! Calculate the n-th Fibonacci number.\n\n**Example:**\n`input: 6 -> output: 8`",
    functionName: "fib",
    testCases: [
      { input: "6", output: "8", hidden: false },
      { input: "10", output: "55", hidden: false },
      { input: "15", output: "610", hidden: true }
    ]
  }
];

export const seedData = async () => {
  const problemsRef = collection(db, 'problems');
  const snapshot = await getDocs(problemsRef);
  
  if (snapshot.empty) {
    console.log('Seeding initial problems...');
    for (const p of INITIAL_PROBLEMS) {
      await addDoc(problemsRef, {
        ...p,
        authorId: 'system',
        createdAt: serverTimestamp()
      });
    }
  }
};
