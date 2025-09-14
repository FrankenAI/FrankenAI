import fs from 'fs-extra';
import path from 'path';
import semver from 'semver';
import type { DetectionContext } from '../types/Module.js';

/**
 * Version information for npm packages
 */
export interface NpmVersionInfo {
  raw: string;           // '^18.0.0'
  major: number;         // 18
  installed?: string;    // '18.2.0' (if found in node_modules)
  source: 'dependency' | 'installed' | 'both';
}

/**
 * Version information for composer packages
 */
export interface ComposerVersionInfo {
  raw: string;           // '^11.0'
  major: number;         // 11
  installed?: string;    // '11.2.0' (if found in vendor)
  source: 'dependency' | 'installed' | 'both';
}

/**
 * Utility functions for version detection
 */
export class VersionUtils {
  /**
   * Get major version from semver string
   */
  static getMajorVersion(versionSpec: string): number {
    const cleaned = semver.clean(versionSpec) || semver.minVersion(versionSpec)?.version;
    return semver.major(cleaned || '0.0.0');
  }

  /**
   * Get installed npm package version
   */
  static async getNpmInstalledVersion(packageName: string, projectRoot: string): Promise<string | null> {
    try {
      // Try node_modules/package/package.json first
      const pkgPath = path.join(projectRoot, 'node_modules', packageName, 'package.json');
      if (await fs.pathExists(pkgPath)) {
        const pkg = await fs.readJson(pkgPath);
        return pkg.version || null;
      }

      // Fallback to package-lock.json
      const packageLockPath = path.join(projectRoot, 'package-lock.json');
      if (await fs.pathExists(packageLockPath)) {
        const packageLock = await fs.readJson(packageLockPath);

        // Check both old and new package-lock formats
        const packageDep = packageLock.dependencies?.[packageName] ||
                          packageLock.packages?.[`node_modules/${packageName}`];

        return packageDep?.version || null;
      }

      // Try yarn.lock parsing (simplified)
      const yarnLockPath = path.join(projectRoot, 'yarn.lock');
      if (await fs.pathExists(yarnLockPath)) {
        const yarnLock = await fs.readFile(yarnLockPath, 'utf-8');
        const packageMatch = yarnLock.match(new RegExp(`${packageName}@.*:\\s*version\\s+"([^"]+)"`));
        return packageMatch?.[1] || null;
      }

    } catch (error) {
      // Ignore file read errors
    }
    return null;
  }

  /**
   * Get installed composer package version
   */
  static async getComposerInstalledVersion(packageName: string, projectRoot: string): Promise<string | null> {
    try {
      const composerLockPath = path.join(projectRoot, 'vendor/composer/installed.json');

      if (await fs.pathExists(composerLockPath)) {
        const installed = await fs.readJson(composerLockPath);
        const packages = installed.packages || installed; // Handle different formats

        const targetPackage = Array.isArray(packages)
          ? packages.find((pkg: any) => pkg.name === packageName)
          : null;

        return targetPackage?.version || null;
      }

      // Fallback to composer.lock
      const composerLockFallback = path.join(projectRoot, 'composer.lock');
      if (await fs.pathExists(composerLockFallback)) {
        const composerLock = await fs.readJson(composerLockFallback);
        const targetPackage = composerLock.packages?.find(
          (pkg: any) => pkg.name === packageName
        );
        return targetPackage?.version || null;
      }
    } catch (error) {
      // Ignore file read errors
    }
    return null;
  }

  /**
   * Detect npm package version with hybrid approach
   */
  static async detectNpmVersionInfo(
    packageName: string,
    context: DetectionContext
  ): Promise<NpmVersionInfo | null> {
    const dependencySpec = context.packageJson?.dependencies?.[packageName] ||
                          context.packageJson?.devDependencies?.[packageName];
    if (!dependencySpec) return null;

    const specMajor = this.getMajorVersion(dependencySpec);
    const installedVersion = await this.getNpmInstalledVersion(packageName, context.projectRoot);
    const installedMajor = installedVersion ? this.getMajorVersion(installedVersion) : null;

    // Priorité à la version installée si elle existe
    const effectiveMajor = installedMajor || specMajor;
    const source = installedMajor && specMajor
      ? 'both'
      : installedMajor ? 'installed' : 'dependency';

    return {
      raw: dependencySpec,
      major: effectiveMajor,
      installed: installedVersion || undefined,
      source
    };
  }

  /**
   * Detect composer package version with hybrid approach
   */
  static async detectComposerVersionInfo(
    packageName: string,
    context: DetectionContext
  ): Promise<ComposerVersionInfo | null> {
    const dependencySpec = context.composerJson?.require?.[packageName];
    if (!dependencySpec) return null;

    const specMajor = this.getMajorVersion(dependencySpec);
    const installedVersion = await this.getComposerInstalledVersion(packageName, context.projectRoot);
    const installedMajor = installedVersion ? this.getMajorVersion(installedVersion) : null;

    // Priorité à la version installée si elle existe
    const effectiveMajor = installedMajor || specMajor;
    const source = installedMajor && specMajor
      ? 'both'
      : installedMajor ? 'installed' : 'dependency';

    return {
      raw: dependencySpec,
      major: effectiveMajor,
      installed: installedVersion || undefined,
      source
    };
  }
}