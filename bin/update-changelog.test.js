const fs = require("fs");
const os = require("os");
const path = require("path");
const { describe, expect, test } = require("@jest/globals");
const { updateChangelog, writeChangelog } = require("./update-changelog");

describe("updateChangelog", () => {
  const changelog = [
    "# Changelog",
    "",
    "A preamble whose length is intentionally not fixed.",
    "",
    "## [2026.6.1+1] - 2026-06-01",
    "",
    "### 🚀 Added",
    "- An existing change",
    "",
  ].join("\n");

  test("moves the unreleased changes before the latest release", () => {
    const changes = [
      "### 🐛 Fixed",
      "- Preserve 50%, `$values`, backticks, and C:\\paths",
    ].join("\n");

    const updated = updateChangelog(
      changelog,
      "2026.7.28+1",
      changes,
      "2026-07-28"
    );

    expect(updated).toContain(
      [
        "A preamble whose length is intentionally not fixed.",
        "",
        "## [2026.7.28+1] - 2026-07-28",
        "",
        changes,
        "",
        "## [2026.6.1+1] - 2026-06-01",
      ].join("\n")
    );
  });

  test("rejects empty release notes instead of creating an empty release", () => {
    expect(() =>
      updateChangelog(changelog, "2026.7.28+1", " \n", "2026-07-28")
    ).toThrow("No changelog changes provided");
  });

  test("fails when the changelog structure has no release heading", () => {
    expect(() =>
      updateChangelog(
        "# Changelog\n",
        "2026.7.28+1",
        "- A change",
        "2026-07-28"
      )
    ).toThrow("CHANGELOG.md has no released-version heading");
  });

  test("does not insert the same release twice", () => {
    expect(() =>
      updateChangelog(
        changelog,
        "2026.6.1+1",
        "- A change",
        "2026-07-28"
      )
    ).toThrow("## [2026.6.1+1] already exists in CHANGELOG.md");
  });

  test("atomically replaces the changelog without leaving a temporary file", () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "update-changelog-")
    );
    const changelogFile = path.join(directory, "CHANGELOG.md");
    fs.writeFileSync(changelogFile, changelog);

    try {
      writeChangelog(
        changelogFile,
        "2026.7.28+1",
        "- A release change",
        "2026-07-28"
      );

      expect(fs.readFileSync(changelogFile, "utf8")).toContain(
        "## [2026.7.28+1] - 2026-07-28\n\n- A release change"
      );
      expect(fs.readdirSync(directory)).toEqual(["CHANGELOG.md"]);
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
});
