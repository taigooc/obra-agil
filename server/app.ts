import { existsSync } from "node:fs";
import { join } from "node:path";
import cookieParser from "cookie-parser";
import express, { type ErrorRequestHandler, type RequestHandler } from "express";
import helmet from "helmet";
import multer from "multer";
import { config } from "./config.ts";
import { HttpError, notFound } from "./lib/errors.ts";
import { apiLimiter } from "./lib/limits.ts";
import { buildOpenApi } from "./lib/openapi.ts";
import { mount, type AnyRoute } from "./lib/route.ts";
import { authRoutes } from "./routes/auth.ts";
import { businessRoutes } from "./routes/business.ts";
import { catalogRoutes } from "./routes/catalog.ts";
import { exploreRoutes } from "./routes/explore.ts";
import { meRoutes } from "./routes/me.ts";
import { metaRoutes } from "./routes/meta.ts";
import { orderRoutes } from "./routes/orders.ts";
import { paymentRoutes, testRoutes } from "./routes/payments.ts";
import { uploadRoutes, uploadsDir } from "./routes/uploads.ts";
import { apiHome } from "./pages/api-home.ts";
import { fakeGateway } from "./services/payments.ts";

export const routes: AnyRoute[] = [
  ...metaRoutes,
  ...authRoutes,
  ...meRoutes,
  ...exploreRoutes,
  ...catalogRoutes,
  ...businessRoutes,
  ...orderRoutes,
  ...paymentRoutes,
  ...uploadRoutes,
];

function trustProxy(value: string) {
  if (value === "true") return true;
  if (value === "false") return false;
  return /^\d+$/.test(value) ? Number(value) : value;
}

/** Browsers cannot add custom headers to cross-site requests without CORS, which this API never allows. */
const requireAppHeader: RequestHandler = (req, _res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method) || req.path.startsWith("/webhooks/")) return next();
  if (!req.get("x-requested-with")) return next(new HttpError(403, "missing_header", "Envie o cabeçalho X-Requested-With."));
  next();
};

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (res.headersSent) return;
  if (error instanceof multer.MulterError) {
    const tooBig = error.code === "LIMIT_FILE_SIZE";
    res.status(tooBig ? 413 : 400).json({ error: { code: tooBig ? "file_too_large" : "invalid_upload", message: tooBig ? "A foto pode ter até 10 MB." : "Envie uma foto no campo file." } });
    return;
  }
  const type = (error as { type?: string }).type;
  if (type === "entity.parse.failed") {
    res.status(400).json({ error: { code: "invalid_json", message: "O corpo da requisição não é um JSON válido." } });
    return;
  }
  if (type === "entity.too.large") {
    res.status(413).json({ error: { code: "body_too_large", message: "Requisição grande demais." } });
    return;
  }
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: { code: error.code, message: error.message, ...(error.details === undefined ? {} : { details: error.details }) } });
    return;
  }
  console.error("[api] unexpected error", error);
  res.status(500).json({ error: { code: "internal_error", message: "Algo deu errado do nosso lado. Tente de novo." } });
};

const mercadoPagoHosts = ["https://*.mercadopago.com", "https://*.mercadopago.com.br", "https://*.mercadolibre.com", "https://*.mercadolivre.com", "https://*.mlstatic.com"];

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", trustProxy(config.trustProxy));
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: config.isProduction
        ? {
            directives: {
              "script-src": ["'self'", "https://sdk.mercadopago.com", ...mercadoPagoHosts],
              "frame-src": ["'self'", ...mercadoPagoHosts],
              "connect-src": ["'self'", "https://api.mercadopago.com", "https://nominatim.openstreetmap.org", ...mercadoPagoHosts],
              "img-src": ["'self'", "data:", "blob:", "https://tile.openstreetmap.org", ...mercadoPagoHosts],
              "style-src": ["'self'", "'unsafe-inline'"],
              "font-src": ["'self'", "data:"],
            },
          }
        : false,
    }),
  );
  app.use(cookieParser());

  const spec = buildOpenApi(routes);
  const api = express.Router();
  api.use(apiLimiter);
  api.use(express.json({ limit: "200kb" }));
  api.get("/openapi.json", (_req, res) => {
    res.json(spec);
  });
  api.use(requireAppHeader);
  mount(api, routes);
  if (fakeGateway()) mount(api, testRoutes);
  api.use((_req, _res, next) => next(notFound("Rota da API não encontrada.")));
  app.use("/api", api);

  app.use("/uploads", express.static(uploadsDir, { immutable: true, maxAge: "365d", index: false, fallthrough: false }));

  const dist = join(import.meta.dirname, "..", "dist");
  const serveWeb = process.env.RAILWAY_SERVICE_NAME !== "api";
  if (config.isProduction && serveWeb && existsSync(dist)) {
    app.use(express.static(dist, { index: false, maxAge: "1h" }));
    app.get(/^\/(?!api\/|uploads\/).*/, (_req, res) => {
      res.sendFile(join(dist, "index.html"));
    });
  } else {
    app.get("/", (req, res, next) => {
      void apiHome(req, res).catch(next);
    });
  }

  app.use(errorHandler);
  return app;
}
