import type { DetectionContext } from '../../core/types/Module.js';

export function detectBootstrap(context: DetectionContext): boolean {
  if (context.packageJson) {
    const hasBootstrap = !!(
      context.packageJson.dependencies?.bootstrap ||
      context.packageJson.devDependencies?.bootstrap ||
      context.packageJson.dependencies?.['react-bootstrap'] ||
      context.packageJson.dependencies?.['bootstrap-vue'] ||
      context.packageJson.dependencies?.['@ng-bootstrap/ng-bootstrap']
    );

    if (hasBootstrap) return true;
  }

  const files = context.files || [];
  const hasBootstrapFiles = files.some(file =>
    file.includes('bootstrap') && (file.endsWith('.css') || file.endsWith('.scss'))
  );

  return hasBootstrapFiles;
}