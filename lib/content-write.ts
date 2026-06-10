import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

// Serialisation shared by the daily/weekly pipeline and the seed script.
//
// gray-matter coerces unquoted ISO dates to Date objects on read, so we
// force date-like scalars to stay quoted strings. See scripts/check-content.ts.
export function quoteYamlDates(yaml: string): string {
  return yaml.replace(
    /^(\s*)(date|from|to): (\d{4}-\d{2}-\d{2})$/gm,
    '$1$2: "$3"',
  );
}

// Render a frontmatter object + body into the canonical MDX string.
export function serializeMdx(frontmatter: unknown, body: string): string {
  const yaml = quoteYamlDates(YAML.stringify(frontmatter).trimEnd());
  return `---\n${yaml}\n---\n\n${body.trim()}\n`;
}

// Write an MDX file into content/articles/, creating the directory if
// needed. Returns the absolute path written.
export async function writeMdxFile(
  filename: string,
  frontmatter: unknown,
  body: string,
): Promise<string> {
  const dir = path.join(process.cwd(), "content", "articles");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, filename);
  await fs.writeFile(file, serializeMdx(frontmatter, body));
  return file;
}
