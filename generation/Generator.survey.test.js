/**
 * @jest-environment jsdom
 */

import generate from "./Generator.jsx";
import { holds, visibleValues } from "./interactions.js";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { act, fireEvent, render, waitFor } from "@testing-library/preact";

// The survey the API returns after a decline, captured from Api::V1::FeedbackSurveyTest.
const surveyResponse = require("./fixtures/survey_decline.json");
const survey = surveyResponse.data[0];
const nextOfferUrl = survey.children[0].children[0].data.next_offer;

const reason = (container, label) => Array.from(container.querySelectorAll("s-button")).find((node) => node.textContent === label);
const submit = (container, label) => reason(container, label);

describe("survey item", () => {
  let nextOffer;
  let postEvent;

  beforeEach(() => {
    nextOffer = jest.fn();
    postEvent = jest.fn().mockResolvedValue(true);
  });

  const renderSurvey = (options = {}) => render(generate({ items: survey.children, options: { loading: false, nextOffer, postEvent, ...options } }));

  test("renders the survey without posting its view, which the API layer sends for every item", () => {
    const { container } = renderSurvey();

    expect(container.querySelector("s-heading").textContent).toBe("How did you feel about this Glowbird offer?");
    expect(postEvent).toHaveBeenCalledTimes(0);
  });

  test("a reason swaps to its selected variant and clears on a second click", () => {
    const { container } = renderSurvey();
    expect(reason(container, "Felt like spam").getAttribute("variant")).toBe("secondary");
    expect(reason(container, "Felt like spam").hasAttribute("selected")).toBe(false);

    fireEvent.click(reason(container, "Felt like spam"));
    expect(reason(container, "Felt like spam").getAttribute("variant")).toBe("primary");

    fireEvent.click(reason(container, "Felt like spam"));
    expect(reason(container, "Felt like spam").getAttribute("variant")).toBe("secondary");
  });

  test("show_when shows the comment box and Report Ad only for the reasons that ask for them", () => {
    const { container } = renderSurvey();
    expect(container.querySelector("s-text-area")).toBeNull();
    expect(submit(container, "Give Feedback")).toBeDefined();
    expect(submit(container, "Report Ad")).toBeUndefined();

    fireEvent.click(reason(container, "Felt like spam"));
    expect(container.querySelector("s-text-area")).not.toBeNull();
    expect(submit(container, "Report Ad")).toBeDefined();
    expect(submit(container, "Give Feedback")).toBeUndefined();
  });

  test("submitting posts offer_feedback with the reason, comment and source, then follows the next offer", async () => {
    const { container } = renderSurvey();
    fireEvent.click(reason(container, "Felt like spam"));
    const comment = container.querySelector("s-text-area");
    comment.value = "Too many popups";
    fireEvent.input(comment);

    await act(async () => fireEvent.click(submit(container, "Report Ad")));

    await waitFor(() => expect(nextOffer).toHaveBeenCalledWith(nextOfferUrl));
    const [event, values] = postEvent.mock.calls[0];
    expect(event.ev).toBe("offer_feedback");
    expect(event.data).toEqual({ source: "decline" });
    expect(values).toEqual({ reason: "spam", comment: "Too many popups" });
  });

  test("submitting with no reason moves on without recording feedback", async () => {
    const { container } = renderSurvey();

    await act(async () => fireEvent.click(submit(container, "Give Feedback")));

    await waitFor(() => expect(nextOffer).toHaveBeenCalledWith(nextOfferUrl));
    expect(postEvent).toHaveBeenCalledTimes(0);
  });

  test("Skip moves on without recording feedback", async () => {
    const { container } = renderSurvey();
    fireEvent.click(reason(container, "Felt like spam"));

    const skip = Array.from(container.querySelectorAll("s-clickable")).find((node) => node.textContent === "Skip");
    await act(async () => fireEvent.click(skip));

    expect(nextOffer).toHaveBeenCalledWith(nextOfferUrl);
    expect(postEvent).toHaveBeenCalledTimes(0);
  });

  test("while feedback posts, Submit and Skip are disabled and the item advances only once", async () => {
    let finishPost;
    postEvent = jest.fn(() => new Promise((resolve) => { finishPost = resolve; }));
    const { container } = renderSurvey();
    fireEvent.click(reason(container, "Not interested"));
    const skip = () => Array.from(container.querySelectorAll("s-clickable")).find((node) => node.textContent === "Skip");

    await act(async () => fireEvent.click(submit(container, "Give Feedback")));
    expect(submit(container, "Give Feedback").hasAttribute("disabled")).toBe(true);
    expect(skip().hasAttribute("disabled")).toBe(true);
    await act(async () => {
      fireEvent.click(submit(container, "Give Feedback"));
      fireEvent.click(skip());
    });
    await act(async () => finishPost(true));

    expect(postEvent).toHaveBeenCalledTimes(1);
    expect(nextOffer).toHaveBeenCalledTimes(1);
  });

  test("a different survey in the same place starts with no answers", () => {
    const { container, rerender } = renderSurvey();
    fireEvent.click(reason(container, "Felt like spam"));
    expect(reason(container, "Felt like spam").getAttribute("variant")).toBe("primary");

    const other = JSON.parse(JSON.stringify(survey.children));
    other[0].children[0].data.item_id = "srv_another";
    rerender(generate({ items: other, options: { loading: false, nextOffer, postEvent } }));

    expect(reason(container, "Felt like spam").getAttribute("variant")).toBe("secondary");
  });

  test("leaves out the offer footer", () => {
    const { container } = renderSurvey();
    expect(container.textContent).not.toContain("Powered by");
  });
});

describe("interactions", () => {
  test("not_in also holds while the field is empty", () => {
    expect(holds({ field: "reason", not_in: ["spam"] }, {})).toBe(true);
    expect(holds({ field: "reason", not_in: ["spam"] }, { reason: "spam" })).toBe(false);
    expect(holds({ field: "reason", in: ["spam"] }, {})).toBe(false);
    expect(holds({ field: "reason", present: true }, { reason: "good_fit" })).toBe(true);
    expect(holds(null, {})).toBe(true);
  });

  test("visibleValues drops a comment whose box is hidden again", () => {
    const root = { children: [{ field: { name: "reason", value: "spam" } }, { show_when: { field: "reason", in: ["spam"] }, children: [{ field: { name: "comment" } }] }] };

    expect(visibleValues(root, ["reason", "comment"], { reason: "spam", comment: "Hi" })).toEqual({ reason: "spam", comment: "Hi" });
    expect(visibleValues(root, ["reason", "comment"], { reason: "good_fit", comment: "Hi" })).toEqual({ reason: "good_fit" });
  });
});
