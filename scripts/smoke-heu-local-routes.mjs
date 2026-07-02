import http from "node:http";
import https from "node:https";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function normalizeHostname(hostname) {
  return hostname.replace(/^\[|\]$/g, "").toLowerCase();
}

function assertLocalBaseUrl(value) {
  const url = new URL(value);
  const hostname = normalizeHostname(url.hostname);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(`HEU_BASE_URL must use http or https: ${value}`);
  }

  if (url.username || url.password) {
    throw new Error("HEU_BASE_URL must not include credentials.");
  }

  if (!LOCAL_HOSTS.has(hostname)) {
    throw new Error(
      `HEU_BASE_URL must be local-only for PASS_LOCAL smoke: ${value}`,
    );
  }

  return url;
}

const baseUrl = assertLocalBaseUrl(
  process.env.HEU_BASE_URL ?? "http://localhost:3000",
);

const routes = [
  "/",
  "/login",
  "/ai-assistant",
  "/audit",
  "/campaigns",
  "/documents",
  "/search",
  "/followups",
  "/leads",
  "/partners",
  "/pipeline",
  "/segments",
  "/import",
  "/settings",
  "/settings/scopes",
  "/settings/supabase-check",
  "/reports",
  "/master-control",
  "/hou",
  "/short-course",
  "/finance-desk",
  "/finance/advance-payment",
  "/ttgdtx",
  "/ttgdtx/accounting-dashboard",
  "/ttgdtx/payment-requests",
  "/ttgdtx/reconciliation",
  "/ttgdtx/source-control",
];

function requestRoute(route) {
  const url = new URL(route, baseUrl);
  const client = url.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const request = client.request(
      url,
      {
        method: "GET",
        timeout: 20_000,
      },
      (response) => {
        response.resume();
        response.on("end", () => {
          resolve({
            route,
            statusCode: response.statusCode ?? 0,
            location: response.headers.location,
          });
        });
      },
    );

    request.on("timeout", () => {
      request.destroy(new Error(`Timed out after 20s: ${route}`));
    });
    request.on("error", reject);
    request.end();
  });
}

function formatError(error) {
  if (error instanceof AggregateError) {
    return error.errors.map(formatError).filter(Boolean).join("; ");
  }

  if (error instanceof Error) {
    const code = "code" in error ? error.code : "";
    return [code, error.message].filter(Boolean).join(": ");
  }

  return String(error);
}

const failures = [];

for (const route of routes) {
  try {
    const result = await requestRoute(route);
    const ok = result.statusCode >= 200 && result.statusCode < 400;
    const redirectText = result.location ? ` -> ${result.location}` : "";
    console.log(
      `${ok ? "PASS" : "FAIL"} ${result.statusCode} ${route}${redirectText}`,
    );

    if (!ok) {
      failures.push(`${route}: HTTP ${result.statusCode}`);
    }
  } catch (error) {
    const message = formatError(error);
    console.log(`FAIL ERR ${route}: ${message}`);
    failures.push(`${route}: ${message}`);
  }
}

if (failures.length > 0) {
  console.error("HEU local route smoke failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `HEU local route smoke passed for ${baseUrl.origin}. This is PASS_LOCAL and LOCALHOST_ONLY; it does not execute signed UAT, accept evidence, call external environments or approve production GO.`,
);
