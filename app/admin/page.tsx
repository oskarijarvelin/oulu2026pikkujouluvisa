"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchQuizzesFromFirebase, saveQuizzesToFirebase } from "@/lib/firebase-service";
import { Quizz, Question } from "@/lib/types";
import { Trash2, Plus, Save, RotateCcw, Gamepad2 } from "lucide-react";

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
      if (data && data.length > 0) {
        setQuizzes(data);
      } else {
        // If no data in Firebase, load from static file as fallback
        const res = await fetch("/data.json");
        const json = await res.json();
        setQuizzes(json.quizzes);
        setError("Ladattu staattisesta tiedostosta. Firebasessa ei ole dataa.");
      }
    } catch (err) {
      // Fallback to static file if Firebase fails
      try {
        const res = await fetch("/data.json");
        const json = await res.json();
        setQuizzes(json.quizzes);
        setError("Firebase ei ole käytössä. Ladattu staattisesta tiedostosta.");
      } catch (fileErr) {
        setError("Virhe ladattaessa tietoja");
        console.error(err, fileErr);
      }
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
    const oldOption = options[optionIndex];
    options[optionIndex] = value;
    
    // Update answer references if the old option was marked as correct
    let answer = questions[questionIndex].answer;
    if (Array.isArray(answer)) {
      answer = answer.map(a => a === oldOption ? value : a);
    } else if (answer === oldOption) {
      answer = value;
    }
    
    questions[questionIndex] = { ...questions[questionIndex], options, answer };
    updated[quizIndex] = { ...updated[quizIndex], questions };
    setQuizzes(updated);
  };

  // Add option to a question (max 4)
  const addQuestionOption = (quizIndex: number, questionIndex: number) => {
    const updated = [...quizzes];
    const questions = [...updated[quizIndex].questions];
    const options = [...questions[questionIndex].options];
    
    if (options.length >= 4) return; // Max 4 options
    
    options.push(`Vaihtoehto ${options.length + 1}`);
    questions[questionIndex] = { ...questions[questionIndex], options };
    updated[quizIndex] = { ...updated[quizIndex], questions };
    setQuizzes(updated);
  };

  // Remove option from a question (min 2)
  const removeQuestionOption = (quizIndex: number, questionIndex: number, optionIndex: number) => {
    const updated = [...quizzes];
    const questions = [...updated[quizIndex].questions];
    const options = [...questions[questionIndex].options];
    
    if (options.length <= 2) return; // Min 2 options
    
    const removedOption = options[optionIndex];
    options.splice(optionIndex, 1);
    
    // Update answer references if the removed option was marked as correct
    let answer = questions[questionIndex].answer;
    if (Array.isArray(answer)) {
      answer = answer.filter(a => a !== removedOption);
      // If no answers left, set first option as correct
      if (answer.length === 0) {
        answer = [options[0]];
      }
    } else if (answer === removedOption) {
      answer = options[0];
    }
    
    questions[questionIndex] = { ...questions[questionIndex], options, answer };
    updated[quizIndex] = { ...updated[quizIndex], questions };
    setQuizzes(updated);
  };

  // Toggle correct answer checkbox
  const toggleCorrectAnswer = (quizIndex: number, questionIndex: number, option: string) => {
    const updated = [...quizzes];
    const questions = [...updated[quizIndex].questions];
    let answer = questions[questionIndex].answer;
    
    // Convert to array if it's a string
    let answerArray: string[] = Array.isArray(answer) ? [...answer] : [answer];
    
    if (answerArray.includes(option)) {
      // Remove if already checked (but keep at least one)
      answerArray = answerArray.filter(a => a !== option);
      if (answerArray.length === 0) {
        // Don't allow removing the last correct answer
        return;
      }
    } else {
      // Add if not checked (max 4)
      if (answerArray.length >= 4) return;
      answerArray.push(option);
    }
    
    // Store as array if multiple, or single string if only one
    questions[questionIndex] = { 
      ...questions[questionIndex], 
      answer: answerArray.length === 1 ? answerArray[0] : answerArray 
    };
    updated[quizIndex] = { ...updated[quizIndex], questions };
    setQuizzes(updated);
  };

  // Add new question
  const addQuestion = (quizIndex: number) => {
    const updated = [...quizzes];
    const newQuestion: Question = {
      id: Date.now(),
      question: "Uusi kysymys",
      options: ["Vaihtoehto 1", "Vaihtoehto 2"],
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
      options: {
        timeBasedScoring: true,
        fullPointsThreshold: 5000,
        halfPointsThreshold: 10000,
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
      <div className="min-h-screen bg-harmaa dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-700 dark:text-gray-300">Ladataan...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-valkoinen dark:bg-gray-900">
      {/* Floating Header with Buttons */}
      <div className="sticky top-0 z-50 bg-valkoinen dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-valkoinen">
              Visaeditori
            </h1>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-harmaa hover:bg-harmaa/70 text-musta rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={18} />
                Peruuta
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-yotaivas hover:bg-perameri text-valkoinen rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {saving ? "Tallennetaan..." : "Tallenna muutokset"}
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 px-4 py-2 bg-perameri hover:bg-yotaivas text-valkoinen rounded-lg transition"
              >
                <Gamepad2 size={18} />
                Pelaa visoja
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
            className="flex items-center gap-2 px-4 py-2 bg-yotaivas hover:bg-perameri text-valkoinen rounded-lg transition"
          >
            <Plus size={18} />
            Lisää Uusi Visa
          </button>
        </div>

        {quizzes.map((quiz, quizIndex) => (
          <div
            key={quizIndex}
            className="mb-8 bg-harmaa/50 dark:bg-gray-800 rounded-lg shadow-lg p-6"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-valkoinen dark:bg-gray-700 text-gray-900 dark:text-valkoinen"
                  />
                </div>

                {/* Quiz Options */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Asetukset
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
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
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-valkoinen dark:bg-gray-700 text-gray-900 dark:text-valkoinen text-sm"
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
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-valkoinen dark:bg-gray-700 text-gray-900 dark:text-valkoinen text-sm"
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-valkoinen">
                  Kysymykset ({quiz.questions.length})
                </h3>
                <button
                  onClick={() => addQuestion(quizIndex)}
                  className="flex items-center gap-2 px-3 py-1 bg-yotaivas hover:bg-perameri text-valkoinen rounded text-sm transition"
                >
                  <Plus size={16} />
                  Lisää Kysymys
                </button>
              </div>

              {quiz.questions.map((question, questionIndex) => (
                <div
                  key={questionIndex}
                  className="bg-valkoinen/60 dark:bg-gray-700/50 rounded-lg p-4 space-y-3"
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
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-valkoinen dark:bg-gray-700 text-gray-900 dark:text-valkoinen text-sm"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                            Vaihtoehdot (2-4)
                          </label>
                          <div className="flex gap-2">
                            {question.options.length < 4 && (
                              <button
                                onClick={() => addQuestionOption(quizIndex, questionIndex)}
                                className="text-xs px-2 py-1 bg-yotaivas hover:bg-perameri text-valkoinen rounded transition"
                              >
                                + Lisää
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => {
                            const answerArray = Array.isArray(question.answer) 
                              ? question.answer 
                              : [question.answer];
                            const isCorrect = answerArray.includes(option);
                            
                            return (
                              <div key={optionIndex} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isCorrect}
                                  onChange={() => toggleCorrectAnswer(quizIndex, questionIndex, option)}
                                  className="rounded"
                                  title="Merkitse oikeaksi vastaukseksi"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) =>
                                    updateQuestionOption(quizIndex, questionIndex, optionIndex, e.target.value)
                                  }
                                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-valkoinen dark:bg-gray-700 text-gray-900 dark:text-valkoinen text-sm"
                                />
                                {question.options.length > 2 && (
                                  <button
                                    onClick={() => removeQuestionOption(quizIndex, questionIndex, optionIndex)}
                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                                    title="Poista vaihtoehto"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Valitse 1-4 oikeaa vastausta rastittamalla vaihtoehdot
                        </p>
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
