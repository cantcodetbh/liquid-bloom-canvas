import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { ArrowUpRight } from "lucide-react";

const LiquidSphere = lazy(() =>
  import("@/components/LiquidSphere").then((m) => ({ default: m.LiquidSphere })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "nodeyard — refracted portfolio" },
      {
        name: "description",
        content:
          "Selected projects by nodeyard: network tooling, macOS companions, film emulation, custom Linux shells and colour tools.",
      },
      { property: "og:title", content: "nodeyard — refracted portfolio" },
      {
        property: "og:description",
        content:
          "Selected projects by nodeyard: network tooling, macOS companions, film emulation, custom Linux shells and colour tools.",
      },
    ],
  }),
  component: Index,
});

type Project = {
  index: string;
  title: string;
  kind: string;
  description: string;
  tags: string[];
  href: string;
  cta: string;
};

const projects: Project[] = [
  {
    index: "01",
    title: "SHARE Atlas",
    kind: "Network tooling",
    description:
      "A Windows desktop network inventory and mapping tool for IT support teams, combining switch data, endpoint information, site scanning and infrastructure context into one searchable view.",
    tags: [".NET", "WPF", "Aruba", "MECM", "Active Directory"],
    href: "#",
    cta: "Internal tool",
  },
  {
    index: "02",
    title: "Daycast",
    kind: "Daily context",
    description:
      "A glanceable day-planning companion built around calendar visibility, upcoming events and calm context without turning your schedule into another noisy dashboard.",
    tags: ["macOS", "Widgets", "Calendar", "Swift", "Personal tools"],
    href: "https://github.com/cantcodetbh/Daycast",
    cta: "View project",
  },
  {
    index: "03",
    title: "FilmForge",
    kind: "Image processing",
    description:
      "A film-look photo processing experiment focused on colour response, grain, halation, bloom, softness and camera-specific imperfections rather than simple preset sliders.",
    tags: ["Film emulation", "Core Image", "Photography", "macOS"],
    href: "https://github.com/cantcodetbh/FilmForge",
    cta: "View project",
  },
  {
    index: "04",
    title: "Homeshell",
    kind: "Custom quickshell",
    description:
      "A custom desktop shell for my Arch Linux setup, built with Hyprland and Quickshell. Ambient corner bars, drawer controls, wallpaper-driven colours, workspace overview and system controls.",
    tags: ["Linux", "Quickshell", "Arch", "Hyprland"],
    href: "https://github.com/cantcodetbh/homeshell",
    cta: "View project",
  },
  {
    index: "05",
    title: "Paletteyard",
    kind: "Colour tooling",
    description:
      "A small browser-based palette builder for generating colour sets from a seed hex, saving local palettes and copying clean CSS variables or JSON exports.",
    tags: ["Palette generation", "CSS variables", "Local storage"],
    href: "https://palette.nodeyard.co.uk/",
    cta: "Open project",
  },
];

function Index() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.28 0.02 260 / 55%), transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      <Header />
      <Hero />
      <Work />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
      <a href="/" className="text-sm font-medium tracking-tight">
        nodeyard
      </a>
      <nav className="flex items-center gap-6 text-eyebrow">
        <a href="#work" className="hover:text-foreground transition-colors">
          Work
        </a>
        <a
          href="https://github.com/cantcodetbh"
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground transition-colors"
        >
          GitHub
        </a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-6 md:px-10">
      {/* Sphere absolutely centered behind wordmark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[70vmin] w-[70vmin] max-h-[720px] max-w-[720px] animate-float-slow">
          <Suspense fallback={null}>
            <LiquidSphere />
          </Suspense>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-10">
        <div className="flex items-center gap-3 text-eyebrow">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground" />
          Portfolio · MMXXVI
        </div>

        <h1 className="text-wordmark text-[22vw] leading-[0.82] md:text-[16vw] lg:text-[13rem]">
          nodeyard
        </h1>

        <div className="flex max-w-2xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
            Small, opinionated software — network tooling, macOS companions,
            film emulation, Linux shells. Built quietly, refracted through
            whatever the current obsession is.
          </p>
          <a
            href="#work"
            className="group inline-flex items-center gap-2 self-start rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent md:self-auto"
          >
            Enter the yard
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section
      id="work"
      className="relative mx-auto max-w-7xl px-6 pb-32 pt-24 md:px-10"
    >
      <div className="mb-16 flex items-end justify-between">
        <div>
          <div className="text-eyebrow mb-3">Selected work · 05</div>
          <h2 className="text-wordmark text-5xl md:text-7xl">Projects</h2>
        </div>
      </div>

      <ul className="flex flex-col gap-4">
        {projects.map((p) => (
          <ProjectRow key={p.index} project={p} />
        ))}
      </ul>
    </section>
  );
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <li>
      <a
        href={project.href}
        target={project.href.startsWith("http") ? "_blank" : undefined}
        rel="noreferrer"
        className="glass-panel group relative flex flex-col gap-6 overflow-hidden rounded-2xl p-6 transition-all hover:-translate-y-0.5 md:flex-row md:items-center md:gap-10 md:p-8"
      >
        {/* refraction highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(600px circle at var(--x,50%) var(--y,50%), oklch(1 0 0 / 6%), transparent 40%)",
          }}
        />

        <div className="font-mono text-xs text-muted-foreground md:w-10">
          {project.index}
        </div>

        <div className="flex-1">
          <div className="text-eyebrow mb-2">{project.kind}</div>
          <h3 className="text-wordmark text-3xl md:text-4xl">{project.title}</h3>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {project.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start text-sm font-medium md:self-center">
          <span className="hidden md:inline">{project.cta}</span>
          <span className="glass-panel flex h-11 w-11 items-center justify-center rounded-full transition-transform group-hover:rotate-45">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </a>
    </li>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-16 md:flex-row md:items-end md:px-10">
        <div>
          <div className="text-eyebrow mb-4">Hosted from nodeyard</div>
          <div className="text-wordmark text-6xl md:text-8xl">nodeyard</div>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <a
            href="https://github.com/cantcodetbh"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            github/cantcodetbh ↗
          </a>
          <a
            href="https://palette.nodeyard.co.uk/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            palette.nodeyard.co.uk ↗
          </a>
          <span>© {new Date().getFullYear()} nodeyard</span>
        </div>
      </div>
    </footer>
  );
}
