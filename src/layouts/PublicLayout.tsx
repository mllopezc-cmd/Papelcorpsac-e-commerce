import { Outlet } from "react-router";
import { Header } from "../components/Header";

type PublicLayoutProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export function PublicLayout({ theme, onToggleTheme }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-page text-ink">
      <Header theme={theme} onToggleTheme={onToggleTheme} />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-line px-5 py-6 text-center text-xs tracking-wide text-muted sm:px-8">
        PAPEL CORP <span aria-hidden="true">·</span> Papelería para tus ideas
      </footer>
    </div>
  );
}
