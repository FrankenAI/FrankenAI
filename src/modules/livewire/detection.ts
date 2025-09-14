import type { DetectionContext } from '../../core/types/Module.js';

export function detectLivewire(context: DetectionContext): boolean {
  // Check if Laravel is present first
  if (!context.composerJson) return false;

  const hasLaravel = !!(
    context.composerJson.require?.['laravel/framework'] ||
    context.composerJson['require-dev']?.['laravel/framework']
  );

  if (!hasLaravel) return false;

  // Check for Livewire package
  const hasLivewire = !!(
    context.composerJson.require?.['livewire/livewire'] ||
    context.composerJson['require-dev']?.['livewire/livewire']
  );

  if (hasLivewire) return true;

  // Check for Livewire component directories
  const files = context.files || [];
  const hasLivewireComponents = files.some(file =>
    file.includes('app/Http/Livewire/') ||
    file.includes('app/Livewire/') ||
    file.includes('resources/views/livewire/')
  );

  return hasLivewireComponents;
}