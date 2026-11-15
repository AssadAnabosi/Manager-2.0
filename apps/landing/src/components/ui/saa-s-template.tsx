import React from "react";
import { ArrowRight, Menu, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

const REPO_URL = "https://github.com/AssadAnabosi/Workbench";
// Hosted as a GitHub release asset so the 2 MB video stays out of git history.
const VIDEO_URL =
  "https://github.com/AssadAnabosi/Workbench/releases/download/landing-assets/brag.mp4";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: `${REPO_URL}/tree/main/docs`, label: "Documentation" },
  { href: REPO_URL, label: "GitHub" },
];

const FEATURES = [
  "Bills & payees",
  "Workers' logs",
  "Cheques",
  "Installable PWA",
  "Open source (MIT)",
];

// The CTA is a real link (opens GitHub), styled as a button.
const StarLink = ({
  className,
  size = "sm",
  children,
}: {
  className?: string;
  size?: "sm" | "lg";
  children: React.ReactNode;
}) => (
  <a
    href={REPO_URL}
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none",
      size === "lg" ? "h-12 px-8 text-base" : "h-10 px-5 text-sm",
      className
    )}
  >
    {children}
  </a>
);

// Navigation Component
const Navigation = React.memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-800/50 bg-black/80 backdrop-blur-md">
      <nav className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold text-white">Workbench</div>

          <div className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <StarLink className="bg-white text-black hover:bg-gray-100">
              <Star size={16} />
              Star on GitHub
            </StarLink>
          </div>

          <button
            type="button"
            className="text-white md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="animate-slide-down border-t border-gray-800/50 bg-black/95 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-4 px-6 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="py-2 text-sm text-white/60 transition-colors hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 border-t border-gray-800/50 pt-4">
              <StarLink className="bg-white text-black hover:bg-gray-100">
                <Star size={16} />
                Star on GitHub
              </StarLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
});

Navigation.displayName = "Navigation";

// Hero Component
const Hero = React.memo(() => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Browsers only allow sound after a user gesture, so the video starts
  // muted and turns its sound on at the first click, tap or key press.
  React.useEffect(() => {
    const unmute = () => {
      if (videoRef.current) videoRef.current.muted = false;
    };
    const events = ["pointerdown", "keydown"] as const;
    events.forEach((e) => window.addEventListener(e, unmute, { once: true }));
    return () => events.forEach((e) => window.removeEventListener(e, unmute));
  }, []);

  return (
    <section className="animate-fade-in relative flex min-h-screen flex-col items-center justify-start px-6 py-20 md:py-24">
      <aside className="mt-8 mb-8 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-gray-700 bg-gray-800/50 px-4 py-2 backdrop-blur-sm">
        <span className="text-center text-xs whitespace-nowrap text-gray-400">
          Free and open source
        </span>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs whitespace-nowrap text-gray-400 transition-all hover:text-white active:scale-95"
          aria-label="View the source on GitHub"
        >
          View the source
          <ArrowRight size={12} />
        </a>
      </aside>

      <h1
        className="mb-6 max-w-3xl px-6 text-center text-4xl leading-tight font-medium md:text-5xl lg:text-6xl"
        style={{
          background:
            "linear-gradient(to bottom, #ffffff, #ffffff, rgba(255, 255, 255, 0.6))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "-0.05em",
        }}
      >
        Run your family workshop
        <br />
        without the paperwork
      </h1>

      <p className="mb-8 max-w-2xl px-6 text-center text-sm text-gray-400 md:text-base">
        Workbench is a PWA that digitalizes a workshop's data: bills, workers'
        logs, payees, cheques and more.
      </p>

      <ul id="features" className="mb-10 flex max-w-2xl flex-wrap items-center justify-center gap-2 px-6">
        {FEATURES.map((feature) => (
          <li
            key={feature}
            className="rounded-full border border-gray-800 bg-gray-900/60 px-3 py-1 text-xs text-gray-300"
          >
            {feature}
          </li>
        ))}
      </ul>

      <div className="relative z-10 mb-16 flex items-center gap-4">
        <StarLink
          size="lg"
          className="rounded-lg bg-gradient-to-b from-white via-white/95 to-white/60 text-black hover:scale-105 active:scale-95"
        >
          <Star size={18} />
          Star on GitHub
        </StarLink>
      </div>

      <div className="relative w-full max-w-5xl pb-20">
        <div
          className="pointer-events-none absolute inset-x-[5%] -top-10 z-0 h-2/3 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative z-10">
          <video
            ref={videoRef}
            src={VIDEO_URL}
            poster="/brag.jpg"
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
            controlsList="nodownload noremoteplayback"
            className="pointer-events-none h-auto w-full rounded-lg border border-gray-800 shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";

// Main Component
export default function Component() {
  return (
    <main className="min-h-screen bg-black font-sans text-white">
      <Navigation />
      <Hero />
    </main>
  );
}
