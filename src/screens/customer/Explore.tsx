import { useEffect, useMemo, useState } from "react";
import { ChevronDown, MapPin, Search, X } from "lucide-react";
import { errorMessage } from "../../lib/api.ts";
import { categories } from "../../lib/catalog.ts";
import { firstName, greeting } from "../../lib/format.ts";
import { useDesktop } from "../../lib/desktop.ts";
import { useNav } from "../../lib/nav.tsx";
import { actions, originOf, useDB, useMe, useNearby } from "../../lib/store.ts";
import { toast } from "../../lib/toast.ts";
import { AddressSheet } from "../../ui/AddressPicker.tsx";
import { BusinessCard, ItemCard, ListingRow } from "../../ui/cards.tsx";
import { Button, EmptyState, Img, SectionHeader } from "../../ui/controls.tsx";
import { Mascot } from "../../ui/Mascot.tsx";
import { Page } from "../../ui/Page.tsx";
import { ProfileButton } from "../shared/Profile.tsx";

export function AddressPill({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-full py-1 type-subhead font-semibold focus-visible:outline-2 focus-visible:outline-primary"
    >
      <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
      <span className="truncate">{label}</span>
      <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="sr-only">, trocar endereço</span>
    </button>
  );
}

export async function chooseAddress(address: Parameters<typeof actions.addAddress>[0]) {
  try {
    await actions.addAddress(address);
  } catch (error) {
    toast(errorMessage(error), "error");
  }
}

function LoadingCards() {
  return (
    <div aria-label="Carregando lojas perto de você">
      <div className="mt-8 mb-3 h-6 w-40 rounded-full shimmer" />
      <div className="-mx-4 flex gap-3 overflow-hidden px-4">
        {[0, 1].map((i) => (
          <div key={i} className="h-[240px] w-[282px] shrink-0 rounded-[26px] shimmer" />
        ))}
      </div>
      <div className="mt-8 mb-3 h-6 w-36 rounded-full shimmer" />
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aspect-[3/4] rounded-[24px] shimmer" />
        ))}
      </div>
    </div>
  );
}

export function Explore() {
  const desktop = useDesktop();
  const db = useDB();
  const me = useMe();
  const nav = useNav();
  const [addressOpen, setAddressOpen] = useState(false);
  useEffect(() => {
    const open = () => setAddressOpen(true);
    window.addEventListener("obra:address", open);
    return () => window.removeEventListener("obra:address", open);
  }, []);
  const origin = originOf(db, me);
  const { status, near, all, reload } = useNearby(origin);
  const popular = useMemo(
    () =>
      all
        .filter((l) => l.item.available)
        .sort((a, b) => b.item.rentals - a.item.rentals || a.km - b.km)
        .filter((l, index, list) => list.findIndex((x) => x.item.name === l.item.name) === index)
        .slice(0, 6),
    [all],
  );

  return (
    <Page title={desktop ? "Equipamentos para alugar" : "Explorar"} actions={<ProfileButton />}>
      <AddressPill label={origin.label} onClick={() => setAddressOpen(true)} />
      <button
        type="button"
        onClick={() => nav.push("search")}
        className="mt-3 flex h-11 w-full cursor-pointer items-center gap-2 rounded-full bg-card px-4 text-left text-subtle elev-1 transition-transform active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-primary"
      >
        <Search className="size-[18px] text-muted-foreground" aria-hidden="true" />
        <span className="type-body">Buscar aluguel ou serviço</span>
      </button>

      <div className="-mx-4 mt-5 flex snap-x gap-1 overflow-x-auto px-3 pb-1 lg:hidden">
        {categories.map((category, index) => (
          <button
            key={category.id}
            type="button"
            onClick={() => nav.push("search", { category: category.id })}
            className="anim-rise flex w-[96px] shrink-0 cursor-pointer snap-start flex-col items-center gap-1.5 transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-primary"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <Img src={category.image} alt="" className="size-[68px] rounded-full ring-1 ring-border" />
            <span className="line-clamp-2 min-h-8 w-full text-center type-caption font-semibold leading-tight">{category.label}</span>
          </button>
        ))}
      </div>

      {!desktop && !me.tipDismissed ? (
        <div className="anim-rise relative mt-6 flex items-center gap-2 overflow-hidden rounded-[26px] bg-card py-2 pr-11 pl-1">
          <Mascot mood="wave" size={70} className="shrink-0" />
          <div className="min-w-0">
            <p className="type-headline">
              {greeting()}, {firstName(me.name)}!
            </p>
            <p className="type-subhead text-muted-foreground">Escolha o endereço da obra e veja as locadoras que entregam aí.</p>
          </div>
          <button
            type="button"
            aria-label="Fechar dica"
            onClick={() => void actions.updateAccount({ tipDismissed: true }).catch(() => {})}
            className="absolute top-2 right-2 grid size-9 cursor-pointer place-items-center rounded-full text-subtle active:bg-muted"
          >
            <X className="size-[18px]" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {status === "loading" ? (
        <LoadingCards />
      ) : status === "error" ? (
        <EmptyState
          mood="sad"
          title="Não deu para carregar"
          text="Confira a internet e tente de novo."
          action={
            <Button size="md" onClick={reload}>
              Tentar de novo
            </Button>
          }
        />
      ) : near.length === 0 ? (
        <EmptyState
          mood="sad"
          title="Nenhuma locadora por perto ainda"
          text="Ainda não há lojas cadastradas perto desse endereço. Tente outro bairro ou volte em breve."
          action={
            <Button size="md" onClick={() => setAddressOpen(true)}>
              Trocar endereço
            </Button>
          }
        />
      ) : (
        <>
          <SectionHeader title="Perto de você" action={{ label: "Ver mapa", onClick: () => nav.switchTab("map") }} />
          <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 xl:grid-cols-3">
            {near.slice(0, 8).map(({ business, km }) => (
              <BusinessCard key={business.id} business={business} km={km} onClick={() => nav.push("business", { id: business.id })} />
            ))}
          </div>

          {popular.length ? (
            <>
              <SectionHeader title={popular.some((l) => l.item.rentals > 0) ? "Mais alugados" : "Para alugar agora"} />
              <div className="hidden overflow-hidden rounded-[22px] border border-border bg-card lg:block">
                {popular.map((listing) => (
                  <ListingRow
                    key={listing.item.id}
                    item={listing.item}
                    business={listing.business}
                    km={listing.km}
                    onClick={() => nav.push("item", { id: listing.item.id })}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 lg:hidden">
                {popular.map((listing) => (
                  <ItemCard key={listing.item.id} listing={listing} onClick={() => nav.push("item", { id: listing.item.id })} />
                ))}
              </div>
            </>
          ) : null}
        </>
      )}

      <AddressSheet open={addressOpen} onClose={() => setAddressOpen(false)} saved={me.addresses} title="Onde fica a obra?" onSelect={(address) => void chooseAddress(address)} />
    </Page>
  );
}
