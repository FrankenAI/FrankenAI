import type { Command } from 'commander';

/**
 * Command signature metadata - similar to Laravel Artisan
 */
export interface CommandSignature {
  /** Command name (e.g., 'modules', 'init') */
  name: string;

  /** Command alias (e.g., 'mod') */
  alias?: string;

  /** Command description */
  description: string;

  /** Command usage examples */
  usage?: string[];

  /** Command arguments */
  arguments?: CommandArgument[];

  /** Command options */
  options?: CommandOption[];

  /** Extended help content */
  help?: string;

  /** Command category for grouping */
  category?: string;

  /** Whether command is hidden from help */
  hidden?: boolean;
}

/**
 * Command argument definition
 */
export interface CommandArgument {
  /** Argument name */
  name: string;

  /** Argument description */
  description: string;

  /** Whether argument is required */
  required?: boolean;

  /** Default value */
  defaultValue?: any;
}

/**
 * Command option definition
 */
export interface CommandOption {
  /** Option flags (e.g., '-f, --force') */
  flags: string;

  /** Option description */
  description: string;

  /** Default value */
  defaultValue?: any;

  /** Whether option is required */
  required?: boolean;
}

/**
 * Base interface for all FrankenAI commands
 */
export interface BaseCommand {
  /** Get command signature metadata */
  getSignature(): CommandSignature;

  /** Configure the command with Commander.js */
  configure(program: Command): void;

  /** Execute the command */
  execute(...args: any[]): Promise<void>;
}