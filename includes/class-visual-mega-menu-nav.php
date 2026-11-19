<?php
/**
 * Per menu-item mega menu switch on Appearance > Menus.
 *
 * @package visual-mega-menu-builder
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Visual_Mega_Menu_Nav {

	public const META_ENABLED = '_vmm_enabled';

	public const META_MEGA_ID = '_vmm_mega_id';

	/**
	 * Register hooks.
	 */
	public function init(): void {
		add_action( 'wp_nav_menu_item_custom_fields', array( $this, 'render_fields' ), 10, 2 );
		add_action( 'wp_update_nav_menu_item', array( $this, 'save_fields' ), 10, 2 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_menu_screen_css' ) );
		add_filter( 'nav_menu_css_class', array( $this, 'item_classes' ), 10, 2 );
		add_filter( 'walker_nav_menu_start_el', array( $this, 'append_panel' ), 20, 2 );
	}

	/**
	 * Small layout for the switch inside the menu editor.
	 *
	 * @param string $hook Current admin screen.
	 */
	public function enqueue_menu_screen_css( string $hook ): void {
		if ( 'nav-menus.php' !== $hook ) {
			return;
		}

		$css = '.vmm-menu-item-fields{margin:12px 0 4px;padding:10px 12px;background:#f6f7f7;border:1px solid #dcdcde;border-radius:4px;}'
			. '.vmm-menu-item-fields label{font-weight:600;}'
			. '.vmm-menu-item-fields select{max-width:100%;margin-top:6px;}'
			. '.vmm-menu-item-toggle{display:flex;align-items:center;gap:8px;}';

		wp_register_style( 'vmm-nav-menus', false, array(), VISUAL_MEGA_MENU_VERSION );
		wp_enqueue_style( 'vmm-nav-menus' );
		wp_add_inline_style( 'vmm-nav-menus', $css );
	}

	/**
	 * Fields shown under each menu item.
	 *
	 * @param int     $item_id Menu item ID.
	 * @param WP_Post $item    Menu item.
	 */
	public function render_fields( int $item_id, $item ): void {
		unset( $item );

		$enabled = get_post_meta( $item_id, self::META_ENABLED, true ) === '1';
		$mega_id = (int) get_post_meta( $item_id, self::META_MEGA_ID, true );
		$choices = Visual_Mega_Menu_CPT::get_choices();
		?>
		<div class="vmm-menu-item-fields">
			<p class="vmm-menu-item-toggle">
				<label for="vmm-enabled-<?php echo esc_attr( (string) $item_id ); ?>">
					<input
						type="checkbox"
						id="vmm-enabled-<?php echo esc_attr( (string) $item_id ); ?>"
						name="vmm-enabled[<?php echo esc_attr( (string) $item_id ); ?>]"
						value="1"
						<?php checked( $enabled ); ?>
					/>
					<?php echo esc_html__( 'เปิดใช้ Mega Menu', 'visual-mega-menu-builder' ); ?>
				</label>
			</p>
			<p>
				<label for="vmm-mega-id-<?php echo esc_attr( (string) $item_id ); ?>">
					<?php echo esc_html__( 'เลือกเมก้าเมนู', 'visual-mega-menu-builder' ); ?>
				</label><br />
				<select id="vmm-mega-id-<?php echo esc_attr( (string) $item_id ); ?>" name="vmm-mega-id[<?php echo esc_attr( (string) $item_id ); ?>]">
					<option value="0"><?php echo esc_html__( '— ไม่เลือก —', 'visual-mega-menu-builder' ); ?></option>
					<?php foreach ( $choices as $choice ) : ?>
						<option value="<?php echo esc_attr( (string) $choice->ID ); ?>" <?php selected( $mega_id, (int) $choice->ID ); ?>>
							<?php echo esc_html( $choice->post_title !== '' ? $choice->post_title : '#' . $choice->ID ); ?>
						</option>
					<?php endforeach; ?>
				</select>
			</p>
		</div>
		<?php
	}

	/**
	 * Persist the switch when the menu is saved.
	 *
	 * @param int $menu_id         Menu term ID.
	 * @param int $menu_item_db_id Menu item post ID.
	 */
	public function save_fields( int $menu_id, int $menu_item_db_id ): void {
		unset( $menu_id );

		if ( ! current_user_can( 'edit_theme_options' ) ) {
			return;
		}

		if ( ! isset( $_POST['menu-item-db-id'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			return;
		}

		check_admin_referer( 'update-nav_menu', 'update-nav-menu-nonce' );

		$enabled = $this->posted_flag( 'vmm-enabled', $menu_item_db_id );
		$mega_id = $this->posted_mega_id( $menu_item_db_id );

		if ( $mega_id > 0 && Visual_Mega_Menu_CPT::POST_TYPE !== get_post_type( $mega_id ) ) {
			$mega_id = 0;
		}

		update_post_meta( $menu_item_db_id, self::META_ENABLED, $enabled );
		update_post_meta( $menu_item_db_id, self::META_MEGA_ID, $mega_id );
	}

	/**
	 * Mark items that open a mega menu.
	 *
	 * @param string[] $classes CSS classes.
	 * @param WP_Post  $item    Menu item.
	 * @return string[]
	 */
	public function item_classes( array $classes, $item ): array {
		if ( $item instanceof WP_Post && $this->is_enabled( (int) $item->ID ) ) {
			$classes[] = 'menu-item-has-vmm';
		}
		return $classes;
	}

	/**
	 * Print the selected mega menu under the anchor.
	 *
	 * @param string  $item_output Item HTML.
	 * @param WP_Post $item        Menu item.
	 */
	public function append_panel( string $item_output, $item ): string {
		if ( ! $item instanceof WP_Post || ! $this->is_enabled( (int) $item->ID ) ) {
			return $item_output;
		}

		$mega_id = (int) get_post_meta( $item->ID, self::META_MEGA_ID, true );
		$config  = Visual_Mega_Menu_CPT::get_config( $mega_id );
		if ( empty( $config['visual_mega_menu_builder'] ) ) {
			return $item_output;
		}

		$html = visual_mega_menu()->frontend->render_menu(
			array(
				'layout'       => 'both',
				'config'       => $config,
				'container_id' => 'vmm-nav-' . (int) $item->ID,
			)
		);

		if ( '' === $html ) {
			return $item_output;
		}

		return $item_output . '<div class="vmm-nav-mega">' . $html . '</div>';
	}

	/**
	 * Checkbox value for one menu item. Unchecked boxes are missing from the request.
	 */
	private function posted_flag( string $field, int $item_id ): string {
		$map = isset( $_POST[ $field ] ) && is_array( $_POST[ $field ] ) ? wp_unslash( $_POST[ $field ] ) : array(); // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		return isset( $map[ $item_id ] ) ? '1' : '0';
	}

	/**
	 * Selected mega menu post for one menu item.
	 */
	private function posted_mega_id( int $item_id ): int {
		$map = isset( $_POST['vmm-mega-id'] ) && is_array( $_POST['vmm-mega-id'] ) ? wp_unslash( $_POST['vmm-mega-id'] ) : array(); // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		return isset( $map[ $item_id ] ) ? absint( $map[ $item_id ] ) : 0;
	}

	/**
	 * Whether this menu item should open a mega menu.
	 *
	 * @param int $item_id Menu item ID.
	 */
	private function is_enabled( int $item_id ): bool {
		return get_post_meta( $item_id, self::META_ENABLED, true ) === '1'
			&& (int) get_post_meta( $item_id, self::META_MEGA_ID, true ) > 0;
	}
}
