<?php
/**
 * Admin Controller for Visual Mega Menu Builder
 *
 * @package visual-mega-menu-builder
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Visual_Mega_Menu_Admin {

	/**
	 * Initialize admin hooks
	 */
	public function init(): void {
		add_action( 'admin_menu', array( $this, 'register_admin_menus' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
	}

	/**
	 * Register admin pages
	 */
	public function register_admin_menus(): void {
		// Main top-level menu
		add_menu_page(
			__( 'Visual Mega Menu Builder', 'visual-mega-menu-builder' ),
			__( 'Visual Mega Menu', 'visual-mega-menu-builder' ),
			'manage_options',
			'visual-mega-menu-builder',
			array( $this, 'render_builder_page' ),
			'dashicons-menu-alt3',
			28
		);

		add_submenu_page(
			'visual-mega-menu-builder',
			__( 'Visual Mega Menu Builder', 'visual-mega-menu-builder' ),
			__( 'Builder & Settings', 'visual-mega-menu-builder' ),
			'manage_options',
			'visual-mega-menu-builder',
			array( $this, 'render_builder_page' )
		);
	}

	/**
	 * Render builder page root
	 */
	public function render_builder_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'visual-mega-menu-builder' ) );
		}

		// id MUST come before class
		echo '<div id="visual-mega-menu-builder-root" class="visual-mega-menu-admin-wrap"></div>';
	}

	/**
	 * Enqueue admin scripts & styles
	 */
	public function enqueue_admin_assets( string $hook ): void {
		// Only load on our menu page or legacy theme options page
		$is_plugin_page = ( false !== strpos( $hook, 'visual-mega-menu-builder' ) );
		$is_legacy_page = ( false !== strpos( $hook, 'starter-theme-mega-menu' ) );

		if ( ! $is_plugin_page && ! $is_legacy_page ) {
			return;
		}

		wp_enqueue_media();
		wp_enqueue_style( 'wp-components' );

		// Remix Icon stylesheet
		$remix_css_path = VISUAL_MEGA_MENU_PATH . 'assets/remixicon/fonts/remixicon.css';
		$remix_ver      = file_exists( $remix_css_path ) ? (string) filemtime( $remix_css_path ) : VISUAL_MEGA_MENU_VERSION;
		wp_enqueue_style(
			'visual-mega-menu-remixicon',
			VISUAL_MEGA_MENU_URL . 'assets/remixicon/fonts/remixicon.css',
			array(),
			$remix_ver
		);

		// Admin custom styles
		$admin_css_path = VISUAL_MEGA_MENU_PATH . 'assets/css/visual-mega-menu-admin.css';
		$admin_css_ver  = file_exists( $admin_css_path ) ? (string) filemtime( $admin_css_path ) : VISUAL_MEGA_MENU_VERSION;
		wp_enqueue_style(
			'visual-mega-menu-admin',
			VISUAL_MEGA_MENU_URL . 'assets/css/visual-mega-menu-admin.css',
			array( 'wp-components' ),
			$admin_css_ver
		);

		// React compiled script
		$asset_file = VISUAL_MEGA_MENU_PATH . 'dist/admin-mega-menu.asset.php';
		$deps       = array( 'wp-api-fetch', 'wp-element' );
		$ver        = VISUAL_MEGA_MENU_VERSION;

		if ( file_exists( $asset_file ) ) {
			$asset_info = require $asset_file;
			if ( is_array( $asset_info ) ) {
				$deps = $asset_info['dependencies'] ?? $deps;
				$ver  = (string) ( $asset_info['version'] ?? $ver );
			}
		}

		$script_path = VISUAL_MEGA_MENU_PATH . 'dist/admin-mega-menu.js';
		$script_ver  = file_exists( $script_path ) ? (string) filemtime( $script_path ) : $ver;

		wp_enqueue_script(
			'visual-mega-menu-builder',
			VISUAL_MEGA_MENU_URL . 'dist/admin-mega-menu.js',
			$deps,
			$script_ver,
			true
		);

		$localize_data = array(
			'apiUrl'    => esc_url_raw( rest_url( 'visual-mega-menu/v1/options' ) ),
			'restRoot'  => esc_url_raw( rest_url() ),
			'apiPrefix' => '/visual-mega-menu/v1',
			'nonce'     => wp_create_nonce( 'wp_rest' ),
		);

		wp_localize_script( 'visual-mega-menu-builder', 'VisualMegaMenuSettings', $localize_data );
	}
}
