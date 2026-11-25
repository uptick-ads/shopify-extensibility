import { basicEmail, canonicalEmail, emailHashes, sha256Hex } from "./hashing";
import { afterEach, describe, expect, jest, test } from "@jest/globals";

const gmailCanonical = "d6117306485ed0e50afab3ac871e98f81699151f30281527d63ff5f233656c69";
const gmailBasic = "5f0d1df1fc49e30424381b57b1d4c73e067772a4267dde043a19b026935602c8";
const exampleCanonical = "86e0b9e56c17cc4d12387e1949b85053fbe73bc3ce5a1188713a9d300cc6133d";
const exampleBasic = "c3374bcfe3572e09f37602e0e179782352c5e117a4a3767824abbaa21bbdef8b";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("sha256Hex", () => {
  test("returns lowercase hex", async () => {
    expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  test("returns null without Web Crypto", async () => {
    jest.replaceProperty(globalThis, "crypto", undefined);

    expect(await sha256Hex("abc")).toBeNull();
  });
});

describe("basicEmail", () => {
  test("trims and lowercases only", () => {
    expect(basicEmail("  Jane.Doe+Promo@Gmail.com ")).toBe("jane.doe+promo@gmail.com");
  });
});

describe("canonicalEmail", () => {
  test.each([
    ["  Jane.Doe+Promo@Gmail.com ", "janedoe@gmail.com"],
    ["j.a.n.e@googlemail.com", "jane@googlemail.com"],
    ["jane+a+b@gmail.com", "jane@gmail.com"],
    ["  Jane.Doe+Promo@Example.com ", "jane.doe@example.com"],
    ["jane+a+b@outlook.com", "jane@outlook.com"],
    ["jane.doe@notgmail.com", "jane.doe@notgmail.com"],
    ["not-an-email", "not-an-email"],
  ])("%s becomes %s", (email, expected) => {
    expect(canonicalEmail(email)).toBe(expected);
  });
});

describe("emailHashes", () => {
  test("hashes a Gmail address in both forms", async () => {
    expect(await emailHashes("  Jane.Doe+Promo@Gmail.com ")).toStrictEqual({ canonical: gmailCanonical, basic: gmailBasic });
  });

  test("drops the +tag from the canonical hash for other addresses", async () => {
    expect(await emailHashes("  Jane.Doe+Promo@Example.com ")).toStrictEqual({ canonical: exampleCanonical, basic: exampleBasic });
  });

  test("gives the same hash twice when there is no +tag or Gmail dot", async () => {
    expect(await emailHashes("  Jane.Doe@Example.com ")).toStrictEqual({ canonical: exampleCanonical, basic: exampleCanonical });
  });

  test.each([
    [null],
    [undefined],
    [""],
    ["   "],
    ["not-an-email"],
    [12345],
  ])("returns null for %p", async (email) => {
    expect(await emailHashes(email)).toBeNull();
  });

  test("returns null without Web Crypto", async () => {
    jest.replaceProperty(globalThis, "crypto", undefined);

    expect(await emailHashes("jane@example.com")).toBeNull();
  });
});
