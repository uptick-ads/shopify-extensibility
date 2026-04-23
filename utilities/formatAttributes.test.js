import { formatAttributes } from "./formatAttributes";
import {describe, expect, test} from "@jest/globals";

describe("formatAttributes", () => {
  test("if item is null, returns empty object", () => {
    expect(formatAttributes()).toStrictEqual({});
  });

  test("if attributes is null, returns empty object", () => {
    expect(formatAttributes({ attributes: null })).toStrictEqual({});
  });

  test("if desktop attributes is null, returns attributes", () => {
    expect(formatAttributes({ attributes: { something: true }})).toStrictEqual({ something: true });
  });

  test("if desktop attributes doesn't have attributes keys, returns attributes as is", () => {
    expect(formatAttributes({ attributes: { something: true }, desktop_attributes: { other: true }})).toStrictEqual({ something: true });
  });

  test("combines desktop attributes into container query string", () => {
    expect(formatAttributes({ attributes: { something: "asdf", sweet: "yes" }, desktop_attributes: { something: "xsyd", other: "aaaa"  }})).toStrictEqual({
      "something": "@container (inline-size > 1023px) xsyd, asdf",
      "sweet": "yes",
    });
  });

  test("skips existing container query strings to handle re-rendering", () => {
    let something = "@container (inline-size > 1023px) xsyd, asdf";

    expect(formatAttributes({ attributes: { something, sweet: "yes" }, desktop_attributes: { something: "xsyd", other: "aaaa"  }})).toStrictEqual({
      something,
      "sweet": "yes",
    });
  });

});