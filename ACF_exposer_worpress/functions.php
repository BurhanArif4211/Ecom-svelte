<?php
/* Config */
add_theme_support('post-thumbnails');
add_theme_support('wp-block-styles');
add_theme_support('editor-styles');
add_theme_support('align-wide');

// 1. Automatically expose ALL ACF fields to REST API for all post types
add_action('rest_api_init', 'expose_all_acf_fields_to_rest');

function expose_all_acf_fields_to_rest() {
    // Get all field groups
    $field_groups = acf_get_field_groups();
    
    foreach ($field_groups as $field_group) {
        $fields = acf_get_fields($field_group['key']);
        
        foreach ($fields as $field) {
            // Auto-register field for REST API
            register_rest_field(
                get_post_types(), // Apply to all post types
                $field['name'],
                [
                    'get_callback' => 'get_acf_rest_field_value',
                    'update_callback' => null,
                    'schema' => null,
                ]
            );
        }
    }

}

// 2. Generic callback for ACF REST fields
function get_acf_rest_field_value($object, $field_name, $request) {
    $post_id = $object['id'];
    return get_field($field_name, $post_id);
}


// 6. Same origin check (your existing function)
function check_same_origin() {
    $request_origin = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';
    $site_url = get_site_url();
    
    $request_domain = parse_url($request_origin, PHP_URL_HOST);
    $site_domain = parse_url($site_url, PHP_URL_HOST);
    
    if ($request_domain === $site_domain || 
        $request_domain === 'localhost' || 
        strpos($request_domain, '.test') !== false ||
        empty($request_domain)) {
        return true;
    }
    
    return new WP_Error('rest_forbidden', __('Access denied. Requests must come from the same domain.'), ['status' => 403]);
}

// 7. Enhanced CORS headers
add_filter('rest_pre_serve_request', function($value) {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $site_url = get_site_url();
    
    $request_domain = parse_url($origin, PHP_URL_HOST);
    $site_domain = parse_url($site_url, PHP_URL_HOST);
    
    if ($request_domain === $site_domain || $request_domain === 'localhost') {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');
    }
    
    return $value;
});

// 8. Add options to native WordPress REST API endpoints
add_action('rest_api_init', function() {
    // Add ACF fields to all post types in REST API
    $post_types = get_post_types(['show_in_rest' => true], 'names');
    
    foreach ($post_types as $post_type) {
        register_rest_field($post_type, 'acf', [
            'get_callback' => function($object) {
                return get_fields($object['id']);
            },
            'update_callback' => null,
            'schema' => null,
        ]);
    }
});