import { test, expect } from "bun:test";
import { formatCliError } from "./cli-error";

test("formats context, cause, and next step", () => {
  const message = formatCliError({
    context: 'Could not read input file "/tmp/missing.ia"',
    cause: new Error('ENOENT: no such file or directory, open "/tmp/missing.ia"'),
    nextStep: "Verify the input file path exists and is readable, then run the command again.",
  });

  expect(message).toContain('Error: Could not read input file "/tmp/missing.ia"');
  expect(message).toContain('Cause: ENOENT: no such file or directory, open "/tmp/missing.ia"');
  expect(message).toContain("Next step: Verify the input file path exists and is readable, then run the command again.");
});

test("omits cause line when a cause is not provided", () => {
  const message = formatCliError({
    context: "Could not read input file",
    nextStep: "Check the path.",
  });

  expect(message).toBe("Error: Could not read input file\nNext step: Check the path.");
});
