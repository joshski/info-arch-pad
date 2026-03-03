import {
  createPlaygroundRenderState,
  getExampleSource,
  listExampleNames,
} from "./playground-state";

const editor = document.getElementById("editor") as HTMLTextAreaElement;
const preview = document.getElementById("preview") as HTMLDivElement;
const themeSelect = document.getElementById("theme-select") as HTMLSelectElement;
const exampleSelect = document.getElementById("example-select") as HTMLSelectElement;
const errorDisplay = document.getElementById("error") as HTMLDivElement;

for (const name of listExampleNames()) {
  const option = document.createElement("option");
  option.value = name;
  option.textContent = name;
  exampleSelect.appendChild(option);
}

const initialExample = getExampleSource(exampleSelect.value);
if (initialExample !== undefined) {
  editor.value = initialExample;
}

function update() {
  const state = createPlaygroundRenderState(editor.value, themeSelect.value);

  if (state.error === null) {
    preview.innerHTML = state.svg;
    errorDisplay.textContent = "";
    errorDisplay.hidden = true;
  } else {
    errorDisplay.textContent = state.error;
    errorDisplay.hidden = false;
  }
}

editor.addEventListener("input", update);
themeSelect.addEventListener("change", () => {
  document.body.className = themeSelect.value === "dark" ? "dark" : "";
  update();
});
exampleSelect.addEventListener("change", () => {
  const example = getExampleSource(exampleSelect.value);
  if (example !== undefined) {
    editor.value = example;
  }
  update();
});

update();
