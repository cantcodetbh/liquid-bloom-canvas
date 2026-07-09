import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef } from "react";
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
          "A WebGL application that redesigns a portfolio website with liquid distortion and refraction effects.",
      },
      { property: "og:title", content: "nodeyard — refracted portfolio" },
      {
        property: "og:description",
        content:
          "A WebGL application that redesigns a portfolio website with liquid distortion and refraction effects.",
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
  bg: string;
  fg: string;
  accent: string;
  chipBorder: string;
  noise: string;
};

const buildGrainSvg = (colour: string) =>
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" viewBox="0 0 260 260"><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="1.28" numOctaves="3" seed="9" stitchTiles="stitch" result="noise"/><feColorMatrix in="noise" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 4.4 -2.05" result="specks"/><feComposite in="SourceGraphic" in2="specks" operator="in"/></filter><rect width="260" height="260" fill="${colour}" filter="url(#grain)"/></svg>`,
  );

const HERO_GRAIN = "rgba(6, 54, 45, 0.84)";
const FOOTER_GRAIN = "rgba(246, 240, 230, 0.18)";

const projects: Project[] = [
  {
    index: "01",
    title: "SHARE Atlas",
    kind: "Network tooling",
    description:
      "Windows desktop network inventory and mapping for IT support — switch data, endpoints, site scans and infrastructure context in one searchable view.",
    tags: [".NET", "WPF", "Aruba", "MECM", "AD"],
    href: "#",
    cta: "Internal tool",
    bg: "bg-[#2E0A17]",
    fg: "text-[#F6F0E6]",
    accent: "text-[#E3738D]",
    chipBorder: "border-[#F6F0E6]/25",
    noise: "rgba(8, 1, 5, 0.72)",
  },
  {
    index: "02",
    title: "Daycast",
    kind: "Daily context",
    description:
      "A glanceable day-planning companion — calendar visibility and upcoming events, calm context without turning your schedule into another noisy dashboard.",
    tags: ["macOS", "Widgets", "Calendar", "Swift"],
    href: "https://github.com/cantcodetbh/Daycast",
    cta: "View project",
    bg: "bg-[#821C16]",
    fg: "text-[#F6F0E6]",
    accent: "text-[#E3738D]",
    chipBorder: "border-[#F6F0E6]/25",
    noise: "rgba(42, 7, 5, 0.66)",
  },
  {
    index: "03",
    title: "FilmForge",
    kind: "Image processing",
    description:
      "Film-look photo processing built around colour response, grain, halation, bloom and camera-specific imperfections — not just preset sliders.",
    tags: ["Core Image", "Emulation", "Photography", "macOS"],
    href: "https://github.com/cantcodetbh/FilmForge",
    cta: "View project",
    bg: "bg-[#BD5D26]",
    fg: "text-[#2E0A17]",
    accent: "text-[#2E0A17]",
    chipBorder: "border-[#2E0A17]/30",
    noise: "rgba(86, 34, 9, 0.58)",
  },
  {
    index: "04",
    title: "Homeshell",
    kind: "Custom quickshell",
    description:
      "A custom desktop shell for my Arch/Hyprland setup — ambient corner bars, drawer controls, wallpaper-driven colours, workspace overview and system controls.",
    tags: ["Linux", "Quickshell", "Arch", "Hyprland"],
    href: "https://github.com/cantcodetbh/homeshell",
    cta: "View project",
    bg: "bg-[#D9A73D]",
    fg: "text-[#2E0A17]",
    accent: "text-[#821C16]",
    chipBorder: "border-[#2E0A17]/30",
    noise: "rgba(126, 82, 13, 0.5)",
  },
  {
    index: "05",
    title: "Paletteyard",
    kind: "Colour tooling",
    description:
      "A browser-based palette builder — generate colour sets from a seed hex, save local palettes and copy clean CSS variables or JSON exports.",
    tags: ["Palettes", "CSS vars", "Local storage"],
    href: "https://palette.nodeyard.co.uk/",
    cta: "Open project",
    bg: "bg-[#F6F0E6]",
    fg: "text-[#2E0A17]",
    accent: "text-[#BD5D26]",
    chipBorder: "border-[#2E0A17]/30",
    noise: "rgba(166, 142, 100, 0.62)",
  },
];

function grainTexture(
  colour: string,
  maskImage: string,
  backgroundPosition = "left top, 0 0, 3px 5px",
) {
  const grainSvg = buildGrainSvg(colour);

  return {
    backgroundImage: `url("data:image/svg+xml,${grainSvg}"), radial-gradient(circle, ${colour} 0 0.34px, transparent 0.54px), radial-gradient(circle, ${colour} 0 0.24px, transparent 0.42px)`,
    backgroundPosition,
    backgroundRepeat: "repeat",
    backgroundSize: "260px 260px, 4px 4px, 7px 7px",
    maskImage,
    WebkitMaskImage: maskImage,
  };
}

function Index() {
  return (
    <div className="relative h-screen w-full snap-y snap-mandatory overflow-x-hidden overflow-y-auto overscroll-y-contain scroll-smooth bg-[#2D9B83] text-[#F6F0E6]">
      {/* film grain */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      <CursorFollower />

      <section id="hero" className="relative min-h-screen snap-start snap-always overflow-visible">
        <Header />
        <Hero />
      </section>
      <Work />
      <Footer />
    </div>
  );
}

function CursorFollower() {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (coarsePointer || prefersReducedMotion) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let previousX = currentX;
    let previousY = currentY;
    let angle = 0;
    let rafId = 0;
    let hasEntered = false;

    const moveCursor = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;

      if (!hasEntered) {
        hasEntered = true;
        currentX = targetX;
        currentY = targetY;
        previousX = currentX;
        previousY = currentY;
        cursor.style.opacity = "1";
      }
    };

    const hideCursor = () => {
      cursor.style.opacity = "0";
      hasEntered = false;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.24;
      currentY += (targetY - currentY) * 0.24;

      const velocityX = currentX - previousX;
      const velocityY = currentY - previousY;
      const speed = Math.hypot(velocityX, velocityY);

      if (speed > 0.18) {
        angle = Math.atan2(velocityY, velocityX) * (180 / Math.PI);
      }

      const stretch = Math.min(1 + speed * 0.022, 1.62);
      const squash = Math.max(1 - speed * 0.006, 0.84);
      const size = 34;

      cursor.style.transform = `translate3d(${currentX - size / 2}px, ${currentY - size / 2}px, 0) rotate(${angle}deg) scale(${stretch}, ${squash})`;

      previousX = currentX;
      previousY = currentY;
      rafId = window.requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", moveCursor, { passive: true });
    window.addEventListener("pointerleave", hideCursor);
    window.addEventListener("blur", hideCursor);
    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", moveCursor);
      window.removeEventListener("pointerleave", hideCursor);
      window.removeEventListener("blur", hideCursor);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[80] hidden h-[34px] w-[34px] rounded-full bg-white opacity-0 mix-blend-difference transition-opacity duration-200 will-change-transform md:block"
    />
  );
}

function Header() {
  return (
    <header className="relative z-40 isolate flex items-center justify-between px-6 py-6 md:px-10">
      <a
        href="/"
        className="text-wordmark relative z-10 text-2xl tracking-[-0.05em]"
      >
        nodeyard
      </a>
      <nav className="text-eyebrow relative z-10 flex items-center gap-8">
        <a href="#work" className="transition-colors hover:text-[#E3738D]">
          Work
        </a>
        <a
          href="https://github.com/cantcodetbh"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-[#E3738D]"
        >
          GitHub
        </a>
        <a
          href="https://palette.nodeyard.co.uk/"
          target="_blank"
          rel="noreferrer"
          className="hidden transition-colors hover:text-[#E3738D] md:inline"
        >
          Palette
        </a>
      </nav>
    </header>
  );
}

function HeroGrainField() {
  const heroNoiseTexture = grainTexture(
    HERO_GRAIN,
    "linear-gradient(to bottom, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.4) 14%, rgba(0,0,0,0.26) 32%, rgba(0,0,0,0.26) 68%, rgba(0,0,0,0.4) 86%, rgba(0,0,0,0.58) 100%)",
    "left top, 0 0, 3px 5px",
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-[-1px] top-[-96px] z-[25]"
      style={heroNoiseTexture}
    />
  );
}

function Hero() {
  return (
    <section className="relative z-20 isolate flex min-h-[calc(100svh-76px)] flex-col justify-between overflow-visible px-6 pb-14 pt-2 md:px-10 md:pb-20">
      {/* Canvas: 3D "nodeyard" wordmark refracted through the transparent sphere */}
      <div className="pointer-events-none absolute inset-x-0 -top-24 -bottom-32 z-20 flex items-center justify-center overflow-visible">
        <div
          className="relative"
          style={{ width: "100vw", height: "min(820px, 86vh)" }}
        >
          <Suspense fallback={null}>
            <LiquidSphere />
          </Suspense>
        </div>
      </div>

      <HeroGrainField />

      {/* Top-left eyebrow */}
      <div className="text-eyebrow relative z-30 flex items-center gap-3 pt-6">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#E3738D]" />
        Portfolio · MMXXVI · v03
      </div>

      {/* Bottom row: intro + CTA */}
      <div className="relative z-30 grid w-full max-w-6xl gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <p className="max-w-md font-mono text-sm leading-relaxed text-[#F6F0E6]/85 md:text-base">
          <span className="text-[#E3738D]">[00]</span> Small, opinionated
          software by <span className="text-[#F6F0E6]">nodeyard</span> — network
          tooling, macOS companions, film emulation, Linux shells, colour
          tools. Built quietly, refracted through whatever the current
          obsession is.
        </p>
        <a
          href="#work"
          className="text-eyebrow group inline-flex items-center gap-3 self-start rounded-full border border-[#F6F0E6]/40 px-5 py-3 transition-colors hover:border-[#E3738D] hover:text-[#E3738D] md:self-auto"
        >
          Enter the yard
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section id="work" className="relative z-10 flex w-full snap-start snap-always scroll-mt-0 flex-col">
      <div className="flex items-end justify-between border-t border-[#F6F0E6]/20 px-6 py-6 md:px-10">
        <div className="text-eyebrow">Selected work · 05</div>
        <div className="text-eyebrow hidden md:block">
          Hover a slice to open ↓
        </div>
      </div>

      {/* Slice strip */}
      <div className="flex h-[calc(100svh-73px)] min-h-[520px] w-full border-t border-[#F6F0E6]/20 md:min-h-[580px]">
        {projects.map((p) => (
          <Slice key={p.index} project={p} />
        ))}
      </div>
    </section>
  );
}

function Slice({ project: p }: { project: Project }) {
  const isExternal = p.href.startsWith("http");
  const speckleTexture = grainTexture(
    p.noise,
    "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.96) 16%, rgba(0,0,0,0.68) 38%, rgba(0,0,0,0.3) 62%, transparent 100%)",
    "right top, 0 0, 3px 5px",
  );

  return (
    <a
      href={p.href}
      target={isExternal ? "_blank" : undefined}
      rel="noreferrer"
      className={`group relative flex-[1] cursor-pointer overflow-hidden border-r border-[#F6F0E6]/20 transition-[flex-grow] duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] last:border-r-0 hover:flex-[6] ${p.bg} ${p.fg}`}
    >
      {/* Dense darker grain that blooms in from the right on hover. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={speckleTexture}
      />

      {/* Index number at top */}
      <div
        className={`absolute left-6 top-6 font-mono text-xs opacity-70 transition-opacity duration-500 ${p.accent}`}
      >
        {p.index}
      </div>

      {/* Rotated title (collapsed state) */}
      <div className="absolute left-1/2 top-20 -translate-x-1/2 transition-all duration-700 group-hover:left-10 group-hover:top-14 group-hover:translate-x-0 md:group-hover:top-16">
        <h3 className="text-wordmark origin-left rotate-90 whitespace-nowrap text-3xl transition-all duration-700 group-hover:rotate-0 group-hover:text-5xl md:group-hover:text-6xl">
          {p.title}
        </h3>
      </div>

      {/* Expanded detail */}
      <div className="pointer-events-none flex h-full flex-col justify-center overflow-y-auto p-6 pt-28 opacity-0 transition-opacity duration-500 delay-200 group-hover:pointer-events-auto group-hover:opacity-100 md:p-10 md:pt-32">
        <span className={`text-eyebrow mb-4 ${p.accent}`}>
          {p.index} / {p.kind}
        </span>
        <p className="mb-6 max-w-md text-lg font-medium leading-snug md:text-xl">
          {p.description}
        </p>
        <div className="mb-8 flex flex-wrap gap-2">
          {p.tags.map((t) => (
            <span
              key={t}
              className={`rounded-full border ${p.chipBorder} px-3 py-1 font-mono text-[10px] uppercase tracking-widest`}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest">
          <span>{p.cta}</span>
          <span className={`h-px w-10 ${p.fg === "text-[#F6F0E6]" ? "bg-[#F6F0E6]" : "bg-[#2E0A17]"} transition-all duration-500 group-hover:w-20`} />
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
    </a>
  );
}

function Footer() {
  const footerNoiseTexture = grainTexture(
    FOOTER_GRAIN,
    "linear-gradient(rgba(0,0,0,0.42), rgba(0,0,0,0.42))",
  );

  return (
    <footer className="relative z-10 isolate snap-start snap-always overflow-hidden border-t border-[#F6F0E6]/20 bg-[#0f0308]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={footerNoiseTexture}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-start justify-between gap-10 px-6 py-16 md:flex-row md:items-end md:px-10">
        <div>
          <div className="text-eyebrow mb-4 text-[#E3738D]">
            Hosted from nodeyard
          </div>
          <div className="text-wordmark text-6xl md:text-9xl chromatic-shadow">
            nodeyard
          </div>
        </div>
        <div className="flex flex-col gap-2 font-mono text-xs uppercase tracking-widest text-[#F6F0E6]/80">
          <a
            href="https://github.com/cantcodetbh"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-[#E3738D]"
          >
            github/cantcodetbh ↗
          </a>
          <a
            href="https://palette.nodeyard.co.uk/"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-[#E3738D]"
          >
            palette.nodeyard.co.uk ↗
          </a>
          <span className="opacity-60">
            © {new Date().getFullYear()} nodeyard · Manchester
          </span>
        </div>
      </div>
    </footer>
  );
}
