export const CATEGORIES = ["equipamentos-hospitalares", "enfermagem-domicilio", "concreto", "andaimes", "ferramentas", "energia", "compactacao", "escavacao", "elevacao", "limpeza"] as const;
export type Category = (typeof CATEGORIES)[number];

/** Default store cover per category; files live in the web app's public/img. */
export function coverForCategory(id: string) {
  return coverFor[id as Category] ?? "/img/biz/loja.webp";
}

export const coverFor: Record<Category, string> = {
  concreto: "/img/biz/obra.webp",
  andaimes: "/img/biz/andaimes.webp",
  ferramentas: "/img/biz/loja.webp",
  energia: "/img/biz/galpao.webp",
  compactacao: "/img/biz/patio.webp",
  escavacao: "/img/biz/patio.webp",
  elevacao: "/img/biz/galpao.webp",
  limpeza: "/img/biz/loja.webp",
  "equipamentos-hospitalares": "/img/biz/hospitalar.webp",
  "enfermagem-domicilio": "/img/biz/enfermagem.webp",
};

export function fold(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export const toCents = (reais: number) => Math.round(reais * 100);
export const toReais = (cents: number) => cents / 100;

export function brl(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatPhone(digits: string) {
  return digits.length === 11 ? `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}` : digits;
}

/** Today's date in Brasília, as YYYY-MM-DD. */
export function todayInBrazil(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(now);
}

export function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function isValidCpf(value: string) {
  const d = value.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const check = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return check(9) === Number(d[9]) && check(10) === Number(d[10]);
}
