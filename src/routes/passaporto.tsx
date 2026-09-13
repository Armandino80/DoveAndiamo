import { createFileRoute, Link } from "@tanstack/react-router";
import { cities } from "@/data/cities";
import { useProgress } from "@/hooks/useProgress";
import { getCityProgress } from "@/lib/progress";

export const Route = createFileRoute("/passaporto")({ component: Passaporto });

function Passaporto() {
  const { progress, hydrated } = useProgress();
  const regions = [...new Set(cities.map((c) => c.region))].sort();
  const visited = cities.filter((c) => getCityProgress(progress, c.id).visits > 0);
  return (
    <main className="mx-auto max-w-6xl px-5 pb-28 pt-10">
      <p className="text-xs font-bold uppercase tracking-[.3em] text-olive">
        Repubblica della scoperta
      </p>
      <h1 className="mt-2 font-display text-5xl italic">Passaporto Italiano</h1>
      <p className="mt-3 text-muted-foreground">
        {visited.length} stempels verzameld · {progress.wishlistCityIds.length} steden op je
        verlanglijst.
      </p>
      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {hydrated &&
          regions.map((region) => {
            const rc = cities.filter((c) => c.region === region);
            const done = rc.filter((c) => getCityProgress(progress, c.id).visits > 0);
            return (
              <div key={region} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-olive">
                      Regione
                    </p>
                    <h2 className="font-display text-2xl font-semibold italic">{region}</h2>
                  </div>
                  <span className="rotate-[-8deg] rounded-full border-2 border-primary px-3 py-2 font-display text-lg italic text-primary">
                    {done.length}/{rc.length}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {rc.map((city) => (
                    <Link
                      key={city.id}
                      to="/citta/$id"
                      params={{ id: city.id }}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${getCityProgress(progress, city.id).visits > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {getCityProgress(progress, city.id).visits > 0 ? "✓ " : ""}
                      {city.name}
                      {progress.wishlistCityIds.includes(city.id) ? " ♥" : ""}
                    </Link>
                  ))}
                </div>
                {done.length === rc.length && (
                  <p className="mt-4 text-sm font-bold text-primary">★ Regione completata!</p>
                )}
              </div>
            );
          })}
      </section>
    </main>
  );
}
