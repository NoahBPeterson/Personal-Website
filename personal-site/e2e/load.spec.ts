import { test, expect } from "@playwright/test";

type LoadMetrics = {
  ttfbMs: number;
  domContentLoadedMs: number;
  loadEventMs: number;
  firstPaintMs: number | null;
  firstContentfulPaintMs: number | null;
  largestContentfulPaintMs: number | null;
  transferredBytes: number;
};

test("home page load baseline", async ({ page }) => {
  // Stub backend endpoints the SPA calls on mount so network failures to the
  // Elysia server (which isn't running in this test) don't skew numbers.
  await page.route("**/loxExamples", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
  );
  await page.route("**/ucodeExamples", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
  );

  // Short-circuit the LSP WebSocket (port 6005). Without this, the page's
  // ReconnectingWebSocket retries ~10 times with backoff and stretches the
  // `load` event to 20s. Real users hit a running LSP, so this stays out of
  // the baseline.
  await page.routeWebSocket(/:6005|\/lsp/, (ws) => ws.close());

  // Register paint observers before the page runs so FCP and LCP are captured.
  // LCP in particular needs an observer to be registered — `getEntriesByType`
  // alone doesn't surface it.
  await page.addInitScript(() => {
    const w = window as unknown as {
      __fcp?: number;
      __lcp?: number;
    };
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.name === "first-contentful-paint") w.__fcp = e.startTime;
      }
    }).observe({ type: "paint", buffered: true });
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      w.__lcp = entries[entries.length - 1].startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });

  let transferredBytes = 0;
  page.on("response", async (res) => {
    const lenHeader = res.headers()["content-length"];
    if (lenHeader) transferredBytes += Number(lenHeader);
  });

  const consoleIssues: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      consoleIssues.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  await page.goto("/", { waitUntil: "load" });

  // Wait until FCP + LCP have been observed by the scripts injected above.
  await page.waitForFunction(
    () => {
      const w = window as unknown as { __fcp?: number; __lcp?: number };
      return w.__fcp !== undefined && w.__lcp !== undefined;
    },
    null,
    { timeout: 15_000 }
  );

  const metrics = await page.evaluate<LoadMetrics>(() => {
    const w = window as unknown as { __fcp?: number; __lcp?: number };
    const nav = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    const fp =
      performance
        .getEntriesByType("paint")
        .find((p) => p.name === "first-paint")?.startTime ?? null;

    return {
      ttfbMs: nav.responseStart - nav.requestStart,
      domContentLoadedMs: nav.domContentLoadedEventEnd - nav.startTime,
      loadEventMs: nav.loadEventEnd - nav.startTime,
      firstPaintMs: fp,
      firstContentfulPaintMs: w.__fcp ?? null,
      largestContentfulPaintMs: w.__lcp ?? null,
      transferredBytes: 0, // filled in outside the page
    };
  });
  metrics.transferredBytes = transferredBytes;

  // Print so the numbers show up in the test runner output — these are the
  // baseline we'll optimize against.
  console.log("\n=== Page load metrics ===");
  console.log(JSON.stringify(metrics, null, 2));
  if (consoleIssues.length) {
    console.log("\n=== Console errors/warnings ===");
    for (const line of consoleIssues) console.log(line);
  }

  // Sanity: the hero heading should be visible.
  await expect(page.getByRole("heading", { name: "Noah Peterson" })).toBeVisible();

  // Ceilings are regression guards, not goals. Current baseline on localhost:
  //   FCP / LCP  ≈ 50–100 ms  (stable — prerendered HTML + inlined critical CSS)
  //   DCL        ≈ 100 ms
  //   load       1–7 s        (noisy — dominated by the Monaco lazy chunk)
  // Paint metrics are tight; `load` is loose because it fluctuates with the
  // Monaco chunk fetch/init. The ceiling still catches catastrophic regressions
  // (main bundle ballooning, CSS becoming render-blocking again).
  expect(metrics.domContentLoadedMs).toBeLessThan(2_000);
  expect(metrics.loadEventMs).toBeLessThan(15_000);
  if (metrics.firstContentfulPaintMs !== null) {
    expect(metrics.firstContentfulPaintMs).toBeLessThan(1_500);
  }
  if (metrics.largestContentfulPaintMs !== null) {
    expect(metrics.largestContentfulPaintMs).toBeLessThan(2_500);
  }
});
