import type { LucideIcon } from "lucide-react";
import { CircleDollarSign, MapPin, Search } from "lucide-react";
import { categories } from "../lib/catalog.ts";
import { firstName } from "../lib/format.ts";
import { useNav, type Route } from "../lib/nav.tsx";
import { originOf, useDB, useMe } from "../lib/store.ts";
import type { TabDef } from "./TabBar.tsx";
import { Avatar } from "./controls.tsx";

export function DesktopNav({
  layout,
  tabs,
  tab,
  route,
}: {
  layout: "market" | "saas";
  tabs: TabDef[];
  tab: string;
  route: Route;
}) {
  const nav = useNav();
  const db = useDB();
  const me = useMe();
  const saas = layout === "saas";
  const origin = originOf(db, me);
  const profileOn = route.name === "profile" || route.name === "editProfile" || route.name === "addresses" || route.name === "saved";

  function openProfile() {
    if (profileOn) return;
    nav.push("profile");
  }

  return (
    <aside
      className={`hidden h-full shrink-0 flex-col lg:flex ${
        saas ? "w-[260px] bg-[#10131a] text-white" : "w-[300px] border-r border-border bg-card text-foreground"
      }`}
    >
      <div className={`flex items-center gap-2.5 px-4 ${saas ? "pt-5 pb-4" : "pt-5 pb-4"}`}>
        <img src="/img/logo-mark.png?v=10" alt="" className="size-9 shrink-0 rounded-[10px] object-cover" />
        <div className="min-w-0">
          <p className={`truncate text-[18px] font-semibold tracking-[-0.03em] ${saas ? "text-white" : ""}`}>Obi Ágil</p>
          {saas ? <p className="truncate text-[13px] text-white/55">{db.business?.name ?? "Sua loja"}</p> : null}
        </div>
      </div>

      {saas ? null : (
        <>
          <button
            type="button"
            onClick={() => nav.switchTab("explore", { name: "search" })}
            className="mx-3 mb-2 flex h-11 cursor-pointer items-center gap-2 rounded-full bg-muted px-4 text-left text-subtle transition-transform active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-primary"
          >
            <Search className="size-[18px]" aria-hidden="true" />
            <span className="type-subhead">Buscar aluguel ou serviço</span>
          </button>
          <button
            type="button"
            onClick={() => {
              nav.switchTab("explore");
              window.dispatchEvent(new Event("obra:address"));
            }}
            className="mx-3 mb-3 flex cursor-pointer items-center gap-2 rounded-2xl px-2 py-1.5 text-left focus-visible:outline-2 focus-visible:outline-primary"
          >
            <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block truncate type-footnote font-semibold">{origin.label}</span>
              <span className="block type-caption text-muted-foreground">Trocar endereço</span>
            </span>
          </button>
        </>
      )}

      <nav aria-label={saas ? "Seções da loja" : "Seções"} className="flex flex-col gap-0.5 px-2">
        {tabs.map((item) => (
          <NavButton
            key={item.id}
            saas={saas}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            selected={!profileOn && route.name !== "finance" && tab === item.id}
            onClick={() => nav.switchTab(item.id)}
          />
        ))}
        {saas ? (
          <NavButton
            saas
            icon={CircleDollarSign}
            label="Balanço"
            selected={route.name === "finance"}
            onClick={() => {
              if (route.name === "finance") return;
              nav.switchTab("dashboard", { name: "finance" });
            }}
          />
        ) : null}
      </nav>

      {saas ? (
        <div className="min-h-0 flex-1" />
      ) : (
        <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          <p className="px-2 pt-1 pb-1.5 type-caption font-semibold tracking-[0.08em] text-subtle uppercase">Categorias</p>
          {categories.map((category) => {
            const selected = route.name === "search" && route.params.category === category.id;
            return (
              <button
                key={category.id}
                type="button"
                aria-current={selected ? "page" : undefined}
                onClick={() => nav.switchTab("explore", { name: "search", params: { category: category.id } })}
                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                  selected ? "bg-tint text-primary" : "hover:bg-muted"
                }`}
              >
                <img src={category.image} alt="" className="size-9 rounded-full object-cover ring-1 ring-border" />
                <span className="line-clamp-2 type-subhead font-semibold leading-tight">{category.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={openProfile}
        aria-current={profileOn ? "page" : undefined}
        className={`flex cursor-pointer items-center gap-3 border-t px-3 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary ${
          saas ? "border-white/10 hover:bg-white/5" : "border-border hover:bg-muted"
        } ${profileOn ? (saas ? "bg-white/10" : "bg-tint") : ""}`}
      >
        <Avatar name={me.name} src={me.photo} size={36} />
        <span className="min-w-0 flex-1">
          <span className={`block truncate type-subhead font-semibold ${saas ? "" : ""}`}>{firstName(me.name)}</span>
          <span className={`block type-caption ${saas ? "text-white/50" : "text-muted-foreground"}`}>Perfil e conta</span>
        </span>
      </button>
    </aside>
  );
}

function NavButton({
  saas,
  icon: Icon,
  label,
  badge,
  selected,
  onClick,
}: {
  saas: boolean;
  icon: LucideIcon;
  label: string;
  badge?: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-current={selected ? "page" : undefined}
      onClick={onClick}
      className={`flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left type-subhead font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
        saas
          ? selected
            ? "bg-white text-[#10131a]"
            : "text-white/80 hover:bg-white/10"
          : selected
            ? "bg-tint text-primary"
            : "hover:bg-muted"
      }`}
    >
      <Icon className="size-5 shrink-0" strokeWidth={selected ? 2.3 : 1.9} aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge ? (
        <span
          className={`grid h-[20px] min-w-[20px] place-items-center rounded-full px-1 type-caption font-semibold text-white ${
            saas && selected ? "bg-[#10131a]" : "bg-badge"
          }`}
        >
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </button>
  );
}
