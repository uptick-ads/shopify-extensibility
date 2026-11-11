/**
 * @jest-environment jsdom
 */

import generate from "./Generator.jsx";
import { holds, visibleValues } from "./interactions.js";
import { takeSubmission } from "../services/submission.js";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { fireEvent, render } from "@testing-library/preact";

// The survey the API returns after a decline, captured from Api::V1::FeedbackSurveyTest.
const surveyResponse = require("./fixtures/survey_decline.json");
const survey = surveyResponse.data[0];
const nextOfferUrl = survey.children[0].children[0].data.next_offer;

const reason = (container, label) => Array.from(container.querySelectorAll("s-press-button")).find((node) => node.textContent === label);
const submit = (container, label) => Array.from(container.querySelectorAll("s-button")).find((node) => node.textContent === label);
const skip = (container) => Array.from(container.querySelectorAll("s-clickable")).find((node) => node.textContent === "Skip");

// The offer_feedback event Report Ad and Give Feedback declare; every link in the survey leads to the same next offer.
const findNode = (node, test) => test(node) ? node : (node.children || []).map((child) => findNode(child, test)).find(Boolean);
const feedbackEvent = findNode(survey, (node) => node.events?.click != null).events.click;

describe("survey item", () => {
  let nextOffer;

  beforeEach(() => {
    nextOffer = jest.fn();
    takeSubmission(null); // Clears anything an earlier test staged.
  });

  // The host's nextOffer only gets the URL; the click's event is staged for Api.getNextOffer to post.
  const expectFollowed = (submission) => {
    expect(nextOffer).toHaveBeenCalledWith(nextOfferUrl);
    expect(takeSubmission(nextOfferUrl)).toEqual(submission);
  };

  const renderSurvey = (options = {}) => render(generate({ items: survey.children, options: { loading: false, nextOffer, ...options } }));

  test("renders the survey without following any link", () => {
    const { container } = renderSurvey();

    expect(container.querySelector("s-heading").textContent).toBe("How did you feel about this Glowbird offer?");
    expect(nextOffer).toHaveBeenCalledTimes(0);
  });

  test("a reason is pressed while picked, which assistive technology announces, and clears on a second click", () => {
    const { container } = renderSurvey();
    expect(reason(container, "Felt like spam").hasAttribute("pressed")).toBe(false);

    fireEvent.click(reason(container, "Felt like spam"));
    expect(reason(container, "Felt like spam").hasAttribute("pressed")).toBe(true);
    expect(reason(container, "Good fit").hasAttribute("pressed")).toBe(false);

    fireEvent.click(reason(container, "Felt like spam"));
    expect(reason(container, "Felt like spam").hasAttribute("pressed")).toBe(false);
  });

  test("a choice that isn't a press button takes its selected attributes while picked", () => {
    const items = [{ type: "box", data: { target: "item", item_id: "srv_1" }, children: [
      { type: "button", text: "Spam", field: { name: "reason", value: "spam" }, attributes: { variant: "secondary", selected: { variant: "primary" } } },
    ] }];
    const { container } = render(generate({ items, options: { loading: false, nextOffer } }));
    const button = container.querySelector("s-button");
    expect(button.getAttribute("variant")).toBe("secondary");
    expect(button.hasAttribute("selected")).toBe(false);

    fireEvent.click(button);
    expect(button.getAttribute("variant")).toBe("primary");
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

  test("submitting stages offer_feedback with the reason and comment, then follows the next offer", () => {
    const { container } = renderSurvey();
    fireEvent.click(reason(container, "Felt like spam"));
    const comment = container.querySelector("s-text-area");
    comment.value = "Too many popups";
    fireEvent.input(comment);

    fireEvent.click(submit(container, "Report Ad"));

    expect(nextOffer).toHaveBeenCalledTimes(1);
    expectFollowed({ event: feedbackEvent, values: { reason: "spam", comment: "Too many popups" } });
    expect(feedbackEvent.ev).toBe("offer_feedback");
    expect(feedbackEvent.data).toEqual({ source: "decline" });
  });

  test("a comment whose box was hidden again isn't sent", () => {
    const { container } = renderSurvey();
    fireEvent.click(reason(container, "Offer unclear"));
    const comment = container.querySelector("s-text-area");
    comment.value = "Confusing";
    fireEvent.input(comment);
    fireEvent.click(reason(container, "Good fit"));

    fireEvent.click(submit(container, "Give Feedback"));

    expectFollowed({ event: feedbackEvent, values: { reason: "good_fit" } });
  });

  test("submitting with no reason follows the next offer without sending feedback, since send_when doesn't hold", () => {
    const { container } = renderSurvey();

    fireEvent.click(submit(container, "Give Feedback"));

    expectFollowed(null);
  });

  test("Skip follows the next offer without sending feedback", () => {
    const { container } = renderSurvey();
    fireEvent.click(reason(container, "Felt like spam"));

    fireEvent.click(skip(container));

    expectFollowed(null);
  });

  test("a double click follows only once, so feedback isn't sent twice", () => {
    const { container } = renderSurvey();
    fireEvent.click(reason(container, "Not interested"));

    fireEvent.click(submit(container, "Give Feedback"));
    fireEvent.click(submit(container, "Give Feedback"));
    fireEvent.click(skip(container));

    expect(nextOffer).toHaveBeenCalledTimes(1);
    expectFollowed({ event: feedbackEvent, values: { reason: "not_relevant" } });
  });

  test("while the next offer loads, Submit and Skip are disabled", () => {
    const { container } = renderSurvey({ loading: true });

    expect(submit(container, "Give Feedback").hasAttribute("disabled")).toBe(true);
    expect(skip(container).hasAttribute("disabled")).toBe(true);
  });

  test("a different survey in the same place starts with no answers", () => {
    const { container, rerender } = renderSurvey();
    fireEvent.click(reason(container, "Felt like spam"));
    expect(reason(container, "Felt like spam").hasAttribute("pressed")).toBe(true);

    const other = JSON.parse(JSON.stringify(survey.children));
    other[0].children[0].data.item_id = "srv_another";
    rerender(generate({ items: other, options: { loading: false, nextOffer } }));

    expect(reason(container, "Felt like spam").hasAttribute("pressed")).toBe(false);
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
