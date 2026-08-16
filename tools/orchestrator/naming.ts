export function toKebabCase(text: string): string {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || 'generated-scenario';
}

export function toPascalCase(text: string): string {
  const words = text
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);
  const pascal = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
  return pascal || 'GeneratedScenario';
}
