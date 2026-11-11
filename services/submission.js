// A host's `nextOffer(url)` only carries a URL, so a link that sends an event when clicked (such as a survey's feedback)
// stages it here as `{ event, values }` and `Api.getNextOffer` takes it for that same URL. Hosts pass the URL through
// and never see the event.
// It holds one submission: a click replaces whatever was staged, and taking clears it whether or not the URL matched.
let staged = null;

export function stageSubmission(url, submission) {
  staged = submission == null ? null : { url, submission };
}

export function takeSubmission(url) {
  const current = staged;
  staged = null;
  return current?.url === url ? current.submission : null;
}
