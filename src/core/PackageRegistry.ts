import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';

export interface PackageMapping {
  common: string;
  versions?: Record<string, string>;
  category: 'framework' | 'language' | 'tool' | 'base' | 'package' | 'system' | 'styling';
  ecosystem?: string;
}

export interface PackageInfo {
  name: string;
  version: string;
  type: 'npm' | 'composer';
}

export class PackageRegistry {
  private static npmRegistry: Record<string, PackageMapping> = {};
  private static composerRegistry: Record<string, PackageMapping> = {};
  private static initialized = false;

  static async initialize() {
    if (this.initialized) return;

    const registryPath = path.join(__dirname, '..', '..', 'src', 'registry');
    
    try {
      // Load NPM registry
      const npmPath = path.join(registryPath, 'npm-packages.yaml');
      if (await fs.pathExists(npmPath)) {
        const npmContent = await fs.readFile(npmPath, 'utf-8');
        this.npmRegistry = yaml.load(npmContent) as Record<string, PackageMapping>;
      }

      // Load Composer registry
      const composerPath = path.join(registryPath, 'composer-packages.yaml');
      if (await fs.pathExists(composerPath)) {
        const composerContent = await fs.readFile(composerPath, 'utf-8');
        this.composerRegistry = yaml.load(composerContent) as Record<string, PackageMapping>;
      }

      this.initialized = true;
    } catch (error) {
      console.warn('Failed to load package registries:', error);
    }
  }

  static async findTemplatesForPackage(packageInfo: PackageInfo): Promise<string[]> {
    await this.initialize();
    
    const registry = packageInfo.type === 'npm' ? this.npmRegistry : this.composerRegistry;
    const mapping = registry[packageInfo.name];
    
    if (!mapping) return [];

    const templates: string[] = [];
    
    // Always include common template
    if (mapping.common) {
      templates.push(mapping.common);
    }

    // Check for version-specific template
    if (mapping.versions) {
      const majorVersion = this.extractMajorVersion(packageInfo.version, packageInfo.name);
      const versionTemplate = mapping.versions[majorVersion];
      
      if (versionTemplate) {
        templates.push(versionTemplate);
      }
    }

    return templates;
  }

  static async getAllPackageTemplates(packages: PackageInfo[]): Promise<{ templatePath: string; category: string; ecosystem?: string }[]> {
    await this.initialize();
    
    const templates: { templatePath: string; category: string; ecosystem?: string }[] = [];
    const seenTemplates = new Set<string>();

    for (const pkg of packages) {
      const registry = pkg.type === 'npm' ? this.npmRegistry : this.composerRegistry;
      const mapping = registry[pkg.name];
      
      if (!mapping) continue;

      // Add common template
      if (mapping.common && !seenTemplates.has(mapping.common)) {
        templates.push({
          templatePath: mapping.common,
          category: mapping.category,
          ecosystem: mapping.ecosystem
        });
        seenTemplates.add(mapping.common);
      }

      // Add version-specific template
      if (mapping.versions) {
        const majorVersion = this.extractMajorVersion(pkg.version, pkg.name);
        const versionTemplate = mapping.versions[majorVersion];
        
        if (versionTemplate && !seenTemplates.has(versionTemplate)) {
          templates.push({
            templatePath: versionTemplate,
            category: mapping.category,
            ecosystem: mapping.ecosystem
          });
          seenTemplates.add(versionTemplate);
        }
      }
    }

    return templates;
  }

  private static extractMajorVersion(versionString: string, packageName: string): string {
    if (packageName === 'php') {
      // Handle PHP versions like ^8.1, >=8.2, ~8.3.0
      const match = versionString.match(/([8-9])\.([0-9]+)/);
      return match ? `${match[1]}.${match[2]}` : '8.1';
    } else {
      // Handle semver like ^4.0.0, ~2.1.0, >=3.0
      const match = versionString.match(/(\d+)/);
      return match ? match[1] : '1';
    }
  }

  static async getPackageMapping(packageName: string, type: 'npm' | 'composer'): Promise<PackageMapping | null> {
    await this.initialize();
    
    const registry = type === 'npm' ? this.npmRegistry : this.composerRegistry;
    return registry[packageName] || null;
  }

  static async getAllRegisteredPackages(): Promise<{ npm: string[]; composer: string[] }> {
    await this.initialize();
    
    return {
      npm: Object.keys(this.npmRegistry),
      composer: Object.keys(this.composerRegistry)
    };
  }

}