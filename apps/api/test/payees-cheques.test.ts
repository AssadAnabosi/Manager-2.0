import { env } from "cloudflare:workers";
import { beforeEach, describe, expect, it } from "vitest";
import { client } from "./helpers";
import { as, body, resetDb } from "./resources.helpers";

describe.each(["", "/api"])("payees and cheques with prefix %j", (prefix) => {
  const api = client(prefix);
  beforeEach(resetDb);

  const setup = async () => {
    const mod = await as(api, "Moderator");
    const token = mod.token;
    const createPayee = async (name: string, extra: Record<string, unknown> = {}) => {
      const res = await api.json("POST", "/payees", { name, ...extra }, { token });
      expect(res.status).toBe(201);
      const list = await body(await api.request(`/payees?search=${encodeURIComponent(name)}`, { token }));
      return list.data.payees.find((p: any) => p.name === name).id as string;
    };
    const createCheque = (over: Record<string, unknown> = {}) =>
      api.json(
        "POST",
        "/cheques",
        { serial: 1001, dueDate: "2026-03-15", value: "250.75", isCancelled: false, ...over },
        { token }
      );
    const cheques = async (qs = "from=2026-03-01&to=2026-03-31") =>
      (await body(await api.request(`/cheques?${qs}`, { token }))).data;
    return { token, createPayee, createCheque, cheques };
  };

  describe("payees", () => {
    it("creates, lists, searches (name and remarks), reads and updates", async () => {
      const { token, createPayee } = await setup();
      const id = await createPayee("Acme Tools", { email: "a@acme.io", remarks: "metal supplier" });
      await createPayee("Beta");
      const all = await body(await api.request("/payees", { token }));
      expect(all.data.payees).toHaveLength(2);
      expect(all.data.search).toBe("");
      const byName = await body(await api.request("/payees?search=acme", { token }));
      expect(byName.data.payees.map((p: any) => p.name)).toEqual(["Acme Tools"]);
      const byRemark = await body(await api.request("/payees?search=METAL", { token }));
      expect(byRemark.data.payees).toHaveLength(1);

      const one = await body(await api.request(`/payees/${id}`, { token }));
      expect(one.data.payee).toEqual({ id, name: "Acme Tools", email: "a@acme.io", remarks: "metal supplier" });

      expect((await api.json("PUT", `/payees/${id}`, { name: "Acme", phoneNumber: "555", email: "" }, { token })).status).toBe(204);
      const after = (await body(await api.request(`/payees/${id}`, { token }))).data.payee;
      expect(after).toEqual({ id, name: "Acme", phoneNumber: "555", remarks: "metal supplier" });
    });

    it("validates and enforces unique names", async () => {
      const { token, createPayee } = await setup();
      const missing = await api.json("POST", "/payees", {}, { token });
      expect(missing.status).toBe(400);
      expect((await body(missing)).message).toContain("Please provide name in your request's body");
      const id = await createPayee("Dup");
      const dup = await api.json("POST", "/payees", { name: "Dup" }, { token });
      expect(dup.status).toBe(409);
      expect((await body(dup)).message).toBe("Name already exists");
      const other = await createPayee("Other");
      expect((await api.json("PUT", `/payees/${other}`, { name: "Dup" }, { token })).status).toBe(409);
      expect(id).toBeTruthy();
    });

    it("deleting a payee keeps its cheques with a null payee", async () => {
      const { token, createPayee, createCheque, cheques } = await setup();
      const id = await createPayee("Gone Co");
      await createCheque({ payee: id });
      expect((await cheques()).cheques[0].payee).toEqual({ id, name: "Gone Co" });
      expect((await api.json("DELETE", `/payees/${id}`, undefined, { token })).status).toBe(204);
      const after = (await cheques()).cheques;
      expect(after).toHaveLength(1);
      expect(after[0].payee).toEqual({ id: null, name: "Deleted Payee" });
      expect((await api.request(`/payees/${id}`, { token })).status).toBe(404);
    });
  });

  describe("cheques", () => {
    it("creates a cheque with a payee and returns the documented shape", async () => {
      const { createPayee, createCheque, cheques } = await setup();
      const payee = await createPayee("Pay Me");
      expect((await createCheque({ payee, remarks: "rent" })).status).toBe(201);
      const row = (await env.DB.prepare("SELECT * FROM cheques").first()) as any;
      expect(row).toMatchObject({ serial: 1001, value: 25075, is_cancelled: 0 });
      expect(row.due_date).toBe(Date.UTC(2026, 2, 15));
      const data = await cheques();
      expect(data).toMatchObject({ number: 1, total: 250.75, from: "2026-03-01", to: "2026-03-31", serial: null, filter: "" });
      expect(data.cheques[0]).toEqual({
        id: expect.any(String),
        serial: 1001,
        dueDate: "2026-03-15T00:00:00.000Z",
        value: 250.75,
        remarks: "rent",
        payee: { id: payee, name: "Pay Me" },
        isCancelled: false,
      });
    });

    it("requires a payee unless cancelled, and the payee must exist", async () => {
      const { createCheque } = await setup();
      const noPayee = await createCheque();
      expect(noPayee.status).toBe(400);
      expect((await body(noPayee)).message).toContain("Please select a payee");
      const cancelled = await createCheque({ serial: 2, isCancelled: true });
      expect(cancelled.status).toBe(201);
      const unknown = await createCheque({ serial: 3, payee: "11111111-1111-4111-8111-111111111111" });
      expect(unknown.status).toBe(404);
      expect((await body(unknown)).message).toBe("Payee not found");
    });

    it("validates required fields, negative values and unique serials", async () => {
      const { createPayee, createCheque } = await setup();
      const payee = await createPayee("P");
      expect((await body(await createCheque({ payee, isCancelled: undefined }))).message).toContain(
        "Please provide isCancelled in your request's body"
      );
      expect((await createCheque({ payee, value: -1 })).status).toBe(400);
      expect((await createCheque({ payee, dueDate: "bad" })).status).toBe(400);
      expect((await createCheque({ payee, serial: "abc" })).status).toBe(400);
      expect((await createCheque({ payee })).status).toBe(201);
      const dup = await createCheque({ payee });
      expect(dup.status).toBe(409);
      expect((await body(dup)).message).toBe("Serial already exists");
    });

    it("sorts by due date then serial and excludes cancelled cheques from the total", async () => {
      const { createPayee, createCheque, cheques } = await setup();
      const payee = await createPayee("P");
      await createCheque({ payee, serial: 5, dueDate: "2026-03-20", value: 100 });
      await createCheque({ payee, serial: 3, dueDate: "2026-03-20", value: 50 });
      await createCheque({ payee, serial: 9, dueDate: "2026-03-05", value: 25, isCancelled: true });
      await createCheque({ payee, serial: 8, dueDate: "2026-04-05", value: 1000 });
      const data = await cheques();
      expect(data.cheques.map((c: any) => c.serial)).toEqual([9, 3, 5]);
      expect(data.number).toBe(3);
      expect(data.total).toBe(150);
    });

    it("filters by payee and validates the filter", async () => {
      const { createPayee, createCheque, cheques, token } = await setup();
      const a = await createPayee("A");
      const b = await createPayee("B");
      await createCheque({ payee: a, serial: 1 });
      await createCheque({ payee: b, serial: 2 });
      const only = await cheques(`from=2026-03-01&to=2026-03-31&filter=${a}`);
      expect(only.cheques.map((c: any) => c.serial)).toEqual([1]);
      expect(only.filter).toEqual([a]);
      const both = await cheques(`from=2026-03-01&to=2026-03-31&filter=${a},${b}`);
      expect(both.number).toBe(2);
      expect((await api.request("/cheques?filter=nope", { token })).status).toBe(400);
    });

    it("searches by serial list and ignores the date range and payee filter", async () => {
      const { createPayee, createCheque, cheques } = await setup();
      const payee = await createPayee("P");
      await createCheque({ payee, serial: 11, dueDate: "2025-01-01" });
      await createCheque({ payee, serial: 12, dueDate: "2026-03-10" });
      await createCheque({ payee, serial: 13, dueDate: "2026-03-11" });
      const data = await cheques("serial=11,%2012&from=2026-03-01&to=2026-03-31");
      expect(data.cheques.map((c: any) => c.serial)).toEqual([11, 12]);
      expect(data.serial).toBe("11,%2012".replace("%20", " "));
    });

    it("gets, updates (payee, date, value, flags) and deletes", async () => {
      const { token, createPayee, createCheque, cheques } = await setup();
      const a = await createPayee("A");
      const b = await createPayee("B");
      await createCheque({ payee: a });
      const id = (await cheques()).cheques[0].id;

      const one = await body(await api.request(`/cheques/${id}`, { token }));
      expect(one.data.cheque).toMatchObject({ id, serial: 1001, payee: { id: a, name: "A" } });

      const res = await api.json(
        "PUT",
        `/cheques/${id}`,
        { payee: b, dueDate: "2026-03-18T10:00:00Z", value: "10", isCancelled: true, remarks: "x" },
        { token }
      );
      expect(res.status).toBe(204);
      const updated = (await body(await api.request(`/cheques/${id}`, { token }))).data.cheque;
      expect(updated).toMatchObject({ payee: { id: b }, dueDate: "2026-03-18T00:00:00.000Z", value: 10, isCancelled: true, remarks: "x" });

      // an omitted payee is left alone; "" clears it
      await api.json("PUT", `/cheques/${id}`, { value: 11 }, { token });
      expect((await body(await api.request(`/cheques/${id}`, { token }))).data.cheque.payee.id).toBe(b);
      await api.json("PUT", `/cheques/${id}`, { payee: "" }, { token });
      expect((await body(await api.request(`/cheques/${id}`, { token }))).data.cheque.payee).toEqual({ id: null, name: "Deleted Payee" });
      const missing = await api.json("PUT", `/cheques/${id}`, { payee: "11111111-1111-4111-8111-111111111111" }, { token });
      expect(missing.status).toBe(404);

      expect((await api.json("DELETE", `/cheques/${id}`, undefined, { token })).status).toBe(204);
      expect((await api.request(`/cheques/${id}`, { token })).status).toBe(404);
    });
  });
});
