<?php
/**
 * Admin Controller for Visual Mega Menu Builder
 *
 * Separates List View (Mega Menu Templates table) and Builder View (React Drag & Drop Builder).
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
		add_action( 'admin_post_vmm_delete_template', array( $this, 'handle_delete_template' ) );
	}

	/**
	 * Register admin pages
	 */
	public function register_admin_menus(): void {
		add_menu_page(
			__( 'Visual Mega Menu', 'visual-mega-menu-builder' ),
			__( 'Visual Mega Menu', 'visual-mega-menu-builder' ),
			'manage_options',
			'visual-mega-menu-builder',
			array( $this, 'render_admin_page' ),
			'dashicons-menu-alt3',
			28
		);

		add_submenu_page(
			'visual-mega-menu-builder',
			__( 'Mega Menu Templates', 'visual-mega-menu-builder' ),
			__( 'All Templates', 'visual-mega-menu-builder' ),
			'manage_options',
			'visual-mega-menu-builder',
			array( $this, 'render_admin_page' )
		);

		add_submenu_page(
			'visual-mega-menu-builder',
			__( 'Add New Mega Menu', 'visual-mega-menu-builder' ),
			__( 'Add New', 'visual-mega-menu-builder' ),
			'manage_options',
			'visual-mega-menu-builder&action=new',
			array( $this, 'render_admin_page' )
		);
	}

	/**
	 * Check whether current request is Builder View (new or edit).
	 */
	private function is_builder_view(): bool {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$action  = isset( $_GET['action'] ) ? sanitize_key( (string) wp_unslash( $_GET['action'] ) ) : '';
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$post_id = isset( $_GET['vmm_post'] ) ? absint( wp_unslash( $_GET['vmm_post'] ) ) : 0;

		return 'new' === $action || 'edit' === $action || $post_id > 0;
	}

	/**
	 * Route between List View and Builder View.
	 */
	public function render_admin_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'visual-mega-menu-builder' ) );
		}

		if ( $this->is_builder_view() ) {
			echo '<div id="visual-mega-menu-builder-root" class="visual-mega-menu-admin-wrap"></div>';
			return;
		}

		$this->render_list_view();
	}

	/**
	 * Render List View table of all Mega Menu Templates.
	 */
	private function render_list_view(): void {
		$templates = Visual_Mega_Menu_CPT::get_choices();
		$new_url   = add_query_arg(
			array(
				'page'   => 'visual-mega-menu-builder',
				'action' => 'new',
			),
			admin_url( 'admin.php' )
		);
		$menus_url = admin_url( 'nav-menus.php' );
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$deleted = isset( $_GET['vmm_deleted'] ) && '1' === (string) $_GET['vmm_deleted'];
		?>
		<div id="vmm-templates-list-wrap" class="wrap">
			<h1 class="wp-heading-inline"><?php echo esc_html__( 'Mega Menu Templates', 'visual-mega-menu-builder' ); ?></h1>
			<a id="vmm-add-new-btn" class="page-title-action" href="<?php echo esc_url( $new_url ); ?>">
				<?php echo esc_html__( 'Add New Mega Menu', 'visual-mega-menu-builder' ); ?>
			</a>
			<a id="vmm-go-menus-btn" class="page-title-action" href="<?php echo esc_url( $menus_url ); ?>">
				<?php echo esc_html__( 'Appearance > Menus', 'visual-mega-menu-builder' ); ?>
			</a>
			<hr class="wp-header-end">

			<?php if ( $deleted ) : ?>
				<div id="vmm-deleted-notice" class="notice notice-success is-dismissible">
					<p><?php echo esc_html__( 'ลบ Mega Menu Template เรียบร้อยแล้ว', 'visual-mega-menu-builder' ); ?></p>
				</div>
			<?php endif; ?>

			<p class="description" style="margin: 12px 0 16px;">
				<?php echo esc_html__( 'สร้างและจัดการเทมเพลต Mega Menu ที่นี่ จากนั้นไปที่ Appearance > Menus เพื่อเปิดใช้งานและเลือกผูกเทมเพลตกับรายการเมนูที่ต้องการ', 'visual-mega-menu-builder' ); ?>
			</p>

			<table id="vmm-templates-table" class="wp-list-table widefat fixed striped table-view-list">
				<thead>
					<tr>
						<th scope="col" class="manage-column column-primary"><?php echo esc_html__( 'Template Name', 'visual-mega-menu-builder' ); ?></th>
						<th scope="col" class="manage-column" style="width: 140px;"><?php echo esc_html__( 'Menu Items', 'visual-mega-menu-builder' ); ?></th>
						<th scope="col" class="manage-column" style="width: 120px;"><?php echo esc_html__( 'Status', 'visual-mega-menu-builder' ); ?></th>
						<th scope="col" class="manage-column" style="width: 180px;"><?php echo esc_html__( 'Last Modified', 'visual-mega-menu-builder' ); ?></th>
						<th scope="col" class="manage-column" style="width: 200px;"><?php echo esc_html__( 'Actions', 'visual-mega-menu-builder' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php if ( empty( $templates ) ) : ?>
						<tr>
							<td colspan="5" style="padding: 24px; text-align: center; color: #646970;">
								<?php echo esc_html__( 'ยังไม่มี Mega Menu Template — กดปุ่ม "Add New Mega Menu" เพื่อสร้างรายการแรก', 'visual-mega-menu-builder' ); ?>
							</td>
						</tr>
					<?php else : ?>
						<?php foreach ( $templates as $tpl ) : ?>
							<?php
							$tpl_id     = (int) $tpl->ID;
							$tpl_title  = '' !== trim( $tpl->post_title ) ? $tpl->post_title : '#' . $tpl_id;
							$stored     = Visual_Mega_Menu_CPT::get_config( $tpl_id );
							$item_count = ! empty( $stored['visual_mega_menu_builder']['menuItems'] ) && is_array( $stored['visual_mega_menu_builder']['menuItems'] )
								? count( $stored['visual_mega_menu_builder']['menuItems'] )
								: 0;
							$edit_url   = add_query_arg(
								array(
									'page'     => 'visual-mega-menu-builder',
									'action'   => 'edit',
									'vmm_post' => $tpl_id,
								),
								admin_url( 'admin.php' )
							);
							$delete_url = wp_nonce_url(
								add_query_arg(
									array(
										'action'   => 'vmm_delete_template',
										'vmm_post' => $tpl_id,
									),
									admin_url( 'admin-post.php' )
								),
								'vmm_delete_template_' . $tpl_id
							);
							?>
							<tr id="vmm-tpl-row-<?php echo esc_attr( (string) $tpl_id ); ?>">
								<td class="title column-title column-primary">
									<strong>
										<a class="row-title" href="<?php echo esc_url( $edit_url ); ?>">
											<?php echo esc_html( $tpl_title ); ?>
										</a>
									</strong>
									<div class="row-actions">
										<span class="edit">
											<a href="<?php echo esc_url( $edit_url ); ?>"><?php echo esc_html__( 'Edit in Builder', 'visual-mega-menu-builder' ); ?></a> |
										</span>
										<span class="trash">
											<a class="submitdelete" href="<?php echo esc_url( $delete_url ); ?>" onclick="return confirm('<?php echo esc_js( __( 'ยืนยันการลบ Mega Menu Template นี้?', 'visual-mega-menu-builder' ) ); ?>');">
												<?php echo esc_html__( 'Delete', 'visual-mega-menu-builder' ); ?>
											</a>
										</span>
									</div>
								</td>
								<td><?php echo esc_html( sprintf( '%d items', $item_count ) ); ?></td>
								<td><?php echo esc_html( ucfirst( (string) $tpl->post_status ) ); ?></td>
								<td><?php echo esc_html( get_the_modified_date( 'Y-m-d H:i', $tpl ) ); ?></td>
								<td>
									<a class="button button-primary button-small" href="<?php echo esc_url( $edit_url ); ?>">
										<?php echo esc_html__( 'Open Builder', 'visual-mega-menu-builder' ); ?>
									</a>
								</td>
							</tr>
						<?php endforeach; ?>
					<?php endif; ?>
				</tbody>
			</table>
		</div>
		<?php
	}

	/**
	 * Handle template deletion from List View.
	 */
	public function handle_delete_template(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions.', 'visual-mega-menu-builder' ) );
		}

		$post_id = isset( $_GET['vmm_post'] ) ? absint( wp_unslash( $_GET['vmm_post'] ) ) : 0;
		check_admin_referer( 'vmm_delete_template_' . $post_id );

		if ( $post_id > 0 && Visual_Mega_Menu_CPT::POST_TYPE === get_post_type( $post_id ) ) {
			wp_trash_post( $post_id );
		}

		wp_safe_redirect(
			add_query_arg(
				array(
					'page'        => 'visual-mega-menu-builder',
					'vmm_deleted' => '1',
				),
				admin_url( 'admin.php' )
			)
		);
		exit;
	}

	/**
	 * Enqueue admin scripts & styles (only on Builder View).
	 */
	public function enqueue_admin_assets( string $hook ): void {
		$is_plugin_page = ( false !== strpos( $hook, 'visual-mega-menu-builder' ) );
		$is_legacy_page = ( false !== strpos( $hook, 'starter-theme-mega-menu' ) );

		if ( ! $is_plugin_page && ! $is_legacy_page ) {
			return;
		}

		if ( $is_plugin_page && ! $this->is_builder_view() ) {
			return;
		}

		wp_enqueue_media();
		wp_enqueue_style( 'wp-components' );

		$remix_css_path = VISUAL_MEGA_MENU_PATH . 'assets/remixicon/fonts/remixicon.css';
		$remix_ver      = file_exists( $remix_css_path ) ? (string) filemtime( $remix_css_path ) : VISUAL_MEGA_MENU_VERSION;
		wp_enqueue_style(
			'visual-mega-menu-remixicon',
			VISUAL_MEGA_MENU_URL . 'assets/remixicon/fonts/remixicon.css',
			array(),
			$remix_ver
		);

		$admin_css_path = VISUAL_MEGA_MENU_PATH . 'assets/css/visual-mega-menu-admin.css';
		$admin_css_ver  = file_exists( $admin_css_path ) ? (string) filemtime( $admin_css_path ) : VISUAL_MEGA_MENU_VERSION;
		wp_enqueue_style(
			'visual-mega-menu-admin',
			VISUAL_MEGA_MENU_URL . 'assets/css/visual-mega-menu-admin.css',
			array( 'wp-components' ),
			$admin_css_ver
		);

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

		$api_url    = rest_url( 'visual-mega-menu/v1/options' );
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$post_id    = isset( $_GET['vmm_post'] ) ? absint( wp_unslash( $_GET['vmm_post'] ) ) : 0;
		$post_title = '';
		if ( $post_id > 0 && Visual_Mega_Menu_CPT::POST_TYPE === get_post_type( $post_id ) ) {
			$api_url    = add_query_arg( 'post_id', $post_id, $api_url );
			$post_title = get_the_title( $post_id );
		} else {
			$post_id    = 0;
			$post_title = __( 'New Mega Menu', 'visual-mega-menu-builder' );
		}

		$localize_data = array(
			'apiUrl'         => esc_url_raw( $api_url ),
			'restRoot'       => esc_url_raw( rest_url() ),
			'apiPrefix'      => '/visual-mega-menu/v1',
			'nonce'          => wp_create_nonce( 'wp_rest' ),
			'postId'         => $post_id,
			'postTitle'      => $post_title,
			'isTemplateMode' => true,
			'listUrl'        => esc_url_raw( admin_url( 'admin.php?page=visual-mega-menu-builder' ) ),
		);

		wp_localize_script( 'visual-mega-menu-builder', 'VisualMegaMenuSettings', $localize_data );
	}
}
