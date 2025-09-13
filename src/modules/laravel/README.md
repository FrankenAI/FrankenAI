# Laravel Module

Framework module for Laravel PHP framework detection and guidelines.

## Detection Criteria

- **Primary**: `artisan` command file
- **Secondary**: `laravel/framework` in `composer.json`
- **Tertiary**: Laravel directory structure (`app/Http`, `app/Models`, `routes`, etc.)

## Version Detection Criteria

- **Primary**: `laravel/framework` version in `composer.json`
- **Secondary**: `laravel/framework` version in `composer.lock`
- **Fallback**: `php artisan --version` command output

## Guidelines Provided

- `laravel/framework.md` - Core Laravel guidelines
- `laravel/{version}/features.md` - Version-specific features

## Commands Generated

### Development
- `php artisan serve` - Start development server
- `php artisan tinker` - Interactive REPL
- `npm run dev` - Build assets for development (if Vite/Webpack detected)

### Build
- `npm run build` - Build assets for production (if Vite detected)
- `npm run production` - Build assets for production (if Webpack detected)

### Testing
- `php artisan test` - Run Laravel tests
- `vendor/bin/phpunit` - Run PHPUnit tests
- `vendor/bin/pest` - Run Pest tests (if detected)

### Linting
- `./vendor/bin/pint` - Laravel Pint code style fixer
- `vendor/bin/php-cs-fixer fix` - PHP CS Fixer (if detected)
- `vendor/bin/phpstan analyse` - PHPStan static analysis (if detected)

### Installation
- `composer install` - Install PHP dependencies
- `npm install` / `yarn install` / `pnpm install` / `bun install` - Install Node dependencies (if package.json detected)

## Supported Versions

- Laravel 10.x
- Laravel 11.x
- Laravel 12.x