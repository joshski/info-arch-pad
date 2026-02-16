export interface IALink {
  target: string;
  url?: string;
}

export interface IANode {
  name: string;
  path?: string;
  annotation?: string;
  status?: string;
  isPageStack: boolean;
  children: IANode[];
  links: IALink[];
  components: string[];
  notes: string[];
}

export interface IASite {
  siteName: string;
  nodes: IANode[];
}

export interface IADiagram {
  siteName: string;
  nodes: IANode[];
  sites: IASite[];
}
