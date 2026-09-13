import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { cities } from "@/data/cities";
import { CityImage } from "@/components/CityImage";
import { ItaliaMap } from "@/components/ItaliaMap";
import { useProgress } from "@/hooks/useProgress";
import { getCityProgress } from "@/lib/progress";

export const Route = createFileRoute("/mia-italia")({
  head: () => ({
    meta: [
      { title: "La mia Italia — Dove andiamo oggi?" },
      {
        name: "description",
        content: "Alle Italiaanse steden die je al hebt ontdekt, op een rij.",
      },
      { property: "og:title", content: "La mia Italia" },
      {
        property: "og:description",
        content: "Alle Italiaanse steden die je al hebt ontdekt, op een rij.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MiaItalia,
});

function MiaItalia() {
  const { progress, hydrated } = useProgress();

  const visited = useMemo(
    () => cities.filter((c) => getCityProgress(progress, c.id).visits > 0),
    [progress],
  );

  return (
    <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-6xl px-5 pb-28 pt-8 md:pb-16 md:pt-14">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-olive">
          Il tuo diario di viaggio
        </p>
        <h1 className="mt-2 font-display text-5xl font-medium italic md:text-6xl">La mia Italia</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          De steden die je al hebt ontdekt — {visited.length} van {cities.length}.
        </p>
      </div>

      <section
        className="mt-8 grid gap-8 lg:grid-cols-[minmax(20rem,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-10"
        aria-label="Jouw ontdekte Italië"
      >
        <div className="lg:sticky lg:top-20">
          <ItaliaMap progress={progress} />
        </div>

        <div>
          {!hydrated ? (
            <div className="rounded-3xl bg-card p-8 shadow-sm" aria-live="polite">
              <div className="h-7 w-40 animate-pulse rounded-full bg-muted" />
              <div className="mt-4 h-4 w-64 max-w-full animate-pulse rounded-full bg-muted" />
            </div>
          ) : visited.length === 0 ? (
            <div className="rounded-3xl bg-card p-8 text-center shadow-sm md:p-10">
              <p className="font-display text-2xl italic">Ancora nessuna città…</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Je hebt nog geen stad ontdekt. Tijd voor een eerste reis!
              </p>
              <Link
                to="/"
                className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
              >
                Portami in Italia
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {visited.map((city) => {
                const cp = getCityProgress(progress, city.id);
                const seen = city.facts.filter((f) => cp.seenFactIds.includes(f.id)).length;
                const pct = Math.round((seen / city.facts.length) * 100);

                return (
                  <li key={city.id}>
                    <Link
                      to="/citta/$id"
                      params={{ id: city.id }}
                      className="group flex items-center gap-4 rounded-3xl bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <CityImage
                        src={city.image}
                        alt={`Foto van ${city.name}`}
                        name={city.name}
                        loading="lazy"
                        className="h-20 w-20 shrink-0 rounded-2xl object-cover sm:h-24 sm:w-24"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
                          <h2 className="truncate font-display text-2xl font-semibold italic transition-colors group-hover:text-primary">
                            {city.name}
                          </h2>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {city.region}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {cp.visits}× bezocht · {seen}/{city.facts.length} verhalen
                        </p>
                        <div
                          className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                          role="progressbar"
                          aria-label={`${seen} van ${city.facts.length} verhalen ontdekt in ${city.name}`}
                          aria-valuemin={0}
                          aria-valuemax={city.facts.length}
                          aria-valuenow={seen}
                        >
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
