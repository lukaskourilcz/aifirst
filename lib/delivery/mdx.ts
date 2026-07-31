import YAML from "yaml";

export function quoteYamlDates(yaml: string): string {
  return yaml.replace(
    /^(\s*(?:[^\n:#][^\n:]*:\s+|-\s+))(\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2}))?)$/gm,
    '$1"$2"',
  );
}

export function serializeDeliveredMdx(frontmatter: unknown, body: string): string {
  const yaml = quoteYamlDates(YAML.stringify(frontmatter).trimEnd());
  return `---\n${yaml}\n---\n\n${body.trim()}\n`;
}
