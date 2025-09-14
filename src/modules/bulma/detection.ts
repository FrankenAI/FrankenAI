import type { DetectionContext } from '../../core/types/Module.js';

export function detectBulma(context: DetectionContext): boolean {
  if (context.packageJson) {
    const hasBulma = !!(
      context.packageJson.dependencies?.bulma ||
      context.packageJson.devDependencies?.bulma ||
      context.packageJson.dependencies?.['react-bulma-components'] ||
      context.packageJson.dependencies?.buefy ||
      context.packageJson.dependencies?.['ngx-bulma']
    );

    if (hasBulma) return true;
  }

  const files = context.files || [];
  const hasBulmaFiles = files.some(file =>
    file.includes('bulma') && (file.endsWith('.css') || file.endsWith('.scss'))
  );

  return hasBulmaFiles;
}