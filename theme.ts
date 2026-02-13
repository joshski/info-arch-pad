export interface Theme {
  nodeFill: string;
  nodeStroke: string;
  stackBackFill: string;
  stackMidFill: string;
  sectionFill: string;
  sectionStroke: string;
  nameText: string;
  pathText: string;
  annotationText: string;
  componentText: string;
  edgeStroke: string;
}

export const defaultTheme: Theme = {
  nodeFill: "#fff",
  nodeStroke: "#333",
  stackBackFill: "#f5f5f5",
  stackMidFill: "#fafafa",
  sectionFill: "#fafafa",
  sectionStroke: "#aaa",
  nameText: "#333",
  pathText: "#666",
  annotationText: "#999",
  componentText: "#888",
  edgeStroke: "#666",
};

export const darkTheme: Theme = {
  nodeFill: "#1e1e2e",
  nodeStroke: "#cdd6f4",
  stackBackFill: "#11111b",
  stackMidFill: "#181825",
  sectionFill: "#181825",
  sectionStroke: "#585b70",
  nameText: "#cdd6f4",
  pathText: "#a6adc8",
  annotationText: "#7f849c",
  componentText: "#9399b2",
  edgeStroke: "#a6adc8",
};

export const themes: Record<string, Theme> = {
  default: defaultTheme,
  dark: darkTheme,
};
