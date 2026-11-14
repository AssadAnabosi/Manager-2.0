import { env } from "cloudflare:workers";
import { beforeEach, describe, expect, it } from "vitest";
import { client } from "./helpers";
import { as, body, resetDb } from "./resources.helpers";

const day = (d: string) => `2026-03-${d}`;

describe.each(["", "/api"])("logs with prefix %j", (prefix) => {
  const api = client(prefix);
  beforeEach(resetDb);

  const setup = async () => {
    const mod = await as(api, "Moderator");
    const worker = await as(api, "User", "worker1");
    const worker2 = await as(api, "User", "worker2");
    const create = (over: Record<string, unknown> = {}) =>
      api.json(
        "POST",
        "/logs",
        {
          date: day("10"),
          worker: worker.user.id,
          isAbsent: false,
          startingTime: "08:00",
          finishingTime: "17:30",
          payment: "100.5",
          ...over,
        },
        { token: mod.token }
      );
    return { mod, worker, worker2, create };
  };

  const list = async (token: string, qs = "from=2026-03-01&to=2026-03-31") =>
    body(await api.request(`/logs?${qs}`, { token }));

  describe("POST /logs", () => {
    it("creates a worked log with computed OTV and minor-unit payment", async () => {
      const { mod, create } = await setup();
      const res = await create();
      expect(res.status).toBe(201);
      const row = (await env.DB.prepare("SELECT * FROM logs").first()) as any;
      expect(row.payment).toBe(10050);
      expect(row.otv).toBeCloseTo(1.5);
      expect(row.date).toBe(Date.UTC(2026, 2, 10));
      const data = (await list(mod.token)).data;
      expect(data.logs[0]).toMatchObject({
        date: "2026-03-10T00:00:00.000Z",
        isAbsent: false,
        startingTime: "08:00",
        finishingTime: "17:30",
        OTV: 1.5,
        payment: 100.5,
        worker: { fullName: "First User" },
      });
      expect(data.logs[0].worker.id).toEqual(expect.any(String));
      expect(data.logs[0].id).toEqual(expect.any(String));
    });

    it("normalizes a full ISO date to UTC midnight", async () => {
      const { create } = await setup();
      await create({ date: "2026-03-10T21:45:00.000Z" });
      const row = (await env.DB.prepare("SELECT date FROM logs").first()) as any;
      expect(row.date).toBe(Date.UTC(2026, 2, 10));
    });

    it("stores an absence as 00:00 with no overtime and ignores sent times", async () => {
      const { mod, create } = await setup();
      expect((await create({ isAbsent: true })).status).toBe(201);
      const log = (await list(mod.token)).data.logs[0];
      expect(log).toMatchObject({ isAbsent: true, startingTime: "00:00", finishingTime: "00:00", OTV: 0 });
    });

    it("requires both times unless absent", async () => {
      const { create } = await setup();
      const res = await create({ finishingTime: undefined });
      expect(res.status).toBe(400);
      expect((await body(res)).message).toContain("Please provide a starting time and finishing time");
    });

    it("validates body fields", async () => {
      const { create } = await setup();
      expect((await body(await create({ isAbsent: undefined }))).message).toContain(
        "Please provide isAbsent in your request's body"
      );
      expect((await create({ date: "not a date" })).status).toBe(400);
      expect((await create({ startingTime: "8am" })).status).toBe(400);
      expect((await create({ payment: "abc" })).status).toBe(400);
    });

    it("404s for an unknown worker (and a malformed worker id)", async () => {
      const { create } = await setup();
      const missing = await create({ worker: "11111111-1111-4111-8111-111111111111" });
      expect(missing.status).toBe(404);
      const missingBody = await body(missing);
      expect(missingBody.message).toBe("Worker not found");
      expect(missingBody.code).toBe("WORKER_NOT_FOUND");
      expect((await create({ worker: "nope" })).status).toBe(404);
    });

    it("409s on a second log for the same worker and date", async () => {
      const { create } = await setup();
      await create();
      const res = await create();
      expect(res.status).toBe(409);
      const resBody = await body(res);
      expect(resBody.message).toBe("There is a record of this log already");
      expect(resBody.code).toBe("LOG_EXISTS");
    });
  });

  describe("GET /logs", () => {
    it("defaults to the current month and echoes from/to/filter", async () => {
      const { mod } = await setup();
      const data = (await body(await api.request("/logs", { token: mod.token }))).data;
      const now = new Date();
      const first = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
      const last = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).toISOString().slice(0, 10);
      expect(data).toMatchObject({ from: first, to: last, filter: "", logs: [] });
    });

    it("sums payments, attendance days and OTV for exactly the listed logs", async () => {
      const { mod, create, worker2 } = await setup();
      await create({ date: day("10") }); // OTV 1.5, 100.5
      await create({ date: day("11"), finishingTime: "15:00", payment: 50 }); // OTV -1
      await create({ date: day("12"), isAbsent: true, payment: 20 });
      await create({ date: "2026-04-02" }); // outside the range
      await api.json(
        "POST",
        "/logs",
        { date: day("10"), worker: worker2.user.id, isAbsent: false, startingTime: "08:00", finishingTime: "18:00" },
        { token: mod.token }
      );
      const data = (await list(mod.token)).data;
      expect(data.logs).toHaveLength(4);
      expect(data.paymentsSumValue).toBeCloseTo(170.5);
      expect(data.daysCount).toBe(3);
      expect(data.OTVSum).toBeCloseTo(1.5 - 1 + 2);
      expect(data.logs.map((l: any) => l.date.slice(0, 10))).toEqual([
        "2026-03-12", "2026-03-11", "2026-03-10", "2026-03-10",
      ]);
    });

    it("filters by workers and validates the filter", async () => {
      const { mod, create, worker, worker2 } = await setup();
      await create();
      await api.json(
        "POST",
        "/logs",
        { date: day("10"), worker: worker2.user.id, isAbsent: true },
        { token: mod.token }
      );
      const only = (await list(mod.token, `from=2026-03-01&to=2026-03-31&filter=${worker.user.id}`)).data;
      expect(only.logs).toHaveLength(1);
      expect(only.filter).toEqual([worker.user.id]);
      const bad = await api.request("/logs?filter=nope", { token: mod.token });
      expect(bad.status).toBe(400);
      expect((await body(bad)).message).toBe("Please provide a valid filter");
    });

    it("lets a User see only their own logs, ignoring the filter", async () => {
      const { mod, create, worker, worker2 } = await setup();
      await create();
      await api.json(
        "POST",
        "/logs",
        { date: day("10"), worker: worker2.user.id, isAbsent: true },
        { token: mod.token }
      );
      const { token } = await api.login("worker1");
      const data = (await list(token, `from=2026-03-01&to=2026-03-31&filter=${worker2.user.id}`)).data;
      expect(data.logs).toHaveLength(1);
      expect(data.logs[0].worker.id).toBe(worker.user.id);
      expect(data.daysCount).toBe(1);
    });

    it("includes the whole of the `to` day", async () => {
      const { mod, create } = await setup();
      await create({ date: day("31") });
      expect((await list(mod.token, "from=2026-03-31&to=2026-03-31")).data.logs).toHaveLength(1);
      expect((await list(mod.token, "from=2026-04-01")).data.logs).toHaveLength(0);
    });

    it("400s on an invalid date", async () => {
      const { mod } = await setup();
      expect((await api.request("/logs?from=garbage", { token: mod.token })).status).toBe(400);
    });
  });

  describe("GET /logs/:logID", () => {
    it("returns the log; a User can only open their own", async () => {
      const { mod, create, worker2 } = await setup();
      await create();
      await api.json("POST", "/logs", { date: day("11"), worker: worker2.user.id, isAbsent: true }, { token: mod.token });
      const logs = (await list(mod.token)).data.logs;
      const mine = logs.find((l: any) => l.date.startsWith("2026-03-10"));
      const theirs = logs.find((l: any) => l.date.startsWith("2026-03-11"));
      const { token } = await api.login("worker1");

      const ok = await body(await api.request(`/logs/${mine.id}`, { token }));
      expect(ok.data.log).toMatchObject({ id: mine.id, OTV: 1.5 });
      const denied = await api.request(`/logs/${theirs.id}`, { token });
      expect(denied.status).toBe(403);
      expect((await body(denied)).message).toBe("You are not authorized to access this log");
      expect((await api.request(`/logs/${theirs.id}`, { token: mod.token })).status).toBe(200);
    });

    it("400s on a malformed ID and 404s on a missing one", async () => {
      const { mod } = await setup();
      const bad = await api.request("/logs/xyz", { token: mod.token });
      expect(bad.status).toBe(400);
      expect((await body(bad)).message).toBe("Please provide a valid LogID");
      const missing = await api.request("/logs/11111111-1111-4111-8111-111111111111", { token: mod.token });
      expect(missing.status).toBe(404);
    });
  });

  describe("PUT /logs/:logID", () => {
    const first = async (token: string) => (await list(token)).data.logs[0];

    it("updates times (recomputing OTV), payment and remarks", async () => {
      const { mod, create } = await setup();
      await create();
      const log = await first(mod.token);
      const res = await api.json(
        "PUT",
        `/logs/${log.id}`,
        { isAbsent: false, startingTime: "09:00", finishingTime: "19:00", payment: "75", remarks: "late" },
        { token: mod.token }
      );
      expect(res.status).toBe(204);
      expect(await first(mod.token)).toMatchObject({ OTV: 2, payment: 75, remarks: "late", startingTime: "09:00" });
    });

    it("switches to absent (zeroing times and OTV) and back", async () => {
      const { mod, create } = await setup();
      await create();
      const log = await first(mod.token);
      await api.json("PUT", `/logs/${log.id}`, { isAbsent: true, startingTime: "08:00", finishingTime: "17:00" }, { token: mod.token });
      expect(await first(mod.token)).toMatchObject({ isAbsent: true, startingTime: "00:00", OTV: 0 });
      await api.json("PUT", `/logs/${log.id}`, { isAbsent: false, startingTime: "08:00", finishingTime: "16:00" }, { token: mod.token });
      expect(await first(mod.token)).toMatchObject({ isAbsent: false, OTV: 0 });
    });

    it("rejects date and worker changes and a missing time pair", async () => {
      const { mod, create, worker2 } = await setup();
      await create();
      const log = await first(mod.token);
      for (const field of [["date", day("12")], ["worker", worker2.user.id]]) {
        const res = await api.json("PUT", `/logs/${log.id}`, { isAbsent: true, [field[0]]: field[1] }, { token: mod.token });
        expect(res.status).toBe(400);
        expect((await body(res)).message).toContain(`You are not authorized to update the ${field[0]} field`);
      }
      const noTimes = await api.json("PUT", `/logs/${log.id}`, { payment: 5 }, { token: mod.token });
      expect(noTimes.status).toBe(400);
      expect((await body(noTimes)).message).toContain("Please provide a starting time and finishing time");
    });
  });

  it("DELETE removes the log", async () => {
    const { mod, create } = await setup();
    await create();
    const log = (await list(mod.token)).data.logs[0];
    expect((await api.json("DELETE", `/logs/${log.id}`, undefined, { token: mod.token })).status).toBe(204);
    expect((await list(mod.token)).data.logs).toHaveLength(0);
  });
});
