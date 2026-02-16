export interface IALink {
  target: string;
  url?: string;
}

export interface IANode {
  name: string;
  path?: string;
  annotation?: string;
  isPageStack: boolean;
  children: IANode[];
  links: IALink[];
  components: string[];
  notes: string[];
}

export interface IADiagram {
  siteName: string;
  nodes: IANode[];
}
