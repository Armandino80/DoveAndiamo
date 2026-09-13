import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CityImage } from "@/components/CityImage";
import { useProgress } from "@/hooks/useProgress";
import { getCity } from "@/data/cities";
import { getCityProgress, toggleWishlist } from "@/lib/progress";

export const Route = createFileRoute("/citta/$id")({
  loader: ({ params }) => {
    const city = getCity(params.id);
    if (!city) throw notFound();
    return city;
  },
  component: CityDetail,
});

function CityDetail() {
  const city = Route.useLoaderData();
  const { progress, setProgress, hydrated } = useProgress();
  const cp = getCityProgress(progress, city.id);
  const seenFacts = city.facts.filter((f) => cp.seenFactIds.includes(f.id));
  const wished = progress.wishlistCityIds.includes(city.id);
  return (
    <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-6xl px-5 pb-28 pt-8 md:pb-16 md:pt-10">
      <Link
        to="/mia-italia"
        className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
      >
        ← La mia Italia
      </Link>
      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(20rem,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
        <div>
          <div className="relative overflow-hidden rounded-3xl shadow-lg">
            <CityImage
              src={city.image}
              alt={`Foto van ${city.name}`}
              name={city.name}
              className="aspect-[16/10] w-full object-cover lg:aspect-[4/5]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-5 pt-20">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/80">
                {city.region}
              </p>
              <h1 className="font-display text-5xl font-semibold italic text-white">{city.name}</h1>
            </div>
          </div>
          {hydrated && (
            <button
              onClick={() => setProgress(toggleWishlist(progress, city.id))}
              className={`mt-4 w-full rounded-full px-5 py-3 text-sm font-bold transition ${wished ? "bg-primary text-primary-foreground" : "border border-border bg-card"}`}
            >
              {wished ? "♥ Op mijn lijst — Vorrei andarci" : "♡ Vorrei andarci"}
            </button>
          )}
        </div>
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-olive">
            Il tuo taccuino
          </p>
          <h2 className="mt-1 font-display text-4xl font-semibold italic">Storie scoperte</h2>
          {!hydrated ? (
            <div className="mt-5 rounded-3xl bg-card p-6">Laden…</div>
          ) : seenFacts.length === 0 ? (
            <div className="mt-5 rounded-3xl bg-card p-6">
              <p className="font-display text-xl italic">Ancora da scoprire…</p>
              <Link
                to="/"
                className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
              >
                Ga naar Scopri
              </Link>
            </div>
          ) : (
            <ul className="mt-5 flex flex-col gap-4">
              {seenFacts.map((fact, index) => (
                <li key={fact.id} className="rounded-3xl bg-card p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-olive">
                    {fact.category} · {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-semibold">{fact.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{fact.text}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
