export interface IALink {
  target: string;
}

export interface IANode {
  name: string;
  path?: string;
  annotation?: string;
  isPageStack: boolean;
  children: IANode[];
  links: IALink[];
  components: string[];
}

export interface IADiagram {
  siteName: string;
  nodes: IANode[];
}
