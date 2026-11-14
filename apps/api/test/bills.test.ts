import { env } from "cloudflare:workers";
import { beforeEach, describe, expect, it } from "vitest";
import { client } from "./helpers";
import { as, body, resetDb } from "./resources.helpers";

describe.each(["", "/api"])("bills with prefix %j", (prefix) => {
  const api = client(prefix);
  beforeEach(resetDb);

  const setup = async () => {
    const { token } = await as(api, "Moderator");
    const create = (over: Record<string, unknown> = {}) =>
      api.json(
        "POST",
        "/bills",
        { date: "2026-03-10", type: "expense", amount: "120.5", description: "Welding rods", ...over },
        { token }
      );
    const list = async (qs = "from=2026-03-01&to=2026-03-31") =>
      (await body(await api.request(`/bills?${qs}`, { token }))).data;
    return { token, create, list };
  };

  it("creates a bill with a message, storing minor units", async () => {
    const { create, list } = await setup();
    const res = await create({ remarks: "cash" });
    expect(res.status).toBe(201);
    expect(await body(res)).toEqual({ success: true, message: "Bill was added successfully" });
    const row = (await env.DB.prepare("SELECT * FROM bills").first()) as any;
    expect(row).toMatchObject({ amount: 12050, type: "expense" });
    expect(row.date).toBe(Date.UTC(2026, 2, 10));
    expect((await list()).bills[0]).toEqual({
      id: expect.any(String),
      date: "2026-03-10T00:00:00.000Z",
      type: "expense",
      amount: 120.5,
      description: "Welding rods",
      remarks: "cash",
    });
  });

  it("validates type, amount, date and description", async () => {
    const { create } = await setup();
    expect((await body(await create({ type: undefined }))).message).toContain("Please provide type in your request's body");
    const badType = await create({ type: "gift" });
    expect(badType.status).toBe(400);
    expect((await body(badType)).message).toContain("Invalid bill type [expense,income]");
    for (const amount of [0, -5, "abc"]) {
      expect((await create({ amount })).status).toBe(400);
    }
    expect((await body(await create({ amount: 0 }))).message).toContain("Amount must be greater than 0");
    const zero = await body(await create({ amount: 0 }));
    expect(zero.code).toBe("VALIDATION_FAILED");
    expect(zero.errors).toEqual([{ code: "amount_positive", path: "amount" }]);
    expect((await create({ date: "x" })).status).toBe(400);
    expect((await create({ description: undefined })).status).toBe(400);
    expect((await create({ description: "" })).status).toBe(400);
  });

  it("returns range and all-time totals for mixed types (net = spent - received)", async () => {
    const { create, list } = await setup();
    await create({ amount: 100, type: "expense" });
    await create({ amount: 30.25, type: "expense", date: "2026-03-12" });
    await create({ amount: 500, type: "income", date: "2026-03-11", description: "Customer payment" });
    await create({ amount: 1000, type: "expense", date: "2026-01-01", description: "January rent" });
    await create({ amount: 200, type: "income", date: "2026-01-02", description: "January sale" });

    const data = await list();
    expect(data.bills).toHaveLength(3);
    expect(data.totals.range).toEqual({ spent: 130.25, received: 500, net: -369.75 });
    expect(data.totals.allTime).toEqual({ spent: 1130.25, received: 700, net: 430.25 });
    expect(data).toMatchObject({ from: "2026-03-01", to: "2026-03-31", search: "" });
    expect(data.bills.map((b: any) => b.date.slice(0, 10))).toEqual(["2026-03-12", "2026-03-11", "2026-03-10"]);
  });

  it("applies the same filters to the list and the range totals; all-time ignores them", async () => {
    const { create, list } = await setup();
    await create({ amount: 100, type: "expense", description: "Gas bottles" });
    await create({ amount: 40, type: "expense", description: "Paint", remarks: "red GAS-free" });
    await create({ amount: 500, type: "income", description: "Gas repair job" });

    const search = await list("from=2026-03-01&to=2026-03-31&search=gas");
    expect(search.bills).toHaveLength(3);
    const searchSpent = await list("from=2026-03-01&to=2026-03-31&search=bottles");
    expect(searchSpent.totals.range).toEqual({ spent: 100, received: 0, net: 100 });
    expect(searchSpent.search).toBe("bottles");

    const spentOnly = await list("from=2026-03-01&to=2026-03-31&type=expense");
    expect(spentOnly.bills).toHaveLength(2);
    expect(spentOnly.totals.range).toEqual({ spent: 140, received: 0, net: 140 });
    expect(spentOnly.totals.allTime).toEqual({ spent: 140, received: 500, net: -360 });

    const receivedOnly = await list("from=2026-03-01&to=2026-03-31&type=income");
    expect(receivedOnly.bills).toHaveLength(1);
    expect(receivedOnly.totals.range).toEqual({ spent: 0, received: 500, net: -500 });

    const empty = await list("from=2027-01-01&to=2027-01-31");
    expect(empty.bills).toEqual([]);
    expect(empty.totals.range).toEqual({ spent: 0, received: 0, net: 0 });
    expect(empty.totals.allTime).toEqual({ spent: 140, received: 500, net: -360 });
  });

  it("treats LIKE wildcards in search literally and rejects an invalid type filter", async () => {
    const { create, list, token } = await setup();
    await create({ description: "50% off" });
    await create({ description: "plain" });
    expect((await list("from=2026-03-01&to=2026-03-31&search=%25")).bills).toHaveLength(1);
    expect((await list("from=2026-03-01&to=2026-03-31&search=_lain")).bills).toHaveLength(0);
    const bad = await api.request("/bills?type=gift", { token });
    expect(bad.status).toBe(400);
  });

  it("defaults to the current month when no dates are given", async () => {
    const { create, list } = await setup();
    const today = new Date().toISOString().slice(0, 10);
    await create({ date: today });
    await create({ date: "2020-01-01" });
    expect((await list("")).bills).toHaveLength(1);
  });

  it("gets, updates and deletes a bill with messages", async () => {
    const { token, create, list } = await setup();
    await create();
    const id = (await list()).bills[0].id;

    const one = await body(await api.request(`/bills/${id}`, { token }));
    expect(one.data.bill).toMatchObject({ id, type: "expense", amount: 120.5 });

    const res = await api.json(
      "PUT",
      `/bills/${id}`,
      { type: "income", amount: "10", date: "2026-03-20T15:00:00Z", description: "Refund", remarks: "" },
      { token }
    );
    expect(res.status).toBe(200);
    expect(await body(res)).toEqual({ success: true, message: "Bill was updated successfully" });
    const updated = (await body(await api.request(`/bills/${id}`, { token }))).data.bill;
    expect(updated).toEqual({ id, date: "2026-03-20T00:00:00.000Z", type: "income", amount: 10, description: "Refund" });

    expect((await api.json("PUT", `/bills/${id}`, { amount: -1 }, { token })).status).toBe(400);

    const del = await api.json("DELETE", `/bills/${id}`, undefined, { token });
    expect(del.status).toBe(200);
    expect(await body(del)).toEqual({ success: true, message: "Bill was deleted successfully" });
    expect((await api.request(`/bills/${id}`, { token })).status).toBe(404);
  });

  it("returns 400/404 for bad bill IDs", async () => {
    const { token } = await setup();
    expect((await api.request("/bills/xyz", { token })).status).toBe(400);
    expect((await api.request("/bills/11111111-1111-4111-8111-111111111111", { token })).status).toBe(404);
  });

  it("enforces the database checks (positive amount, valid type)", async () => {
    await expect(
      env.DB.prepare(
        "INSERT INTO bills (id, date, type, amount, description, created_at, updated_at) VALUES ('x', 1, 'expense', 0, 'd', 1, 1)"
      ).run()
    ).rejects.toThrow();
    await expect(
      env.DB.prepare(
        "INSERT INTO bills (id, date, type, amount, description, created_at, updated_at) VALUES ('y', 1, 'gift', 5, 'd', 1, 1)"
      ).run()
    ).rejects.toThrow();
  });
});
