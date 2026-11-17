<?php
/**
 * Plugin Name:       Visual Mega Menu Builder
 * Description:       ระบบจัดการและแสดงผล Mega Menu สำหรับจัดระเบียบหมวดหมู่สินค้า พร้อมตัวจัดการหลังบ้านแบบลากวาง (React Builder)
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Text Domain:       visual-mega-menu-builder
 *
 * @package visual-mega-menu-builder
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'VISUAL_MEGA_MENU_VERSION', '1.0.0' );
define( 'VISUAL_MEGA_MENU_PATH', plugin_dir_path( __FILE__ ) );
define( 'VISUAL_MEGA_MENU_URL', plugin_dir_url( __FILE__ ) );

require_once VISUAL_MEGA_MENU_PATH . 'includes/class-visual-mega-menu-rest.php';
require_once VISUAL_MEGA_MENU_PATH . 'includes/class-visual-mega-menu-admin.php';
require_once VISUAL_MEGA_MENU_PATH . 'includes/class-visual-mega-menu-frontend.php';

final class Visual_Mega_Menu_Builder {

	/**
	 * @var self|null
	 */
	private static $instance = null;

	/**
	 * @var Visual_Mega_Menu_Admin
	 */
	public $admin;

	/**
	 * @var Visual_Mega_Menu_REST
	 */
	public $rest;

	/**
	 * @var Visual_Mega_Menu_Frontend
	 */
	public $frontend;

	/**
	 * Main instance singleton
	 */
	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor
	 */
	private function __construct() {
		$this->rest     = new Visual_Mega_Menu_REST();
		$this->admin    = new Visual_Mega_Menu_Admin();
		$this->frontend = new Visual_Mega_Menu_Frontend();

		add_action( 'rest_api_init', array( $this->rest, 'register_routes' ) );

		if ( is_admin() ) {
			$this->admin->init();
		}

		$this->frontend->init();

		register_activation_hook( __FILE__, array( $this, 'on_activation' ) );
	}

	/**
	 * Seed initial options from Excel preset on activation if options are empty
	 */
	public function on_activation(): void {
		$plugin_opts = get_option( 'visual_mega_menu_options' );
		$theme_opts  = get_option( 'starter_theme_theme_options' );

		$has_plugin_builder = is_array( $plugin_opts ) && ! empty( $plugin_opts['visual_mega_menu_builder'] );
		$has_theme_builder  = is_array( $theme_opts ) && ! empty( $theme_opts['visual_mega_menu_builder'] );

		if ( ! $has_plugin_builder && ! $has_theme_builder ) {
			$preset = $this->rest->get_excel_preset_data();
			if ( ! empty( $preset ) ) {
				update_option( 'visual_mega_menu_options', $preset );
			}
		}
	}
}

/**
 * Access the main plugin instance
 */
function visual_mega_menu(): Visual_Mega_Menu_Builder {
	return Visual_Mega_Menu_Builder::instance();
}

/**
 * Global helper to render the Mega Menu directly in any template or hook
 *
 * @param array $args Options array: ['layout' => 'both'|'desktop'|'mobile', 'active_tab' => string]
 */
function visual_render_mega_menu( array $args = array() ): void {
	// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	echo Visual_Mega_Menu_Builder::instance()->frontend->render_menu( $args );
}

// Bootstrap plugin
visual_mega_menu();
