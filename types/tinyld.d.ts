declare module "tinyld" {
  export function detect(input: string): string | undefined;
  export function detectAll(input: string, options?: { fallback?: boolean }): Array<{
    lang: string;
    accuracy: number;
  }>;
}
