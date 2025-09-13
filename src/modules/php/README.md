# PHP Module

Language module for PHP programming language detection and guidelines.

## Detection Criteria

- **Primary**: `composer.json` presence
- **Secondary**: `.php` files in project
- **Tertiary**: PHP config files (`php.ini`, `.php-version`, `phpunit.xml`, etc.), PHP directory structure

## Version Detection Criteria

- **Primary**: `php` constraint in `composer.json` require section
- **Secondary**: `.php-version` file content
- **Tertiary**: `platform.php` in `composer.lock`

## Guidelines Provided

- `php/guidelines/language.md` - Core PHP language guidelines
- `php/guidelines/{version}/features.md` - Version-specific features

## Supported Versions

- PHP 8.1
- PHP 8.2
- PHP 8.3
- PHP 8.4
- PHP 8.5

## Detection Features

- Composer configuration detection
- PHP file counting
- Vendor directory detection
- PHP-specific config files detection (PHP CS Fixer, PHPUnit, PHPStan, etc.)
- PHP entry points detection (index.php, public/index.php)

## File Extensions

- `.php` - Primary PHP files
- `.phtml` - PHP HTML templates
- `.php4`, `.php5` - Legacy PHP versions
- `.phps` - PHP source files

## Directory Indicators

- `vendor/` - Composer dependencies
- `app/` - Application code
- `src/` - Source code
- `public/` - Public web directory
- `web/` - Alternative web directory
- `lib/` - Library code
- `include/` - Include files
- `tests/` - Test files