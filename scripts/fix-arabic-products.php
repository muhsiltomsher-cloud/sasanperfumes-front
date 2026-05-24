<?php
/**
 * Fix Arabic Products Script
 * 
 * 1. Deletes all 45 incorrect Arabic products
 * 2. Creates correct Arabic translations for 24 English products via WPML
 * 
 * Run via: wp eval-file scripts/fix-arabic-products.php
 */

// Prevent timeout
set_time_limit(0);

global $wpdb;
$prefix = $wpdb->prefix;

// ─── STEP 1: Delete all old Arabic products ───
echo "=== STEP 1: Deleting old Arabic products ===\n";

$ar_ids = $wpdb->get_col("
    SELECT p.ID FROM {$prefix}posts p 
    JOIN {$prefix}icl_translations t ON p.ID = t.element_id AND t.element_type = 'post_product' 
    WHERE p.post_type = 'product' AND t.language_code = 'ar'
");

echo "Found " . count($ar_ids) . " Arabic products to delete\n";

foreach ($ar_ids as $id) {
    $title = get_the_title($id);
    
    // Remove WPML translation entry
    $wpdb->delete("{$prefix}icl_translations", [
        'element_id' => $id,
        'element_type' => 'post_product',
    ]);
    
    // Delete product permanently (bypass trash)
    wp_delete_post($id, true);
    echo "  Deleted: #{$id} - {$title}\n";
}

// Also clean up orphaned WPML entries for post_product with NULL element_id
$wpdb->query("DELETE FROM {$prefix}icl_translations WHERE element_type = 'post_product' AND element_id IS NULL");
echo "Cleaned up orphaned WPML entries\n\n";

// ─── STEP 2: Get all English products ───
echo "=== STEP 2: Creating Arabic translations ===\n";

$en_products = $wpdb->get_results("
    SELECT p.ID, p.post_title, p.post_content, p.post_excerpt, p.post_name, p.post_status, 
           t.trid
    FROM {$prefix}posts p 
    JOIN {$prefix}icl_translations t ON p.ID = t.element_id AND t.element_type = 'post_product' 
    WHERE p.post_type = 'product' AND t.language_code = 'en' AND p.post_status = 'publish'
    ORDER BY p.ID
", ARRAY_A);

echo "Found " . count($en_products) . " English products to translate\n\n";

// Arabic translations for product names
$translations = [
    'TIMELESS JOY' => 'تايملس جوي',
    'ROOTS' => 'روتس',
    'GOLDEN HOUR' => 'غولدن آور',
    'WOODLAND HARMONY' => 'وودلاند هارموني',
    'WOODY HORIZON' => 'وودي هورايزون',
    'GOLDEN FOREST' => 'غولدن فورست',
    'MYSTIC GARDEN' => 'ميستيك غاردن',
    'WOODS CHILL' => 'وودز تشيل',
    'ROSE WOOD NOIR' => 'روز وود نوار',
    'SILKY CRYSTAL' => 'سيلكي كريستال',
    'SMOKY JASPER' => 'سموكي جاسبر',
    'LIGHT JADE' => 'لايت جيد',
    'ROYAL GARNET' => 'رويال غارنت',
    'PRECIOUS QUARTZ' => 'بريشيس كوارتز',
    'SOFT TURQUOISE' => 'سوفت تيركواز',
    'NOIR OBSIDIAN' => 'نوار أوبسيديان',
    'VELVET TOPAZ' => 'فيلفت توباز',
    'ORANGE BLOSSOM' => 'أورانج بلوسوم',
    'SILKY VIOLET' => 'سيلكي فايوليت',
    'TUBEROSE BLOOM' => 'تيوبروز بلوم',
    'TIMELESS SAKURA' => 'تايملس ساكورا',
    'SCARLET ROSE' => 'سكارليت روز',
    'PURE JASMINE' => 'بيور جاسمين',
    'MIMOSA GLOW' => 'ميموسا غلو',
];

$created = 0;
foreach ($en_products as $en) {
    $en_id = $en['ID'];
    $en_title = $en['post_title'];
    $trid = $en['trid'];
    
    // Get Arabic title (transliteration)
    $ar_title = isset($translations[$en_title]) ? $translations[$en_title] : $en_title;
    
    // Create the Arabic product post (duplicate of English)
    $ar_post_data = [
        'post_title'   => $ar_title,
        'post_content' => $en['post_content'], // Keep same content
        'post_excerpt' => $en['post_excerpt'],
        'post_name'    => $en['post_name'], // Same slug
        'post_status'  => 'publish',
        'post_type'    => 'product',
        'post_parent'  => 0,
    ];
    
    $ar_id = wp_insert_post($ar_post_data);
    
    if (is_wp_error($ar_id)) {
        echo "  ERROR creating Arabic for #{$en_id} ({$en_title}): " . $ar_id->get_error_message() . "\n";
        continue;
    }
    
    // Copy all post meta from English to Arabic
    $meta = $wpdb->get_results($wpdb->prepare(
        "SELECT meta_key, meta_value FROM {$prefix}postmeta WHERE post_id = %d",
        $en_id
    ), ARRAY_A);
    
    foreach ($meta as $m) {
        // Skip internal WP/WPML meta that shouldn't be copied
        if (in_array($m['meta_key'], ['_edit_lock', '_edit_last', '_wp_old_slug'])) continue;
        update_post_meta($ar_id, $m['meta_key'], maybe_unserialize($m['meta_value']));
    }
    
    // Copy taxonomy terms (product_cat, product_brand, product_tag, etc.)
    $taxonomies = ['product_cat', 'product_brand', 'product_tag', 'product_type', 'product_visibility'];
    foreach ($taxonomies as $tax) {
        $terms = wp_get_object_terms($en_id, $tax, ['fields' => 'ids']);
        if (!is_wp_error($terms) && !empty($terms)) {
            wp_set_object_terms($ar_id, $terms, $tax);
        }
    }
    
    // Register in WPML as Arabic translation of the English product
    $wpdb->insert("{$prefix}icl_translations", [
        'element_type'         => 'post_product',
        'element_id'           => $ar_id,
        'trid'                 => $trid,
        'language_code'        => 'ar',
        'source_language_code' => 'en',
    ]);
    
    $created++;
    echo "  Created: #{$ar_id} - {$ar_title} (translation of #{$en_id} - {$en_title})\n";
}

echo "\n=== DONE ===\n";
echo "Deleted: " . count($ar_ids) . " old Arabic products\n";
echo "Created: {$created} new Arabic translations\n";

// Clear WooCommerce caches
if (function_exists('wc_delete_product_transients')) {
    wc_delete_product_transients();
}
wp_cache_flush();
echo "Caches cleared.\n";
