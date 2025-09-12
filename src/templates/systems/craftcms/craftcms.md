## Craft CMS Guidelines

### Key Features & Best Practices

**Element Types & Field Management**
```twig
{# Template usage #}
{% for entry in craft.entries.section('news').limit(10) %}
    <article>
        <h2>{{ entry.title }}</h2>
        <div class="content">
            {{ entry.body }}
        </div>
        {% if entry.featuredImage.one() %}
            {{ entry.featuredImage.one().getImg() }}
        {% endif %}
    </article>
{% endfor %}
```

**Custom Field Types**
```php
// Plugin development
class CustomFieldType extends Field
{
    public static function displayName(): string
    {
        return 'Custom Field';
    }

    public function getInputHtml(mixed $value, ElementInterface $element = null): string
    {
        return Craft::$app->getView()->renderTemplate('plugin/field', [
            'name' => $this->handle,
            'value' => $value
        ]);
    }
}
```

**Craft Console Commands**
```bash
# Development
php craft serve                    # Development server
php craft migrate/all             # Run all migrations
php craft clear-caches/all        # Clear all caches

# Content Management  
php craft resave/entries          # Resave all entries
php craft index-assets            # Reindex assets

# Plugin Management
php craft plugin/install <handle> # Install plugin
php craft plugin/uninstall <handle> # Uninstall plugin
```

**Matrix Fields & Relations**
```twig
{# Matrix field blocks #}
{% for block in entry.contentBlocks %}
    {% switch block.type %}
        {% case "textBlock" %}
            <div class="text-block">
                {{ block.text }}
            </div>
        {% case "imageBlock" %}
            {% if block.image.one() %}
                {{ block.image.one().getImg() }}
            {% endif %}
    {% endswitch %}
{% endfor %}
```

### Security & Performance
- Use CSRF protection for forms
- Implement proper user permissions
- Optimize database queries with eager loading
- Use Craft's built-in caching mechanisms