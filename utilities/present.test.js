import { isPresent, isEmpty } from "./present";
import {describe, expect, test} from "@jest/globals";

describe("isEmpty", () => {
  test("if null, returns true", () => {
    expect(isEmpty(null)).toBe(true);
  });

  test("if undefined, returns true", () => {
    expect(isEmpty(undefined)).toBe(true);
  });

  test("if empty string, returns true", () => {
    expect(isEmpty("")).toBe(true);
  });

  test("if blank string, returns true", () => {
    expect(isEmpty("  ")).toBe(true);
  });

  test("if real string, returns false", () => {
    expect(isEmpty("a")).toBe(false);
  });

  test("if NaN, returns true", () => {
    expect(isEmpty(NaN)).toBe(true);
  });

  test("if number, returns false", () => {
    expect(isEmpty(0)).toBe(false);
  });

  test("if empty array, returns true", () => {
    expect(isEmpty([])).toBe(true);
  });

  test("if array, returns false", () => {
    expect(isEmpty([1])).toBe(false);
  });

  test("if empty object, returns true", () => {
    expect(isEmpty({})).toBe(true);
  });

  test("if object, returns false", () => {
    expect(isEmpty({a: 1})).toBe(false);
  });
});

describe("isPresent", () => {
  test("if null, returns false", () => {
    expect(isPresent(null)).toBe(false);
  });

  test("if undefined, returns false", () => {
    expect(isPresent(undefined)).toBe(false);
  });

  test("if empty string, returns false", () => {
    expect(isPresent("")).toBe(false);
  });

  test("if blank string, returns false", () => {
    expect(isPresent("  ")).toBe(false);
  });

  test("if real string, returns true", () => {
    expect(isPresent("a")).toBe(true);
  });

  test("if NaN, returns false", () => {
    expect(isPresent(NaN)).toBe(false);
  });

  test("if number, returns true", () => {
    expect(isPresent(0)).toBe(true);
  });

  test("if empty array, returns false", () => {
    expect(isPresent([])).toBe(false);
  });

  test("if array, returns true", () => {
    expect(isPresent([1])).toBe(true);
  });

  test("if empty object, returns false", () => {
    expect(isPresent({})).toBe(false);
  });

  test("if object, returns true", () => {
    expect(isPresent({a: 1})).toBe(true);
  });
});