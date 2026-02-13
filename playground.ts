import { parse } from "./parser";
import { layout } from "./layout";
import { render } from "./renderer";
import { themes } from "./theme";

const EXAMPLE_SOURCE = `site MyApp
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
`;

const editor = document.getElementById("editor") as HTMLTextAreaElement;
const preview = document.getElementById("preview") as HTMLDivElement;
const themeSelect = document.getElementById("theme-select") as HTMLSelectElement;
const errorDisplay = document.getElementById("error") as HTMLDivElement;

editor.value = EXAMPLE_SOURCE;

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

update();
