const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

function updateChangelog(changelog, version, changes, releaseDate) {
  const normalizedVersion = version.trim();
  const normalizedDate = releaseDate.trim();

  if (!normalizedVersion) {
    throw new Error("No release version provided");
  }

  if (!normalizedDate) {
    throw new Error("No release date provided");
  }

  if (!changes.trim()) {
    throw new Error("No changelog changes provided");
  }

  const insertionPoint = changelog.search(/^## \[/m);
  if (insertionPoint === -1) {
    throw new Error("CHANGELOG.md has no released-version heading");
  }

  const versionHeading = `## [${normalizedVersion}] - ${normalizedDate}`;
  if (changelog.includes(`## [${normalizedVersion}]`)) {
    throw new Error(`## [${normalizedVersion}] already exists in CHANGELOG.md`);
  }

  const preamble = changelog.slice(0, insertionPoint).trimEnd();
  const releases = changelog.slice(insertionPoint).trimStart();

  return [
    preamble,
    "",
    versionHeading,
    "",
    changes.trim(),
    "",
    releases,
  ].join("\n");
}

function writeChangelog(changelogFile, version, changes, releaseDate) {
  const changelog = fs.readFileSync(changelogFile, "utf8");
  const updated = updateChangelog(changelog, version, changes, releaseDate);
  const temporaryFile = path.join(
    path.dirname(changelogFile),
    `.${path.basename(changelogFile)}.${randomUUID()}.tmp`
  );

  try {
    fs.writeFileSync(temporaryFile, updated, {
      encoding: "utf8",
      mode: fs.statSync(changelogFile).mode,
    });
    fs.renameSync(temporaryFile, changelogFile);
  } finally {
    fs.rmSync(temporaryFile, { force: true });
  }
}

if (require.main === module) {
  const changelogFile = process.env.CHANGELOG_FILE || "CHANGELOG.md";
  const version = process.env.NEXT_VERSION || "";
  const changes = process.env.CHANGELOG_CHANGES || "";
  const releaseDate =
    process.env.RELEASE_DATE || new Date().toISOString().slice(0, 10);

  try {
    writeChangelog(changelogFile, version, changes, releaseDate);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
} else {
  module.exports = { updateChangelog, writeChangelog };
}
