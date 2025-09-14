# Laravel Pint - Code Style Guidelines

*Based on Laravel Boost methodology - Automated code style fixing for PHP*

## Laravel Pint Overview

Laravel Pint is Laravel's official PHP code style fixer, built on top of PHP-CS-Fixer. It enforces consistent code style across your Laravel application with zero configuration required.

### Core Principles
- **Zero configuration** - Works out of the box with Laravel projects
- **PSR-12 compliant** - Follows PHP standards by default
- **Laravel optimized** - Understands Laravel conventions and patterns
- **Git-aware** - Can fix only changed files for faster CI/CD

## Basic Usage

### Running Pint
```bash
# Fix all PHP files in your project
./vendor/bin/pint

# Preview changes without applying them
./vendor/bin/pint --test

# Show diff of what would be changed
./vendor/bin/pint --diff

# Fix only dirty files (uncommitted changes)
./vendor/bin/pint --dirty

# Fix only staged files
./vendor/bin/pint --staged
```

### Common Commands
```bash
# Fix specific directories
./vendor/bin/pint app/
./vendor/bin/pint app/Models/

# Fix specific files
./vendor/bin/pint app/Models/User.php

# Exclude directories
./vendor/bin/pint --exclude=tests/
```

## Configuration

### Default Configuration
Pint works without any configuration, but you can customize it with a `pint.json` file:

```json
{
    "preset": "laravel",
    "rules": {
        "simplified_null_return": true,
        "braces": false,
        "new_with_braces": {
            "anonymous_class": false,
            "named_class": false
        }
    },
    "exclude": [
        "node_modules",
        "storage",
        "vendor"
    ]
}
```

### Available Presets
```json
{
    "preset": "laravel"     // Laravel conventions (default)
}
```

```json
{
    "preset": "psr12"       // Pure PSR-12 standard
}
```

```json
{
    "preset": "symfony"     // Symfony coding standards
}
```

### Custom Rules
```json
{
    "preset": "laravel",
    "rules": {
        "array_syntax": {"syntax": "short"},
        "binary_operator_spaces": {
            "default": "single_space",
            "operators": {"=>": "align", "=": "align"}
        },
        "blank_line_after_namespace": true,
        "class_attributes_separation": {
            "elements": {"method": "one"}
        },
        "concat_space": {"spacing": "one"},
        "method_chaining_indentation": true,
        "no_unused_imports": true,
        "not_operator_with_successor_space": false,
        "ordered_imports": {"sort_algorithm": "alpha"},
        "php_unit_method_casing": {"case": "camel_case"},
        "phpdoc_align": {"align": "vertical"},
        "return_type_declaration": {"space_before": "none"}
    }
}
```

## Laravel Integration Patterns

### Artisan Integration
```bash
# If you have Laravel's default composer scripts
composer pint

# Add to your composer.json
"scripts": {
    "pint": ["./vendor/bin/pint"],
    "pint-test": ["./vendor/bin/pint --test"],
    "pint-dirty": ["./vendor/bin/pint --dirty"]
}
```

### Pre-commit Integration
```json
// .husky/pre-commit or similar
{
    "scripts": {
        "pre-commit": [
            "./vendor/bin/pint --dirty --test"
        ]
    }
}
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Run Laravel Pint
  run: ./vendor/bin/pint --test

# Or fix and commit automatically
- name: Run Laravel Pint
  run: |
    ./vendor/bin/pint
    git add .
    git diff --staged --quiet || git commit -m "Fix code style with Laravel Pint"
```

## File and Directory Targeting

### Include/Exclude Patterns
```json
{
    "include": [
        "app/",
        "config/",
        "database/",
        "routes/",
        "tests/"
    ],
    "exclude": [
        "bootstrap/cache/",
        "node_modules/",
        "public/",
        "storage/",
        "vendor/",
        "resources/lang/"
    ]
}
```

### Path-Specific Rules
```json
{
    "preset": "laravel",
    "rules": {
        "Laravel/dd_to_dump": false
    },
    "finder": {
        "exclude": [
            "tests"
        ],
        "not-name": [
            "*.blade.php"
        ]
    }
}
```

## Laravel-Specific Rules

### Model Conventions
```php
// Pint automatically formats Laravel models
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
}
```

### Controller Formatting
```php
class UserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            User::query()
                ->select(['id', 'name', 'email'])
                ->paginate()
        );
    }

    public function store(CreateUserRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        return response()->json($user, 201);
    }
}
```

### Migration Formatting
```php
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
```

## Performance Tips

### Faster CI/CD
```bash
# Only check changed files
./vendor/bin/pint --dirty --test

# Use parallel processing (if available)
./vendor/bin/pint --parallel

# Cache results for faster subsequent runs
./vendor/bin/pint --cache-file=.pint.cache
```

### Selective Fixing
```bash
# Fix only Models
./vendor/bin/pint app/Models/

# Fix only recently changed files
git diff --name-only --diff-filter=AM | grep '\.php$' | xargs ./vendor/bin/pint
```

## Best Practices

### Development Workflow
1. **Run Pint before committing** - Ensure consistent style
2. **Use `--dirty` in pre-commit hooks** - Only fix changed files
3. **Use `--test` in CI** - Fail builds on style violations
4. **Configure IDE** - Set up your IDE to match Pint's formatting

### Team Consistency
- **Share pint.json** - Version control your Pint configuration
- **Document custom rules** - Explain why you deviate from defaults
- **Regular updates** - Keep Pint updated for latest PHP standards
- **IDE integration** - Configure team IDEs to match Pint formatting

### Laravel Best Practices
- **Let Pint handle formatting** - Don't manually format what Pint can fix
- **Focus on logic** - Spend time on code quality, not formatting
- **Consistent imports** - Let Pint organize your use statements
- **Method chaining** - Pint handles Eloquent query formatting beautifully