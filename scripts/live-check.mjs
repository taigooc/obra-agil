import { catalogCategories, catalogTemplates } from "../server/catalog/data.ts";

const base = process.env.LIVE_API ?? "https://web-production-2e86b679.up.railway.app";
const failures = [];
function check(name, ok, detail = "") {
  console.log(`${ok ? "ok" : "FAIL"} ${name}${detail ? " " + detail : ""}`);
  if (!ok) failures.push(name);
}

async function get(path) {
  const response = await fetch(base + path, { headers: { accept: "application/json" } });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text.slice(0, 120);
  }
  return { status: response.status, body };
}

const health = await get("/api/health");
check("health and database", health.status === 200 && health.body?.ok === true && health.body?.db === true, JSON.stringify(health.body));

const stats = await get("/api/catalog/stats");
check("catalog stats", stats.status === 200, JSON.stringify(stats.body));
check(
  "category count matches the source catalog",
  stats.body?.categories === catalogCategories.length &&
    stats.body?.product_categories === catalogCategories.filter((c) => c.kind === "product").length &&
    stats.body?.service_categories === catalogCategories.filter((c) => c.kind === "service").length,
  `live ${stats.body?.categories}/${stats.body?.product_categories}/${stats.body?.service_categories} source ${catalogCategories.length}`,
);
check(
  "template count matches the source catalog",
  stats.body?.templates === catalogTemplates.length,
  `live ${stats.body?.templates} source ${catalogTemplates.length}`,
);

const live = [];
for (let offset = 0; offset < 400; offset += 100) {
  for (const kind of ["product", "service"]) {
    const page = await get(`/api/catalog/categories?kind=${kind}&limit=100&offset=${offset}`);
    if (page.status !== 200) {
      check(`categories page ${kind} ${offset}`, false, String(page.status));
      continue;
    }
    live.push(...page.body.categories);
  }
}
const liveIds = new Set(live.map((c) => c.id));
const sourceIds = new Set(catalogCategories.map((c) => c.id));
const missing = [...sourceIds].filter((id) => !liveIds.has(id));
const extra = [...liveIds].filter((id) => !sourceIds.has(id));
const renamed = catalogCategories.filter((c) => {
  const found = live.find((item) => item.id === c.id);
  return found && (found.name !== c.name || found.kind !== c.kind);
});
check("every source category is on Railway", missing.length === 0, missing.slice(0, 8).join(","));
check("Railway has no extra categories", extra.length === 0, extra.slice(0, 8).join(","));
check("category names and kinds match", renamed.length === 0, renamed.slice(0, 3).map((c) => c.id).join(","));
check("no duplicate category ids", liveIds.size === live.length, `${live.length} rows ${liveIds.size} ids`);

const torneira = await get("/api/catalog/templates?q=torneira&kind=service&limit=10");
check("search torneira finds a plumbing service", torneira.status === 200 && torneira.body.templates.some((t) => /torneira/i.test(t.name)));
const furadeira = await get("/api/catalog/templates?q=furadeira&kind=product&limit=10");
check("search furadeira ignores the need for an exact category", furadeira.status === 200 && furadeira.body.templates.length > 0);
const accent = await get("/api/catalog/templates?q=instalacao&kind=service&limit=5");
check("search without accents finds instalação", accent.status === 200 && accent.body.templates.length > 0);

const explore = await get("/api/explore?lat=-1.2935&lng=-47.9232");
check("Castanhal explore returns stores", explore.status === 200 && explore.body.businesses.length === 5 && explore.body.items.length === 18, `${explore.body?.businesses?.length} stores ${explore.body?.items?.length} items`);
const search = await get("/api/search?lat=-1.2935&lng=-47.9232&q=betoneira&sort=near");
check("betoneira search finds a rental", search.status === 200 && search.body.results.some((r) => /betoneira/i.test(r.item.name)));
const kind = await get("/api/search?lat=-1.2935&lng=-47.9232&kind=service&sort=near");
check("service filter does not invent listings", kind.status === 200 && kind.body.results.length === 0, `results ${kind.body?.results?.length}`);

const home = await fetch(base + "/");
const html = await home.text();
check("homepage is Obi Ágil", home.status === 200 && html.includes("<title>Obi Ágil</title>"));
const docs = await fetch(base + "/docs");
check("docs page is served", docs.status === 200 && (await docs.text()).includes('src="/assets/'));
const openapi = await get("/api/openapi.json");
check("openapi lists the routes", openapi.status === 200 && Object.keys(openapi.body.paths).length > 40, `${Object.keys(openapi.body?.paths ?? {}).length} paths`);

const config = await get("/api/config");
check("payments, sms and email are enabled", config.body?.payments?.enabled === true && config.body?.sms?.mode === "twilio" && config.body?.email?.mode === "smtp");

const sample = ["games-playstation", "bicicletas-bicicleta-urbana", "pintores-pintura-de-parede", "bebe-berco"];
let photosOk = 0;
for (const id of sample) {
  const photo = await fetch(`${base}/img/catalog/${id}.webp`);
  if (photo.status === 200) photosOk += 1;
}
check("sample catalog photos load", photosOk === sample.length, `${photosOk}/${sample.length}`);

const bad = await fetch(base + "/api/auth/register", {
  method: "POST",
  headers: { "content-type": "application/json", "x-requested-with": "obra-agil" },
  body: JSON.stringify({
    role: "customer",
    name: "Teste Invalido",
    document: "11111111111",
    address: { label: "Rua 1", detail: "Centro", lat: -1.29, lng: -47.92 },
    email: "nao-criar-obi@example.com",
    password: "senha-forte-123",
  }),
});
const badBody = await bad.json();
check("invalid CPF is rejected and no account is created", bad.status === 400 && badBody.error?.code === "invalid_cpf", badBody.error?.code);

console.log(failures.length ? `FAILED ${failures.length}` : "ALL CHECKS PASSED");
process.exit(failures.length ? 1 : 0);
