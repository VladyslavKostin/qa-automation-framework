export interface CandidateElement {
  readonly tag: string;
  readonly selector: string;
  readonly text: string;
  readonly attributes: Readonly<Record<string, string>>;
}
