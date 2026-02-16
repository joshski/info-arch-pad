import { parse } from "./parser";
import { layout } from "./layout";
import { render } from "./renderer";
import { themes } from "./theme";

const EXAMPLES: Record<string, string> = {
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

const editor = document.getElementById("editor") as HTMLTextAreaElement;
const preview = document.getElementById("preview") as HTMLDivElement;
const themeSelect = document.getElementById("theme-select") as HTMLSelectElement;
const exampleSelect = document.getElementById("example-select") as HTMLSelectElement;
const errorDisplay = document.getElementById("error") as HTMLDivElement;

for (const name of Object.keys(EXAMPLES)) {
  const option = document.createElement("option");
  option.value = name;
  option.textContent = name;
  exampleSelect.appendChild(option);
}

editor.value = EXAMPLES[exampleSelect.value];

function update() {
  const source = editor.value;
  const themeName = themeSelect.value;
  const theme = themes[themeName] ?? themes["default"];

  try {
    const diagram = parse(source);
    const positioned = layout(diagram);
    const svg = render(positioned, theme);
    preview.innerHTML = svg;
    errorDisplay.textContent = "";
    errorDisplay.hidden = true;
  } catch (e: any) {
    let message = "Parse error";
    if (e.location) {
      const loc = e.location.start;
      message = `Line ${loc.line}, column ${loc.column}: ${e.message}`;
    } else if (e.message) {
      message = e.message;
    }
    errorDisplay.textContent = message;
    errorDisplay.hidden = false;
  }
}

editor.addEventListener("input", update);
themeSelect.addEventListener("change", () => {
  document.body.className = themeSelect.value === "dark" ? "dark" : "";
  update();
});
exampleSelect.addEventListener("change", () => {
  editor.value = EXAMPLES[exampleSelect.value];
  update();
});

update();
