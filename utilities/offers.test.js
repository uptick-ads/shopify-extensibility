import { hideOffers } from "./offers";
import {describe, expect, test} from "@jest/globals";

describe("offers", () => {
  test("if current is null, returns true", () => {
    expect(hideOffers()).toBe(true);
  });

  test("if start is null, returns true", () => {
    expect(hideOffers(1)).toBe(true);
  });

  test("if total is null, returns true", () => {
    expect(hideOffers(1, 1)).toBe(true);
  });

  test("if current is less than 1, returns true", () => {
    expect(hideOffers(0, 3, 4)).toBe(true);
  });

  test("if start is less than 1, returns true", () => {
    expect(hideOffers(1, 0, 4)).toBe(true);
  });

  test("if current is greater than total, returns true", () => {
    expect(hideOffers(2, 1, 1)).toBe(true);
  });

  test("if currents is 1 and start is 2, returns true", () => {
    expect(hideOffers(1, 2, 3)).toBe(true);
  });

  test("if currents is 2, returns false", () => {
    expect(hideOffers(2, 2, 3)).toBe(false);
  });
});