export type JSONPrimitive = string | number | boolean | null;
export type JSONExpected = JSONPrimitive | JSONExpected[];

export interface LessonTest {
  name: string;
  expression: string;
  expected: JSONExpected;
}

export interface Lesson {
  id: string;
  title: string;
  concept: string;
  example: string;
  task: string;
  starter: string;
  solution: string;
  tests: LessonTest[];
  types: string;
  negative: string[];
  hints: string[];
  requirements: string[];
  testImports: string[];
  chapterIndex: number;
  index: number;
}

export interface Chapter {
  title: string;
  subtitle: string;
  comparisons: Record<string, string>;
  lessons: Lesson[];
}

export declare const chapters: Chapter[];
export declare const lessons: Lesson[];
export declare const modules: Record<string, string>;
