import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";

const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Dove andiamo oggi?" },
      { name: "description", content: "Ontdek Italiaanse steden, één verhaal tegelijk." },
      { name: "theme-color", content: "#9f4b32" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: publicAsset("manifest.webmanifest") },
      { rel: "icon", href: publicAsset("pwa-icon.svg"), type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,500;0,600;1,500;1,600&family=Karla:wght@400;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const nav = [
  ["/", "Scopri"],
  ["/mia-italia", "Mia Italia"],
  ["/passaporto", "Passaporto"],
  ["/viaggio", "Viaggio"],
  ["/non-ci-credo", "Non ci credo!"],
  ["/quiz", "Quiz"],
] as const;

function Header() {
  return (
    <header className="sticky top-0 z-20 flex min-h-14 items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur md:px-8">
      <Link to="/" className="font-display text-lg font-semibold italic">
        Dove andiamo oggi?
      </Link>
      <nav className="hidden flex-wrap justify-end gap-1 py-2 text-[.65rem] font-bold uppercase tracking-widest md:flex">
        {nav.map(([to, label]) => (
          <Link
            key={to}
            to={to}
            className="rounded-full px-3 py-1.5 text-muted-foreground"
            activeProps={{ className: "bg-primary text-primary-foreground" }}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <div className="mx-auto flex h-16 max-w-xl items-center gap-1 overflow-x-auto px-2 text-[.55rem] font-bold uppercase tracking-wide">
        {nav.map(([to, label]) => (
          <Link
            key={to}
            to={to}
            className="shrink-0 rounded-full px-3 py-2.5 text-muted-foreground"
            activeProps={{ className: "bg-primary text-primary-foreground" }}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

    void navigator.serviceWorker
      .register(publicAsset("sw.js"), { scope: import.meta.env.BASE_URL })
      .catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <Outlet />
      <MobileNav />
    </QueryClientProvider>
  );
}
