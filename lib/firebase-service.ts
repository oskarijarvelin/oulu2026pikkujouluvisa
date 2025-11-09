import { ref, get, set } from "firebase/database";
import { getDb } from "./firebase";
import { Quizz } from "./types";

const QUIZZES_PATH = "quizzes";

/**
 * Fetch all quizzes from Firebase Realtime Database
 */
export async function fetchQuizzesFromFirebase(): Promise<Quizz[]> {
  try {
    const db = getDb();
    const quizzesRef = ref(db, QUIZZES_PATH);
    const snapshot = await get(quizzesRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as Quizz[];
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching quizzes from Firebase:", error);
    throw error;
  }
}

/**
 * Save all quizzes to Firebase Realtime Database
 */
export async function saveQuizzesToFirebase(quizzes: Quizz[]): Promise<void> {
  try {
    const db = getDb();
    const quizzesRef = ref(db, QUIZZES_PATH);
    await set(quizzesRef, quizzes);
  } catch (error) {
    console.error("Error saving quizzes to Firebase:", error);
    throw error;
  }
}
