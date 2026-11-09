import { MainNav } from "#components/main-nav.tsx";
import { ThemeToggle } from "#components/theme-toggle.tsx";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between gap-4">
        <MainNav />
        <ThemeToggle />
      </div>
    </header>
  );
}
