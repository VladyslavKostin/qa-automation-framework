export interface TestPlan {
  readonly title: string;
  readonly pageObjectName: string;
  readonly steps: readonly string[];
  readonly assertions: readonly string[];
}

export interface GeneratedFile {
  readonly path: string;
  readonly content: string;
}

export interface GenerationResult {
  readonly plan: TestPlan;
  readonly pageObject: GeneratedFile;
  readonly spec: GeneratedFile;
}
