# PHP 8.5 Specific Features

## Pipe Operator

PHP 8.5 introduces the pipe operator (`|>`) for cleaner, more readable code by chaining operations:

```php
<?php

// Basic pipe operator usage
$length = " Hello, World! "
    |> trim(...)
    |> strtoupper(...)
    |> htmlentities(...)
    |> strlen(...);

echo $length; // 13

// Complex data processing pipeline
$widgets = [
    new Widget(tags: ['a', 'b', 'c']),
    new Widget(tags: ['c', 'd', 'e']),
    new Widget(tags: ['x', 'y', 'a']),
];

$uniqueTags = $widgets
    |> fn($x) => array_column($x, 'tags')
    |> fn($x) => array_merge(...$x)
    |> array_unique(...)
    |> array_values(...);

// Mixed callables in pipe
$processedData = $rawData
    |> json_decode(...)
    |> validateData(...)
    |> MyClass::transform(...)
    |> fn($data) => array_filter($data, fn($item) => $item['active'])
    |> $customProcessor;

// String processing pipeline
$slug = $title
    |> strtolower(...)
    |> fn($str) => preg_replace('/[^a-z0-9]+/', '-', $str)
    |> fn($str) => trim($str, '-')
    |> substr(..., 0, 50);

// Mathematical operations
$result = $numbers
    |> array_filter(..., fn($n) => $n > 0)
    |> array_map(..., fn($n) => $n * 2)
    |> array_sum(...);
```

## Array Helper Functions

The `array_first()` and `array_last()` functions retrieve first and last array elements:

```php
<?php

// Basic usage with indexed arrays
$numbers = [1, 2, 3, 4, 5];
$first = array_first($numbers); // 1
$last = array_last($numbers);   // 5

// Works with associative arrays
$user = [
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'role' => 'admin'
];
$firstName = array_first($user); // 'John Doe'
$lastValue = array_last($user);  // 'admin'

// Returns null for empty arrays
$empty = [];
$first = array_first($empty); // null
$last = array_last($empty);   // null

// Practical examples
class ProductService
{
    public function getLatestProduct(array $products): ?Product
    {
        return empty($products) ? null : array_last($products);
    }

    public function getFeaturedProduct(array $products): ?Product
    {
        $featured = array_filter($products, fn($p) => $p->isFeatured());
        return array_first($featured);
    }

    public function processQueue(array $queue): mixed
    {
        $nextItem = array_first($queue);

        if ($nextItem) {
            $this->process($nextItem);
            array_shift($queue);
        }

        return $nextItem;
    }
}

// Pipeline usage
$result = $data
    |> array_filter(..., fn($item) => $item['valid'])
    |> array_first(...);

$lastValid = $validationResults
    |> array_filter(..., fn($r) => $r->isSuccess())
    |> array_last(...);
```

## Closures in Constant Expressions

Static closures and first-class callables are now allowed in constant expressions:

```php
<?php

// Function with closure default parameter
function processItems(
    array $items,
    Closure $filter = static function ($item) {
        return !empty($item);
    }
): array {
    return array_filter($items, $filter);
}

// Class with closure constant
class DataProcessor
{
    public const DEFAULT_VALIDATOR = static function ($data): bool {
        return is_array($data) && !empty($data);
    };

    public const DEFAULT_TRANSFORMER = static function ($item) {
        return (object) $item;
    };

    public function process(
        array $data,
        ?Closure $validator = self::DEFAULT_VALIDATOR,
        ?Closure $transformer = self::DEFAULT_TRANSFORMER
    ): array {
        if (!$validator($data)) {
            throw new InvalidArgumentException('Invalid data provided');
        }

        return array_map($transformer, $data);
    }
}

// Attribute with closure
#[RouteHandler(
    middleware: static function ($request, $next) {
        // Validate request
        return $next($request);
    }
)]
class ApiController
{
    // Method with closure property default
    public function __construct(
        private Closure $errorHandler = static function ($error) {
            error_log($error->getMessage());
        }
    ) {}
}

// Enum with closure methods
enum ValidationRule
{
    case REQUIRED;
    case EMAIL;
    case NUMERIC;

    public const VALIDATORS = [
        self::REQUIRED => static fn($value) => !empty($value),
        self::EMAIL => static fn($value) => filter_var($value, FILTER_VALIDATE_EMAIL),
        self::NUMERIC => static fn($value) => is_numeric($value),
    ];

    public function validate($value): bool
    {
        return (self::VALIDATORS[$this])($value);
    }
}

// First-class callable as constant
class MathUtils
{
    public const OPERATIONS = [
        'add' => self::add(...),
        'multiply' => self::multiply(...),
        'power' => self::power(...),
    ];

    public static function add(int $a, int $b): int
    {
        return $a + $b;
    }

    public static function multiply(int $a, int $b): int
    {
        return $a * $b;
    }

    public static function power(int $base, int $exp): int
    {
        return $base ** $exp;
    }

    public static function calculate(string $operation, int $a, int $b): int
    {
        $callable = self::OPERATIONS[$operation] ?? null;

        if (!$callable) {
            throw new InvalidArgumentException("Unknown operation: $operation");
        }

        return $callable($a, $b);
    }
}
```

## Attributes on Constants

Support for attributes on constants with one constant per statement:

```php
<?php

// Attributes on class constants
class ApiEndpoints
{
    #[Route('/users', methods: ['GET'])]
    #[Cache(ttl: 3600)]
    public const USERS_LIST = '/api/users';

    #[Route('/users/{id}', methods: ['GET'])]
    #[Cache(ttl: 1800)]
    public const USER_DETAIL = '/api/users/{id}';

    #[Route('/users', methods: ['POST'])]
    #[RateLimit(requests: 10, window: 60)]
    public const USER_CREATE = '/api/users';

    #[Deprecated(since: '2.0', alternative: 'USER_PROFILE')]
    public const USER_INFO = '/api/user/info';
}

// Configuration constants with metadata
class DatabaseConfig
{
    #[Sensitive]
    #[EnvVar('DB_HOST')]
    public const HOST = 'localhost';

    #[Sensitive]
    #[EnvVar('DB_PASSWORD')]
    public const PASSWORD = '';

    #[EnvVar('DB_PORT', default: 3306)]
    #[Validation('integer', min: 1, max: 65535)]
    public const PORT = 3306;

    #[EnvVar('DB_NAME')]
    #[Required]
    public const DATABASE = 'app_database';
}

// Feature flags with attributes
class FeatureFlags
{
    #[Feature(description: 'Enable new user dashboard')]
    #[DefaultValue(false)]
    public const NEW_DASHBOARD = 'new_dashboard';

    #[Feature(description: 'Enable payment processing')]
    #[DefaultValue(false)]
    #[RequiresPermission('admin')]
    public const PAYMENT_ENABLED = 'payment_enabled';

    #[Feature(description: 'Beta testing features')]
    #[DefaultValue(false)]
    #[BetaFeature]
    public const BETA_FEATURES = 'beta_features';
}

// API versioning with attributes
class ApiVersions
{
    #[Version('1.0')]
    #[Deprecated(since: '2024-01-01', sunset: '2025-01-01')]
    public const V1 = 'v1';

    #[Version('2.0')]
    #[Stable]
    public const V2 = 'v2';

    #[Version('3.0')]
    #[Beta]
    public const V3 = 'v3';
}

// Using reflection to read constant attributes
class ConfigReader
{
    public static function getConstantMetadata(string $class, string $constant): array
    {
        $reflection = new ReflectionClass($class);
        $constantReflection = $reflection->getReflectionConstant($constant);

        $attributes = [];
        foreach ($constantReflection->getAttributes() as $attribute) {
            $attributes[] = $attribute->newInstance();
        }

        return $attributes;
    }
}
```

## Error Handling Improvements

Functions to retrieve current error and exception handlers, plus fatal error backtraces:

```php
<?php

// Get current error and exception handlers
class ErrorManager
{
    public function getCurrentHandlers(): array
    {
        return [
            'error_handler' => get_error_handler(),
            'exception_handler' => get_exception_handler()
        ];
    }

    public function setupCustomHandlers(): void
    {
        // Store original handlers
        $originalErrorHandler = get_error_handler();
        $originalExceptionHandler = get_exception_handler();

        // Set custom error handler
        set_error_handler(function ($severity, $message, $file, $line) use ($originalErrorHandler) {
            // Log error
            error_log("Error: $message in $file:$line");

            // Call original handler if exists
            if ($originalErrorHandler) {
                return $originalErrorHandler($severity, $message, $file, $line);
            }

            return false;
        });

        // Set custom exception handler
        set_exception_handler(function ($exception) use ($originalExceptionHandler) {
            // Log exception
            error_log("Uncaught exception: " . $exception->getMessage());

            // Call original handler if exists
            if ($originalExceptionHandler) {
                $originalExceptionHandler($exception);
            }
        });
    }

    public function restoreHandlers(): void
    {
        restore_error_handler();
        restore_exception_handler();
    }
}

// Enhanced debugging with fatal error backtraces
// fatal_error_backtraces INI setting is enabled by default in PHP 8.5
ini_set('fatal_error_backtraces', '1');

class DebugHelper
{
    public static function enableDetailedErrorReporting(): void
    {
        error_reporting(E_ALL);
        ini_set('display_errors', '1');
        ini_set('display_startup_errors', '1');
        ini_set('log_errors', '1');
        ini_set('fatal_error_backtraces', '1');
    }

    public static function logErrorContext($severity, $message, $file, $line): void
    {
        $backtrace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS);

        $context = [
            'severity' => $severity,
            'message' => $message,
            'file' => $file,
            'line' => $line,
            'backtrace' => $backtrace,
            'timestamp' => date('Y-m-d H:i:s'),
            'memory_usage' => memory_get_usage(true),
            'peak_memory' => memory_get_peak_usage(true)
        ];

        error_log(json_encode($context));
    }
}
```

## cURL Improvements

The `curl_multi_get_handles()` function manages multiple cURL sessions:

```php
<?php

class MultiCurlManager
{
    private CurlMultiHandle $multiHandle;
    private array $requests = [];

    public function __construct()
    {
        $this->multiHandle = curl_multi_init();
    }

    public function addRequest(string $url, array $options = []): CurlHandle
    {
        $handle = curl_init();
        curl_setopt_array($handle, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 30,
            ...$options
        ]);

        curl_multi_add_handle($this->multiHandle, $handle);
        $this->requests[spl_object_id($handle)] = [
            'handle' => $handle,
            'url' => $url,
            'options' => $options
        ];

        return $handle;
    }

    public function getAllHandles(): array
    {
        // Available in PHP 8.5
        return curl_multi_get_handles($this->multiHandle);
    }

    public function execute(): array
    {
        $running = null;
        do {
            curl_multi_exec($this->multiHandle, $running);
            curl_multi_select($this->multiHandle);
        } while ($running > 0);

        $results = [];
        $handles = $this->getAllHandles();

        foreach ($handles as $handle) {
            $id = spl_object_id($handle);
            $url = $this->requests[$id]['url'] ?? 'unknown';

            $results[$url] = [
                'content' => curl_multi_getcontent($handle),
                'info' => curl_getinfo($handle),
                'error' => curl_error($handle)
            ];

            curl_multi_remove_handle($this->multiHandle, $handle);
            curl_close($handle);
        }

        return $results;
    }

    public function getActiveHandleCount(): int
    {
        return count($this->getAllHandles());
    }

    public function cancelAllRequests(): void
    {
        $handles = $this->getAllHandles();

        foreach ($handles as $handle) {
            curl_multi_remove_handle($this->multiHandle, $handle);
            curl_close($handle);
        }

        $this->requests = [];
    }

    public function __destruct()
    {
        $this->cancelAllRequests();
        curl_multi_close($this->multiHandle);
    }
}

// Usage example
$multiCurl = new MultiCurlManager();

// Add multiple requests
$multiCurl->addRequest('https://api.github.com/user', [
    CURLOPT_HTTPHEADER => ['Authorization: token abc123']
]);

$multiCurl->addRequest('https://jsonplaceholder.typicode.com/posts/1');
$multiCurl->addRequest('https://httpbin.org/get');

// Execute all requests concurrently
$results = $multiCurl->execute();

foreach ($results as $url => $result) {
    if (empty($result['error'])) {
        echo "Success from $url: " . substr($result['content'], 0, 100) . "...\n";
    } else {
        echo "Error from $url: {$result['error']}\n";
    }
}
```

## Constants and Utilities

PHP 8.5 includes constants and utility functions:

```php
<?php

// PHP_BUILD_DATE constant
echo "PHP was built on: " . PHP_BUILD_DATE . "\n";

// Build information utility
class PHPInfo
{
    public static function getBuildInfo(): array
    {
        return [
            'version' => PHP_VERSION,
            'version_id' => PHP_VERSION_ID,
            'build_date' => PHP_BUILD_DATE,
            'os' => PHP_OS,
            'os_family' => PHP_OS_FAMILY,
            'sapi' => PHP_SAPI,
            'debug' => PHP_DEBUG,
            'thread_safe' => PHP_ZTS
        ];
    }

    public static function displayBuildInfo(): void
    {
        $info = self::getBuildInfo();

        echo "PHP Build Information:\n";
        echo "=====================\n";

        foreach ($info as $key => $value) {
            $displayKey = ucwords(str_replace('_', ' ', $key));
            $displayValue = is_bool($value) ? ($value ? 'Yes' : 'No') : $value;
            echo sprintf("%-15s: %s\n", $displayKey, $displayValue);
        }
    }
}

// CLI improvements with --ini=diff option
// Usage: php --ini=diff script.php
// Shows only INI settings that differ from default values

class INIHelper
{
    public static function getDifferences(): array
    {
        $current = ini_get_all();
        $differences = [];

        foreach ($current as $key => $setting) {
            if ($setting['local_value'] !== $setting['global_value']) {
                $differences[$key] = [
                    'global' => $setting['global_value'],
                    'local' => $setting['local_value']
                ];
            }
        }

        return $differences;
    }

    public static function displayDifferences(): void
    {
        $differences = self::getDifferences();

        if (empty($differences)) {
            echo "No INI setting differences found.\n";
            return;
        }

        echo "INI Setting Differences:\n";
        echo "=======================\n";

        foreach ($differences as $setting => $values) {
            echo sprintf(
                "%-30s: Global='%s' Local='%s'\n",
                $setting,
                $values['global'],
                $values['local']
            );
        }
    }
}
```

## Migration Considerations

```php
<?php

// Before PHP 8.5 - Verbose array access
function getFirstValidUser(array $users): ?User
{
    $validUsers = array_filter($users, fn($user) => $user->isActive());
    return empty($validUsers) ? null : reset($validUsers);
}

// PHP 8.5 - Clean with array_first()
function getFirstValidUser(array $users): ?User
{
    return $users
        |> array_filter(..., fn($user) => $user->isActive())
        |> array_first(...);
}

// Before PHP 8.5 - Complex constant expressions
class OldConfigClass
{
    public const DEFAULT_PROCESSOR = null; // Had to be null

    public function __construct()
    {
        $this->processor = self::DEFAULT_PROCESSOR ?? function ($data) {
            return $data;
        };
    }
}

// PHP 8.5 - Closures in constants
class NewConfigClass
{
    public const DEFAULT_PROCESSOR = static function ($data) {
        return $data;
    };

    public function __construct(
        private Closure $processor = self::DEFAULT_PROCESSOR
    ) {}
}

// Migration helper for pipe operator adoption
class PipelineConverter
{
    public static function convertNestedCalls($data)
    {
        // Old style
        // return array_values(array_unique(array_merge(...array_column($data, 'tags'))));

        // With pipe operator
        return $data
            |> array_column(..., 'tags')
            |> fn($tags) => array_merge(...$tags)
            |> array_unique(...)
            |> array_values(...);
    }
}
```

## PHP 8.5 Best Practices

1. **Use the pipe operator** for readable data transformation chains
2. **Adopt array_first() and array_last()** instead of verbose alternatives
3. **Leverage closures in constants** for cleaner default values
4. **Add attributes to constants** for better metadata and documentation
5. **Enable fatal error backtraces** for improved debugging
6. **Use curl_multi_get_handles()** for better concurrent request management
7. **Take advantage of new error handler functions** for better error management
8. **Migrate complex nested calls** to pipe operator chains where appropriate