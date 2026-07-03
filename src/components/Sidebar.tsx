import { NavigationPanel } from "@/src/components/NavigationPanel"

export function Sidebar() {
  return (
    <aside
      className="fixed left-0 top-0 z-40 hidden h-dvh w-64 flex-col border-r border-slate-800/80 bg-slate-950 text-slate-100 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.35)] md:flex"
      aria-label="Navegación principal"
    >
      <NavigationPanel className="min-h-0" />
    </aside>
  )
}
