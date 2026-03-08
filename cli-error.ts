export type CliErrorInput = {
  context: string;
  cause?: unknown;
  nextStep: string;
};

function extractCauseMessage(cause: unknown): string | null {
  if (!cause) {
    return null;
  }

  if (cause instanceof Error) {
    return cause.message;
  }

  if (typeof cause === "string") {
    return cause;
  }

  if (typeof cause === "object" && "message" in cause) {
    const message = (cause as { message?: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
  }

  return null;
}

export function formatCliError({ context, cause, nextStep }: CliErrorInput): string {
  const lines = [`Error: ${context}`];
  const causeMessage = extractCauseMessage(cause);
  if (causeMessage) {
    lines.push(`Cause: ${causeMessage}`);
  }
  lines.push(`Next step: ${nextStep}`);
  return lines.join("\n");
}
