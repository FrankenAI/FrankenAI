## PHP 8.4 Guidelines

### Features Available in PHP 8.4

**All Previous Features Still Available**
- Enums (PHP 8.1)
- Readonly properties and classes (PHP 8.1 & 8.2)
- Typed class constants (PHP 8.3)
- Override attribute (PHP 8.3)
- json_validate() function (PHP 8.3)

**Property Hooks (New in PHP 8.4)**
```php
class User 
{
    private string $_name;
    
    // Property with get/set hooks
    public string $name {
        get => $this->_name;
        set(string $value) {
            if (strlen($value) < 2) {
                throw new ValueError('Name too short');
            }
            $this->_name = ucfirst(strtolower($value));
        }
    }
    
    // Computed property
    public string $displayName {
        get => strtoupper($this->name);
    }
    
    // Virtual property (no backing field)
    public bool $isLongName {
        get => strlen($this->name) > 10;
    }
}

// Usage
$user = new User();
$user->name = 'john doe';        // Triggers set hook
echo $user->name;                // 'John doe' (via get hook)
echo $user->displayName;         // 'JOHN DOE' (computed)
echo $user->isLongName;          // false (virtual)
```

**Asymmetric Visibility (New in PHP 8.4)**
```php
class BankAccount 
{
    // Public get, private set
    public private(set) float $balance = 0.0;
    
    // Protected get, private set
    protected private(set) string $accountNumber;
    
    public function deposit(float $amount): void 
    {
        $this->balance += $amount; // Can write (we're in the same class)
    }
    
    public function getBalance(): float 
    {
        return $this->balance; // Can read (public visibility)
    }
}

$account = new BankAccount();
echo $account->balance;          // ✅ Can read (public get)
$account->balance = 100;         // ❌ Error: Cannot write (private set)
```

**Array Functions Improvements (New in PHP 8.4)**
```php
// array_find() - finds first matching element
$users = [
    ['name' => 'John', 'age' => 25],
    ['name' => 'Jane', 'age' => 30],
];

$adult = array_find($users, fn($user) => $user['age'] >= 18);
// Returns: ['name' => 'John', 'age' => 25]

// array_find_key() - finds first matching key
$key = array_find_key($users, fn($user) => $user['name'] === 'Jane');
// Returns: 1

// array_any() and array_all()
$hasAdult = array_any($users, fn($user) => $user['age'] >= 18);  // true
$allAdults = array_all($users, fn($user) => $user['age'] >= 18); // true
```

**New mb_ucfirst() and mb_lcfirst() Functions**
```php
// Multibyte-safe string case functions
$text = 'élève';
echo mb_ucfirst($text);  // 'Élève' 
echo mb_lcfirst($text);  // 'élève'
```

**HTML5 Support in DOM (New in PHP 8.4)**
```php
// Better HTML5 parsing
$dom = new DOMDocument();
$dom->loadHTML5('<!DOCTYPE html><html><body><article>Content</article></body></html>');
```

### Performance Improvements in PHP 8.4
- Property hooks compiled efficiently (no performance overhead)
- Improved memory usage with asymmetric visibility
- Faster array operations with new array functions
- Enhanced JIT compilation for property access patterns

### Deprecated Features in PHP 8.4
- Implicit nullable parameter types
- Some legacy mbstring functions
- Passing null to non-nullable internal function parameters

### Migration from PHP 8.3
- Consider using property hooks instead of manual getter/setter methods
- Implement asymmetric visibility for better encapsulation
- Replace custom array finding logic with new array functions
- Update HTML parsing to use loadHTML5() method

### Best Practices for PHP 8.4
```php
class ModernClass 
{
    // Use property hooks for validation
    public string $email {
        set(string $value) {
            if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                throw new ValueError('Invalid email');
            }
            $this->email = $value;
        }
    }
    
    // Use asymmetric visibility for encapsulation
    public private(set) DateTime $createdAt;
    
    // Use typed constants
    public const array ALLOWED_DOMAINS = ['gmail.com', 'yahoo.com'];
    
    // Use override attribute for safety
    #[Override]
    public function jsonSerialize(): array 
    {
        return ['email' => $this->email, 'created' => $this->createdAt];
    }
}
```