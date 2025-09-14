import type { DetectionContext } from '../../core/types/Module.js';

export function detectInertia(context: DetectionContext): boolean {
  // Check for Inertia Laravel adapter
  if (context.composerJson) {
    const hasInertiaLaravel = !!(
      context.composerJson.require?.['inertiajs/inertia-laravel'] ||
      context.composerJson['require-dev']?.['inertiajs/inertia-laravel']
    );

    if (hasInertiaLaravel) return true;
  }

  // Check for Inertia frontend adapters
  if (context.packageJson) {
    const hasInertiaFrontend = !!(
      context.packageJson.dependencies?.['@inertiajs/react'] ||
      context.packageJson.dependencies?.['@inertiajs/vue3'] ||
      context.packageJson.dependencies?.['@inertiajs/vue2'] ||
      context.packageJson.dependencies?.['@inertiajs/svelte'] ||
      context.packageJson.devDependencies?.['@inertiajs/react'] ||
      context.packageJson.devDependencies?.['@inertiajs/vue3'] ||
      context.packageJson.devDependencies?.['@inertiajs/vue2'] ||
      context.packageJson.devDependencies?.['@inertiajs/svelte']
    );

    if (hasInertiaFrontend) return true;
  }

  // Check for Inertia Pages directory
  const files = context.files || [];
  const hasInertiaPages = files.some(file =>
    file.includes('resources/js/Pages/') ||
    file.includes('resources/js/pages/') ||
    file.includes('resources/ts/Pages/') ||
    file.includes('resources/ts/pages/')
  );

  return hasInertiaPages;
}