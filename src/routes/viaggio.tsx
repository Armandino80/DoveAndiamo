import { createFileRoute, Link } from "@tanstack/react-router";
import { cities } from "@/data/cities";
import { CityImage } from "@/components/CityImage";
export const Route = createFileRoute("/viaggio")({ component: Viaggio });
function hash(s: string) {
  return [...s].reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
}
function Viaggio() {
  const day = new Date().toISOString().slice(0, 10);
  const start = Math.abs(hash(day)) % cities.length;
  const trip = [
    cities[start],
    cities[(start + 7) % cities.length],
    cities[(start + 17) % cities.length],
  ];
  return (
    <main className="mx-auto max-w-5xl px-5 pb-28 pt-10">
      <p className="text-xs font-bold uppercase tracking-[.3em] text-olive">
        Tre tappe, una piccola avventura
      </p>
      <h1 className="mt-2 font-display text-5xl italic">Viaggio del giorno</h1>
      <p className="mt-3 text-muted-foreground">
        Iedere dag een nieuwe mini-reis door drie verrassende Italiaanse steden.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {trip.map((city, i) => (
          <Link
            key={city.id}
            to="/citta/$id"
            params={{ id: city.id }}
            className="group overflow-hidden rounded-3xl bg-card shadow-sm"
          >
            <CityImage
              src={city.image}
              name={city.name}
              alt={city.name}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-olive">
                Tappa {i + 1} · {city.region}
              </p>
              <h2 className="mt-1 font-display text-3xl font-semibold italic group-hover:text-primary">
                {city.name}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {city.facts[(start + i) % city.facts.length].title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
