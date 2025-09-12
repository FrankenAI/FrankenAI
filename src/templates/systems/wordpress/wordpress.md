## WordPress Guidelines

### Modern WordPress Development

**Custom Post Types & Fields**
```php
// Register Custom Post Type
function register_product_post_type() {
    register_post_type('product', [
        'labels' => [
            'name' => 'Products',
            'singular_name' => 'Product'
        ],
        'public' => true,
        'has_archive' => true,
        'supports' => ['title', 'editor', 'thumbnail'],
        'show_in_rest' => true, // Gutenberg support
    ]);
}
add_action('init', 'register_product_post_type');

// Custom Fields (ACF pattern)
if (function_exists('acf_add_local_field_group')) {
    acf_add_local_field_group([
        'key' => 'group_product',
        'title' => 'Product Fields',
        'fields' => [
            [
                'key' => 'field_price',
                'label' => 'Price',
                'name' => 'price',
                'type' => 'number',
            ]
        ],
        'location' => [
            [
                [
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'product',
                ]
            ]
        ],
    ]);
}
```

**Custom Gutenberg Blocks**
```javascript
// Block registration
import { registerBlockType } from '@wordpress/blocks';
import { RichText } from '@wordpress/block-editor';

registerBlockType('theme/custom-block', {
    title: 'Custom Block',
    icon: 'smiley',
    category: 'common',
    
    edit: ({ attributes, setAttributes }) => {
        return (
            <RichText
                tagName="p"
                placeholder="Enter text..."
                value={attributes.content}
                onChange={(content) => setAttributes({ content })}
            />
        );
    },
    
    save: ({ attributes }) => {
        return <RichText.Content tagName="p" value={attributes.content} />;
    },
});
```

**REST API Extensions**
```php
// Custom REST endpoint
function register_custom_routes() {
    register_rest_route('myapi/v1', '/products', [
        'methods' => 'GET',
        'callback' => 'get_products_api',
        'permission_callback' => '__return_true',
    ]);
}
add_action('rest_api_init', 'register_custom_routes');

function get_products_api($request) {
    $products = get_posts([
        'post_type' => 'product',
        'numberposts' => 10,
    ]);
    
    return rest_ensure_response($products);
}
```

**Theme Development Best Practices**
```php
// functions.php essentials
function theme_setup() {
    // Theme support
    add_theme_support('post-thumbnails');
    add_theme_support('title-tag');
    add_theme_support('editor-styles');
    
    // Menus
    register_nav_menus([
        'primary' => 'Primary Menu',
        'footer' => 'Footer Menu',
    ]);
}
add_action('after_setup_theme', 'theme_setup');

// Enqueue assets properly
function theme_assets() {
    wp_enqueue_style('theme-style', get_stylesheet_uri());
    wp_enqueue_script('theme-script', get_template_directory_uri() . '/js/main.js', ['jquery'], '1.0', true);
}
add_action('wp_enqueue_scripts', 'theme_assets');
```

### Security & Performance
- Always sanitize input with `sanitize_text_field()`
- Use nonces for form security
- Implement proper user capabilities checking
- Use WP Cache and object caching
- Optimize database queries with `WP_Query` best practices