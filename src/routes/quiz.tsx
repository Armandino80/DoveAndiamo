import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Flame, LockKeyhole, RotateCcw, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { getAwards } from "@/lib/awards";
import { recordQuizResult } from "@/lib/progress";
import {
  buildQuiz,
  canStartQuiz,
  getQuizPool,
  getSeenFactCount,
  QUIZ_LENGTH,
  type QuizQuestion,
} from "@/lib/quiz";
import { useProgress } from "@/hooks/useProgress";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Quiz — Dove andiamo oggi?" },
      {
        name: "description",
        content: "Test wat je nog weet van de Italiaanse verhalen die je al hebt ontdekt.",
      },
      { property: "og:title", content: "La Dolce Quiz" },
      {
        property: "og:description",
        content: "Tien vragen over de Italiaanse weetjes die je al hebt ontdekt.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: QuizPage,
});

type Phase = "intro" | "playing" | "finished";

function QuizPage() {
  const { progress, setProgress, hydrated } = useProgress();
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestRoundStreak, setBestRoundStreak] = useState(0);
  const [newAwardIds, setNewAwardIds] = useState<string[]>([]);

  const awards = useMemo(() => getAwards(progress), [progress]);
  const unlockedAwards = awards.filter((award) => award.unlocked);
  const seenFacts = getSeenFactCount(progress);
  const questionPoolSize = hydrated ? getQuizPool(progress).length : 0;
  const ready = hydrated && canStartQuiz(progress);
  const question = questions[questionIndex];

  function startQuiz() {
    const nextQuestions = buildQuiz(progress);
    if (nextQuestions.length < QUIZ_LENGTH) return;

    setQuestions(nextQuestions);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setStreak(0);
    setBestRoundStreak(0);
    setNewAwardIds([]);
    setPhase("playing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function answer(option: string) {
    if (!question || selectedAnswer !== null) return;

    setSelectedAnswer(option);
    if (option === question.correctAnswer) {
      const nextStreak = streak + 1;
      setScore((current) => current + 1);
      setStreak(nextStreak);
      setBestRoundStreak((current) => Math.max(current, nextStreak));
    } else {
      setStreak(0);
    }
  }

  function continueQuiz() {
    if (!question || selectedAnswer === null) return;

    if (questionIndex < questions.length - 1) {
      setQuestionIndex((current) => current + 1);
      setSelectedAnswer(null);
      return;
    }

    const unlockedBefore = new Set(
      getAwards(progress)
        .filter((award) => award.unlocked)
        .map((award) => award.id),
    );
    const nextProgress = recordQuizResult(progress, score, bestRoundStreak);
    const unlockedAfter = getAwards(nextProgress)
      .filter((award) => award.unlocked && !unlockedBefore.has(award.id))
      .map((award) => award.id);

    setProgress(nextProgress);
    setNewAwardIds(unlockedAfter);
    setPhase("finished");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-6xl px-5 pb-28 pt-8 md:pb-16 md:pt-14">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-olive">
          Quanto ne sai?
        </p>
        <h1 className="mt-2 font-display text-5xl font-medium italic md:text-6xl">La Dolce Quiz</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Tien vragen, maar alleen over verhalen die jij al hebt gezien. Goede reeksen leveren extra
          awards op — inclusief een paar volkomen onnodige maar essentiële Italiaanse eretitels.
        </p>
      </div>

      {!hydrated ? (
        <section className="mt-8 rounded-3xl bg-card p-7 shadow-sm" aria-live="polite">
          <div className="h-6 w-44 animate-pulse rounded-full bg-muted" />
          <div className="mt-4 h-4 w-full max-w-lg animate-pulse rounded-full bg-muted" />
        </section>
      ) : phase === "playing" && question ? (
        <QuizCard
          question={question}
          questionIndex={questionIndex}
          selectedAnswer={selectedAnswer}
          score={score}
          streak={streak}
          onAnswer={answer}
          onContinue={continueQuiz}
        />
      ) : phase === "finished" ? (
        <QuizResult
          score={score}
          bestStreak={bestRoundStreak}
          newAwards={awards.filter((award) => newAwardIds.includes(award.id))}
          onRestart={startQuiz}
        />
      ) : (
        <QuizIntro
          ready={ready}
          seenFacts={seenFacts}
          questionPoolSize={questionPoolSize}
          completed={progress.quiz.completed}
          bestScore={progress.quiz.bestScore}
          onStart={startQuiz}
        />
      )}

      <AwardsGrid awards={awards} unlockedCount={unlockedAwards.length} />
    </main>
  );
}

function QuizIntro({
  ready,
  seenFacts,
  questionPoolSize,
  completed,
  bestScore,
  onStart,
}: {
  ready: boolean;
  seenFacts: number;
  questionPoolSize: number;
  completed: number;
  bestScore: number;
  onStart: () => void;
}) {
  return (
    <section className="mt-8 grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(15rem,0.8fr)]">
      <div className="rounded-3xl bg-card p-6 shadow-sm md:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Trophy className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-olive">10 domande</p>
            <h2 className="font-display text-2xl font-semibold italic">
              Wat is er blijven hangen?
            </h2>
          </div>
        </div>

        {ready ? (
          <>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Je hebt genoeg verhalen ontdekt voor een ronde met {QUIZ_LENGTH} unieke vragen. De
              vragen worden iedere ronde opnieuw gemixt uit jouw eigen ontdekkingsgeschiedenis.
            </p>
            <button
              onClick={onStart}
              className="mt-6 w-full rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.01] active:scale-95 sm:w-auto"
            >
              Avvia il quiz · start de quiz
            </button>
          </>
        ) : (
          <>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Nog niet genoeg quizmateriaal. Je hebt {seenFacts} weetje{seenFacts === 1 ? "" : "s"}
              gezien, goed voor {questionPoolSize} mogelijke vragen. Voor een ronde zijn er minstens
              {` ${QUIZ_LENGTH}`} nodig.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
            >
              Ontdek eerst meer verhalen
            </Link>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
        <StatCard label="Quizzen gespeeld" value={String(completed)} />
        <StatCard label="Beste score" value={`${bestScore}/10`} />
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-background p-5">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-3xl font-semibold italic">{value}</p>
    </div>
  );
}

function QuizCard({
  question,
  questionIndex,
  selectedAnswer,
  score,
  streak,
  onAnswer,
  onContinue,
}: {
  question: QuizQuestion;
  questionIndex: number;
  selectedAnswer: string | null;
  score: number;
  streak: number;
  onAnswer: (answer: string) => void;
  onContinue: () => void;
}) {
  const answered = selectedAnswer !== null;
  const correct = selectedAnswer === question.correctAnswer;
  const progressPct = ((questionIndex + 1) / QUIZ_LENGTH) * 100;

  return (
    <section className="mt-8 max-w-3xl rounded-3xl bg-card p-6 shadow-sm md:p-8">
      <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        <span>
          Vraag {questionIndex + 1} / {QUIZ_LENGTH}
        </span>
        <span className="flex items-center gap-3">
          <span>{score} goed</span>
          {streak > 1 && (
            <span className="flex items-center gap-1 text-primary">
              <Flame className="h-4 w-4" aria-hidden="true" /> {streak}×
            </span>
          )}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <h2 className="mt-7 font-display text-3xl font-semibold leading-tight md:text-4xl">
        {question.prompt}
      </h2>

      <div className="mt-7 grid gap-3">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isAnswer = option === question.correctAnswer;
          const revealCorrect = answered && isAnswer;
          const revealWrong = answered && isSelected && !isAnswer;

          return (
            <button
              key={option}
              onClick={() => onAnswer(option)}
              disabled={answered}
              className={`rounded-2xl border px-4 py-3.5 text-left text-sm font-semibold transition-all ${
                revealCorrect
                  ? "border-olive bg-accent text-accent-foreground"
                  : revealWrong
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : "border-border bg-background hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm disabled:hover:translate-y-0 disabled:hover:border-border disabled:hover:shadow-none"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-accent p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl font-semibold italic">
              {correct ? "Bravissimo!" : "Quasi… bijna."}
            </p>
            {!correct && (
              <p className="mt-1 text-sm text-muted-foreground">
                Het goede antwoord is:{" "}
                <strong className="text-foreground">{question.correctAnswer}</strong>
              </p>
            )}
          </div>
          <button
            onClick={onContinue}
            className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
          >
            {questionIndex === QUIZ_LENGTH - 1 ? "Bekijk resultaat" : "Volgende vraag"}
          </button>
        </div>
      )}
    </section>
  );
}

function QuizResult({
  score,
  bestStreak,
  newAwards,
  onRestart,
}: {
  score: number;
  bestStreak: number;
  newAwards: ReturnType<typeof getAwards>;
  onRestart: () => void;
}) {
  const message =
    score === 10
      ? "Perfetto. Zelfs een nonna zou onder de indruk zijn."
      : score >= 8
        ? "Molto bene. Er is opvallend veel blijven hangen."
        : score >= 6
          ? "Buon lavoro. Nog één espresso en je bent er."
          : "Tijd voor nog wat Italiaanse omzwervingen.";

  return (
    <section className="mt-8 max-w-3xl rounded-3xl bg-card p-7 text-center shadow-sm md:p-10">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Trophy className="h-7 w-7" aria-hidden="true" />
      </span>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-olive">Risultato</p>
      <h2 className="mt-1 font-display text-5xl font-semibold italic">{score}/10</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
      <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Flame className="h-4 w-4" aria-hidden="true" /> Beste reeks deze ronde: {bestStreak}
      </p>

      {newAwards.length > 0 && (
        <div className="mt-7 rounded-2xl border border-gold/40 bg-accent p-5 text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-olive">Nieuwe award</p>
          {newAwards.map((award) => (
            <p key={award.id} className="mt-2 font-display text-xl font-semibold italic">
              {award.emoji} {award.name}
            </p>
          ))}
        </div>
      )}

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          onClick={onRestart}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Nog een ronde
        </button>
        <Link
          to="/"
          className="rounded-full border border-border bg-background px-6 py-3 text-sm font-bold transition-colors hover:bg-secondary"
        >
          Verder ontdekken
        </Link>
      </div>
    </section>
  );
}

function AwardsGrid({
  awards,
  unlockedCount,
}: {
  awards: ReturnType<typeof getAwards>;
  unlockedCount: number;
}) {
  return (
    <section className="mt-12" aria-labelledby="awards-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-olive">
            Premi e onori
          </p>
          <h2
            id="awards-heading"
            className="mt-1 font-display text-3xl font-semibold italic md:text-4xl"
          >
            Jouw awards
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {unlockedCount} van {awards.length} vrijgespeeld
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {awards.map((award) => (
          <article
            key={award.id}
            className={`rounded-3xl border p-5 transition-all ${
              award.unlocked ? "border-gold/40 bg-card shadow-sm" : "border-border bg-muted/30"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={`text-3xl ${award.unlocked ? "" : "grayscale opacity-40"}`}
                aria-hidden="true"
              >
                {award.emoji}
              </span>
              {award.unlocked ? (
                <CheckCircle2 className="h-5 w-5 text-olive" aria-label="Vrijgespeeld" />
              ) : (
                <LockKeyhole
                  className="h-5 w-5 text-muted-foreground"
                  aria-label="Nog vergrendeld"
                />
              )}
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold italic">{award.name}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {award.description}
            </p>
            {award.progressLabel && (
              <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {award.progressLabel}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
