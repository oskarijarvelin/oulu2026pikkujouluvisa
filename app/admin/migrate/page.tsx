"use client";
import { useEffect, useState } from "react";
import { saveQuizzesToFirebase } from "@/lib/firebase-service";
import dataJson from "@/public/data.json";

export default function MigratePage() {
  const [status, setStatus] = useState<"idle" | "migrating" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleMigrate = async () => {
    setStatus("migrating");
    setMessage("Ladataan tietoja Firebaseen...");
    
    try {
      await saveQuizzesToFirebase(dataJson.quizzes);
      setStatus("success");
      setMessage("Tiedot on ladattu onnistuneesti Firebaseen!");
    } catch (error) {
      setStatus("error");
      setMessage(`Virhe: ${error instanceof Error ? error.message : "Tuntematon virhe"}`);
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Siirrä data.json Firebaseen
        </h1>
        
        <div className="mb-6 text-gray-700 dark:text-gray-300">
          <p className="mb-2">
            Tämä työkalu siirtää <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">public/data.json</code> tiedoston 
            tiedot Firebase Realtime Databaseen.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Huom: Tämä korvaa kaikki olemassa olevat tiedot Firebasessa.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Tiedot:
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
            <li>Visoja: {dataJson.quizzes.length}</li>
            {dataJson.quizzes.map((quiz, idx) => (
              <li key={idx} className="ml-6">
                {quiz.title}: {quiz.questions.length} kysymystä
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleMigrate}
          disabled={status === "migrating"}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "migrating" ? "Siirretään..." : "Siirrä Firebaseen"}
        </button>

        {message && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              status === "success"
                ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                : status === "error"
                ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                : "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
            }`}
          >
            {message}
          </div>
        )}

        {status === "success" && (
          <div className="mt-4">
            <a
              href="/admin"
              className="block text-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
            >
              Siirry Muokkaustyökaluun
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
