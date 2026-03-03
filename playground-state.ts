import { layout } from "./layout";
import { parse } from "./parser";
import { render } from "./renderer";
import type { Theme } from "./theme";
import { themes } from "./theme";

export const examples: Record<string, string> = {
  "E-commerce": `site ShopFront
  home / (landing-page)
    [hero]
    [featured-products]
    --> products
    --> about

  products /products (listing-page)
    [filters]
    [product-card *]
    product-detail /products/:id (detail-page)
      [gallery]
      [specs]
      [reviews]
      --> home

  about /about
    team /about/team
    contact /contact
`,
  "Docs Site": `site Docs
  home / (landing-page)
    [search]
    [quick-start]
    --> getting-started
    --> api-reference
    --> guides

  getting-started /getting-started
    installation /getting-started/installation
    configuration /getting-started/configuration
    first-project /getting-started/first-project

  guides /guides (listing-page)
    [guide-card *]
    guide /guides/:slug (detail-page)
      [table-of-contents]
      [content]
      [prev-next-nav]

  api-reference /api (listing-page)
    [sidebar-nav]
    endpoint /api/:section (detail-page)
      [parameters]
      [code-examples]
      [response-schema]

  changelog /changelog
`,
  "SaaS Dashboard": `site SaaSApp
  dashboard / (landing-page)
    [stats-overview]
    [activity-feed]
    [quick-actions]
    --> projects
    --> settings

  projects /projects (listing-page)
    [project-card *]
    project /projects/:id (detail-page)
      [project-header]
      [task-board]
      [members]
      --> settings

  team /team
    members /team/members (listing-page)
      [member-card *]
      member /team/members/:id (detail-page)
        [profile]
        [activity]
    roles /team/roles

  settings /settings
    profile /settings/profile
    billing /settings/billing
      plans /settings/billing/plans
      invoices /settings/billing/invoices
    integrations /settings/integrations (listing-page)
      [integration-card *]
`,
};

export interface SuccessfulPlaygroundRenderState {
  error: null;
  svg: string;
}

export interface FailedPlaygroundRenderState {
  error: string;
  svg?: undefined;
}

export type PlaygroundRenderState =
  | SuccessfulPlaygroundRenderState
  | FailedPlaygroundRenderState;

export function listExampleNames(): string[] {
  return Object.keys(examples);
}

export function getExampleSource(name: string): string | undefined {
  return examples[name];
}

export function getTheme(name: string): Theme {
  return themes[name] ?? themes.default;
}

export function formatPlaygroundError(error: unknown): string {
  if (error && typeof error === "object") {
    const message =
      typeof (error as { message?: unknown }).message === "string"
        ? (error as { message: string }).message
        : undefined;
    const location = (error as {
      location?: {
        start?: { line: number; column: number };
      };
    }).location?.start;

    if (location && message) {
      return `Line ${location.line}, column ${location.column}: ${message}`;
    }

    if (message) {
      return message;
    }
  }

  return "Parse error";
}

export function createPlaygroundRenderState(
  source: string,
  themeName: string,
): PlaygroundRenderState {
  try {
    const diagram = parse(source);
    const positioned = layout(diagram);

    return {
      error: null,
      svg: render(positioned, getTheme(themeName)),
    };
  } catch (error) {
    return {
      error: formatPlaygroundError(error),
    };
  }
}
