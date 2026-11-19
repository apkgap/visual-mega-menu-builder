<?php
/**
 * Custom post type that stores one mega menu design per post.
 *
 * @package visual-mega-menu-builder
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Visual_Mega_Menu_CPT {

	public const POST_TYPE = 'vmm_mega_menu';

	public const META_CONFIG = '_vmm_config';

	/**
	 * Register hooks.
	 */
	public function init(): void {
		add_action( 'init', array( __CLASS__, 'register' ) );
		add_filter( 'post_row_actions', array( $this, 'row_actions' ), 10, 2 );
		add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
	}

	/**
	 * Register the post type.
	 */
	public static function register(): void {
		register_post_type(
			self::POST_TYPE,
			array(
				'labels'              => array(
					'name'          => __( 'Mega Menus', 'visual-mega-menu-builder' ),
					'singular_name' => __( 'Mega Menu', 'visual-mega-menu-builder' ),
					'add_new_item'  => __( 'Add Mega Menu', 'visual-mega-menu-builder' ),
					'edit_item'     => __( 'Edit Mega Menu', 'visual-mega-menu-builder' ),
					'menu_name'     => __( 'Mega Menus', 'visual-mega-menu-builder' ),
				),
				'public'              => false,
				'show_ui'             => true,
				'show_in_menu'        => 'visual-mega-menu-builder',
				'show_in_rest'        => false,
				'exclude_from_search' => true,
				'publicly_queryable'  => false,
				'has_archive'         => false,
				'hierarchical'        => false,
				'menu_position'       => null,
				'supports'            => array( 'title' ),
				'capability_type'     => 'post',
				'map_meta_cap'        => true,
			)
		);
	}

	/**
	 * Link each mega menu to the visual builder.
	 *
	 * @param array<string, string> $actions Row actions.
	 * @param WP_Post               $post    Post.
	 * @return array<string, string>
	 */
	public function row_actions( array $actions, $post ): array {
		if ( ! $post instanceof WP_Post || self::POST_TYPE !== $post->post_type ) {
			return $actions;
		}

		$url = add_query_arg(
			array(
				'page'     => 'visual-mega-menu-builder',
				'vmm_post' => $post->ID,
			),
			admin_url( 'admin.php' )
		);

		$actions['vmm_design'] = '<a href="' . esc_url( $url ) . '">' . esc_html__( 'ออกแบบเมนู', 'visual-mega-menu-builder' ) . '</a>';

		return $actions;
	}

	/**
	 * Explain how this post is used.
	 */
	public function add_meta_box(): void {
		add_meta_box(
			'vmm-mega-usage',
			__( 'ใช้กับเมนู', 'visual-mega-menu-builder' ),
			array( $this, 'render_meta_box' ),
			self::POST_TYPE,
			'normal',
			'high'
		);
	}

	/**
	 * Meta box markup.
	 *
	 * @param WP_Post $post Post.
	 */
	public function render_meta_box( WP_Post $post ): void {
		$design_url = add_query_arg(
			array(
				'page'     => 'visual-mega-menu-builder',
				'vmm_post' => $post->ID,
			),
			admin_url( 'admin.php' )
		);
		$menus_url = admin_url( 'nav-menus.php' );
		?>
		<p><?php echo esc_html__( 'ตั้งชื่อเมก้าเมนูนี้ แล้วออกแบบเลย์เอาต์ จากนั้นไปที่หน้าเมนูแล้วเปิดใช้กับรายการที่ต้องการ', 'visual-mega-menu-builder' ); ?></p>
		<p>
			<a class="button button-primary" href="<?php echo esc_url( $design_url ); ?>"><?php echo esc_html__( 'เปิดตัวออกแบบ', 'visual-mega-menu-builder' ); ?></a>
			<a class="button" href="<?php echo esc_url( $menus_url ); ?>"><?php echo esc_html__( 'ไปหน้าเมนู', 'visual-mega-menu-builder' ); ?></a>
		</p>
		<?php
	}

	/**
	 * Published mega menus for the nav-menu picker.
	 *
	 * @return WP_Post[]
	 */
	public static function get_choices(): array {
		$posts = get_posts(
			array(
				'post_type'      => self::POST_TYPE,
				'post_status'    => array( 'publish', 'draft' ),
				'posts_per_page' => 100,
				'orderby'        => 'title',
				'order'          => 'ASC',
			)
		);

		return is_array( $posts ) ? $posts : array();
	}

	/**
	 * Stored builder payload for a mega menu post.
	 *
	 * @param int $post_id Post ID.
	 * @return array<string, mixed>
	 */
	public static function get_config( int $post_id ): array {
		if ( $post_id < 1 || self::POST_TYPE !== get_post_type( $post_id ) ) {
			return array();
		}

		$stored = get_post_meta( $post_id, self::META_CONFIG, true );
		return is_array( $stored ) ? $stored : array();
	}
}
