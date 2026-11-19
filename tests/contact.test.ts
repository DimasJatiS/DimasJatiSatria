import { describe, expect, it } from "vitest";
import { contactSchema, createRateLimiter } from "@/components/forms/schema";

describe("contactSchema (F-08)", () => {
  it("accepts a normal message and trims it", () => {
    const r = contactSchema.parse({ name: "  Rina ", email: "rina@example.com", message: "Hello, let's talk about an internship." });
    expect(r.name).toBe("Rina");
    expect(r.company).toBe("");
  });
  it("reports each bad field by its key", () => {
    const r = contactSchema.safeParse({ name: "R", email: "nope", message: "short" });
    expect(r.success).toBe(false);
    expect(r.error!.issues.map((i) => i.message).sort()).toEqual(["email", "message", "name"]);
  });
});

describe("createRateLimiter", () => {
  it("blocks after the limit and frees up after the window", () => {
    const allow = createRateLimiter(2, 1000);
    expect([allow("a", 0), allow("a", 10), allow("a", 20)]).toEqual([true, true, false]);
    expect(allow("b", 20)).toBe(true);
    expect(allow("a", 1500)).toBe(true);
  });
});
