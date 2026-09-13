import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cities, todaysFeastCities, type City, type CityFact } from "@/data/cities";
import { CityImage } from "@/components/CityImage";
import { useProgress } from "@/hooks/useProgress";
import { pickAnotherFact, pickRandomCity, visitCityAndPickFact } from "@/lib/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dove andiamo oggi? — Ontdek Italiaanse steden" },
      {
        name: "description",
        content:
          "Druk op de knop en ontdek een willekeurige Italiaanse stad: foto's, verhalen en feitjes over Napoli, Bologna, Firenze en meer.",
      },
      { property: "og:title", content: "Dove andiamo oggi?" },
      {
        property: "og:description",
        content: "Ontdek Italiaanse steden, één verhaal tegelijk.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Scopri,
});

interface Reveal {
  city: City;
  fact: CityFact;
  allSeen: boolean;
  key: number;
}

function Scopri() {
  const { progress, setProgress } = useProgress();
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [feastCities, setFeastCities] = useState<City[]>([]);

  useEffect(() => {
    setFeastCities(todaysFeastCities(new Date()));
  }, []);

  function goToCity(city: City) {
    const res = visitCityAndPickFact(progress, city);
    setProgress(res.progress);
    setReveal({ city, fact: res.fact, allSeen: res.allSeen, key: Date.now() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function portamiInItalia() {
    goToCity(pickRandomCity(cities, progress.lastCityId));
  }

  function unAltroFatto() {
    if (!reveal) return;
    const res = pickAnotherFact(progress, reveal.city);
    setProgress(res.progress);
    setReveal({
      city: reveal.city,
      fact: res.fact,
      allSeen: res.allSeen,
      key: Date.now(),
    });
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-6xl flex-col px-5 pb-28 pt-8 md:pb-16 md:pt-14">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-olive">
          Un viaggio a sorpresa
        </p>
        <h1 className="mt-2 font-display text-5xl font-medium italic leading-[1.05] md:text-6xl">
          Dove andiamo oggi?
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Waar gaan we vandaag heen? Druk op de knop en laat Italië verrassen.
        </p>
      </div>

      {feastCities.map((city) => (
        <div
          key={city.id}
          className="mt-6 flex max-w-3xl flex-col items-start justify-between gap-3 rounded-2xl border border-gold/40 bg-accent px-4 py-3 sm:flex-row sm:items-center"
        >
          <div>
            <p className="font-display text-lg font-semibold">
              Oggi è {city.patronSaints[0]!.name}!
            </p>
            <p className="text-xs text-muted-foreground">
              Vandaag viert {city.name} zijn patroonheilige.
            </p>
          </div>
          <button
            onClick={() => goToCity(city)}
            className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground transition-transform hover:scale-105 active:scale-95"
          >
            Bezoek {city.name}
          </button>
        </div>
      ))}

      {reveal ? (
        <CityReveal
          key={reveal.key}
          reveal={reveal}
          onAnotherFact={unAltroFatto}
          onElsewhere={portamiInItalia}
        />
      ) : (
        <button
          onClick={portamiInItalia}
          className="group mt-12 flex flex-col items-center gap-4 self-center lg:mt-16"
        >
          <span className="flex h-44 w-44 items-center justify-center rounded-full bg-primary text-center font-display text-2xl font-semibold italic leading-tight text-primary-foreground shadow-[0_18px_40px_-12px_var(--primary)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_24px_50px_-10px_var(--primary)] group-active:scale-95 md:h-52 md:w-52 md:text-3xl">
            Portami
            <br />
            in Italia
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Breng me naar Italië
          </span>
        </button>
      )}
    </main>
  );
}

function CityReveal({
  reveal,
  onAnotherFact,
  onElsewhere,
}: {
  reveal: Reveal;
  onAnotherFact: () => void;
  onElsewhere: () => void;
}) {
  const { city, fact, allSeen } = reveal;

  return (
    <article className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:items-start lg:gap-8">
      <div className="animate-reveal-photo relative overflow-hidden rounded-3xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)] lg:sticky lg:top-20">
        <CityImage
          src={city.image}
          alt={`Foto van ${city.name}`}
          name={city.name}
          className="aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-5 pt-20 md:p-7 md:pt-24">
          <p className="animate-reveal-text text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/80">
            {city.region}
          </p>
          <h2 className="animate-reveal-text-late font-display text-4xl font-semibold italic text-white md:text-5xl lg:text-6xl">
            {city.name}
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="animate-reveal-text-late rounded-3xl bg-card p-6 shadow-sm md:p-7">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-olive">
            {fact.category}
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold md:text-3xl">{fact.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
            {fact.text}
          </p>
          {allSeen && (
            <p className="mt-5 rounded-2xl bg-accent px-4 py-3 text-sm italic text-accent-foreground">
              Hai scoperto tutto! — Je hebt alle verhalen van {city.name} ontdekt. Vanaf nu
              verschijnen ze willekeurig opnieuw.
            </p>
          )}
        </div>

        <div className="animate-reveal-text-late flex flex-col gap-3">
          <button
            onClick={onAnotherFact}
            className="rounded-full border border-border bg-card px-6 py-3 text-sm font-bold transition-colors hover:bg-secondary"
          >
            Un altro fatto · nog een verhaal
          </button>
          <button
            onClick={onElsewhere}
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
          >
            Portami altrove · ergens anders heen
          </button>
        </div>

        <p className="animate-reveal-text-late text-center">
          <Link
            to="/mia-italia"
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground underline-offset-4 hover:underline"
          >
            Bekijk La mia Italia →
          </Link>
        </p>
      </div>
    </article>
  );
}
