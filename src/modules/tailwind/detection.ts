import type { DetectionContext } from '../../core/types/Module.js';

export function detectTailwind(context: DetectionContext): boolean {
  if (context.packageJson) {
    const hasTailwind = !!(
      context.packageJson.dependencies?.tailwindcss ||
      context.packageJson.devDependencies?.tailwindcss
    );

    if (hasTailwind) return true;
  }

  const configFiles = context.configFiles || [];
  const hasTailwindConfig = configFiles.some(file =>
    file.includes('tailwind.config.') && (
      file.endsWith('.js') ||
      file.endsWith('.ts') ||
      file.endsWith('.mjs') ||
      file.endsWith('.cjs')
    )
  );

  return hasTailwindConfig;
}