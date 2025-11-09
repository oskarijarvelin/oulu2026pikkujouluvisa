"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchQuizzesFromFirebase, saveQuizzesToFirebase } from "@/lib/firebase-service";
import { Quizz, Question } from "@/lib/types";
import { Trash2, Plus, Save, RotateCcw } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quizz[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if running on localhost
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLocalhost = window.location.hostname === "localhost" || 
                         window.location.hostname === "127.0.0.1" ||
                         window.location.hostname === "";
      
      if (!isLocalhost) {
        router.push("/");
      }
    }
  }, [router]);

  // Load data from Firebase
  const loadQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchQuizzesFromFirebase();
      setQuizzes(data);
    } catch (err) {
      setError("Failed to load quizzes from Firebase");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  // Save changes to Firebase
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveQuizzesToFirebase(quizzes);
      alert("Muutokset tallennettu onnistuneesti!");
    } catch (err) {
      setError("Failed to save changes to Firebase");
      console.error(err);
      alert("Virhe tallennettaessa muutoksia!");
    } finally {
      setSaving(false);
    }
  };

  // Cancel and reload from Firebase
  const handleCancel = async () => {
    if (confirm("Haluatko varmasti peruuttaa muutokset ja ladata tiedot uudelleen?")) {
      await loadQuizzes();
    }
  };

  // Update quiz field
  const updateQuiz = (quizIndex: number, field: string, value: any) => {
    const updated = [...quizzes];
    if (field.startsWith("options.")) {
      const optionField = field.split(".")[1];
      updated[quizIndex] = {
        ...updated[quizIndex],
        options: {
          ...updated[quizIndex].options,
          [optionField]: value,
        },
      };
    } else {
      updated[quizIndex] = { ...updated[quizIndex], [field]: value };
    }
    setQuizzes(updated);
  };

  // Update question
  const updateQuestion = (quizIndex: number, questionIndex: number, field: string, value: any) => {
    const updated = [...quizzes];
    const questions = [...updated[quizIndex].questions];
    questions[questionIndex] = { ...questions[questionIndex], [field]: value };
    updated[quizIndex] = { ...updated[quizIndex], questions };
    setQuizzes(updated);
  };

  // Update option in a question
  const updateQuestionOption = (quizIndex: number, questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...quizzes];
    const questions = [...updated[quizIndex].questions];
    const options = [...questions[questionIndex].options];
    options[optionIndex] = value;
    questions[questionIndex] = { ...questions[questionIndex], options };
    updated[quizIndex] = { ...updated[quizIndex], questions };
    setQuizzes(updated);
  };

  // Add new question
  const addQuestion = (quizIndex: number) => {
    const updated = [...quizzes];
    const newQuestion: Question = {
      id: Date.now(),
      question: "Uusi kysymys",
      options: ["Vaihtoehto 1", "Vaihtoehto 2", "Vaihtoehto 3", "Vaihtoehto 4"],
      answer: "Vaihtoehto 1",
    };
    updated[quizIndex].questions = [...updated[quizIndex].questions, newQuestion];
    setQuizzes(updated);
  };

  // Delete question
  const deleteQuestion = (quizIndex: number, questionIndex: number) => {
    if (confirm("Haluatko varmasti poistaa tämän kysymyksen?")) {
      const updated = [...quizzes];
      updated[quizIndex].questions = updated[quizIndex].questions.filter((_, i) => i !== questionIndex);
      setQuizzes(updated);
    }
  };

  // Add new quiz
  const addQuiz = () => {
    const newQuiz: Quizz = {
      title: "Uusi Visa",
      icon: "./assets/images/icon-html.svg",
      bgcolor: "#FFF1E9",
      options: {
        timeBasedScoring: true,
        fullPointsThreshold: 5000,
        halfPointsThreshold: 10000,
        icon: "Code2",
        iconColor: "#E44D26",
        iconBgColor: "#FFF1E9",
      },
      questions: [],
    };
    setQuizzes([...quizzes, newQuiz]);
  };

  // Delete quiz
  const deleteQuiz = (quizIndex: number) => {
    if (confirm("Haluatko varmasti poistaa tämän visan?")) {
      setQuizzes(quizzes.filter((_, i) => i !== quizIndex));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-700 dark:text-gray-300">Ladataan...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Floating Header with Buttons */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Visailun Muokkaustyökalu
            </h1>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={18} />
                Peruuta
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {saving ? "Tallennetaan..." : "Tallenna muutokset"}
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-2 text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={addQuiz}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            <Plus size={18} />
            Lisää Uusi Visa
          </button>
        </div>

        {quizzes.map((quiz, quizIndex) => (
          <div
            key={quizIndex}
            className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            {/* Quiz Header */}
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Visan Nimi
                  </label>
                  <input
                    type="text"
                    value={quiz.title}
                    onChange={(e) => updateQuiz(quizIndex, "title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ikoni Polku
                    </label>
                    <input
                      type="text"
                      value={quiz.icon}
                      onChange={(e) => updateQuiz(quizIndex, "icon", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Taustaväri
                    </label>
                    <input
                      type="text"
                      value={quiz.bgcolor}
                      onChange={(e) => updateQuiz(quizIndex, "bgcolor", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Quiz Options */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Asetukset
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={quiz.options?.timeBasedScoring ?? true}
                          onChange={(e) =>
                            updateQuiz(quizIndex, "options.timeBasedScoring", e.target.checked)
                          }
                          className="rounded"
                        />
                        Aikapohjainen Pisteytys
                      </label>
                    </div>
                    {quiz.options?.timeBasedScoring && (
                      <>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Täydet pisteet (ms)
                          </label>
                          <input
                            type="number"
                            value={quiz.options?.fullPointsThreshold ?? 5000}
                            onChange={(e) =>
                              updateQuiz(quizIndex, "options.fullPointsThreshold", parseInt(e.target.value))
                            }
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Puolet pisteitä (ms)
                          </label>
                          <input
                            type="number"
                            value={quiz.options?.halfPointsThreshold ?? 10000}
                            onChange={(e) =>
                              updateQuiz(quizIndex, "options.halfPointsThreshold", parseInt(e.target.value))
                            }
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteQuiz(quizIndex)}
                className="ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Kysymykset ({quiz.questions.length})
                </h3>
                <button
                  onClick={() => addQuestion(quizIndex)}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition"
                >
                  <Plus size={16} />
                  Lisää Kysymys
                </button>
              </div>

              {quiz.questions.map((question, questionIndex) => (
                <div
                  key={questionIndex}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Kysymys {questionIndex + 1}
                        </label>
                        <textarea
                          value={question.question}
                          onChange={(e) =>
                            updateQuestion(quizIndex, questionIndex, "question", e.target.value)
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Vaihtoehdot
                        </label>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <input
                              key={optionIndex}
                              type="text"
                              value={option}
                              onChange={(e) =>
                                updateQuestionOption(quizIndex, questionIndex, optionIndex, e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Oikea Vastaus
                        </label>
                        <select
                          value={question.answer}
                          onChange={(e) =>
                            updateQuestion(quizIndex, questionIndex, "answer", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        >
                          {question.options.map((option, optIdx) => (
                            <option key={optIdx} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteQuestion(quizIndex, questionIndex)}
                      className="ml-3 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
