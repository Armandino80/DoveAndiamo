import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { cities } from "@/data/cities";
export const Route = createFileRoute("/non-ci-credo")({ component: Game });
const fakes = [
  "De burgemeester moet volgens een middeleeuwse regel één dag per jaar achteruit door het centrum lopen.",
  "De grootste klok van de stad wordt traditioneel met olijfolie gesmeerd voor geluk.",
  "Een oude stadswet verplicht duiven om op zondag buiten de hoofdstraat te blijven.",
  "De stad koos ooit per loting een geit als ereburger om een belastingconflict te beslechten.",
];
function Game() {
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const q = useMemo(() => {
    const a = cities[(round * 5 + 3) % cities.length],
      b = cities[(round * 11 + 7) % cities.length];
    const fake = round % 3;
    const real = [
      a.facts[(round + 6) % a.facts.length].text,
      b.facts[(round + 12) % b.facts.length].text,
    ];
    const items = [...real];
    items.splice(fake, 0, fakes[round % fakes.length]);
    return { items, fake };
  }, [round]);
  return (
    <main className="mx-auto max-w-2xl px-5 pb-28 pt-10">
      <p className="text-xs font-bold uppercase tracking-[.3em] text-olive">Vero, vero… falso?</p>
      <h1 className="mt-2 font-display text-5xl italic">Non ci credo!</h1>
      <p className="mt-3 text-muted-foreground">
        Twee feitjes zijn echt. Eén is compleet verzonnen. Welke?
      </p>
      <div className="mt-8 flex flex-col gap-3">
        {q.items.map((x, i) => (
          <button
            key={i}
            disabled={answer !== null}
            onClick={() => setAnswer(i)}
            className={`rounded-3xl border p-5 text-left text-sm leading-relaxed ${answer !== null && i === q.fake ? "border-primary bg-primary/10" : answer === i ? "border-destructive bg-destructive/10" : "border-border bg-card"}`}
          >
            {x}
          </button>
        ))}
      </div>
      {answer !== null && (
        <div className="mt-6 rounded-3xl bg-card p-5">
          <p className="font-display text-2xl italic">
            {answer === q.fake ? "Esatto! 🎭" : "Mamma mia — die was echt!"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            De verzonnen bewering is gemarkeerd. Echte Italiaanse geschiedenis wint het verrassend
            vaak van fictie.
          </p>
          <button
            onClick={() => {
              setRound((r) => r + 1);
              setAnswer(null);
            }}
            className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
          >
            Ancora!
          </button>
        </div>
      )}
    </main>
  );
}
