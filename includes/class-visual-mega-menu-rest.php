<?php
/**
 * REST API Controller for Visual Mega Menu Builder
 *
 * @package visual-mega-menu-builder
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Visual_Mega_Menu_REST {

	/**
	 * Register REST routes
	 */
	public function register_routes(): void {
		// Namespaces to register for compatibility
		$namespaces = array( 'visual-mega-menu/v1', 'starter_theme/v1' );

		foreach ( $namespaces as $ns ) {
			register_rest_route(
				$ns,
				'/options',
				array(
					array(
						'methods'             => 'GET',
						'callback'            => array( $this, 'get_options_api' ),
						'permission_callback' => array( $this, 'check_permission' ),
					),
					array(
						'methods'             => 'POST',
						'callback'            => array( $this, 'save_options_api' ),
						'permission_callback' => array( $this, 'check_permission' ),
					),
				)
			);

			register_rest_route(
				$ns,
				'/mega-builder-data',
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_mega_builder_data_api' ),
					'permission_callback' => array( $this, 'check_permission' ),
				)
			);

			register_rest_route(
				$ns,
				'/mega-categories',
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_mega_categories_api' ),
					'permission_callback' => array( $this, 'check_permission' ),
				)
			);
		}

		register_rest_route(
			'visual-mega-menu/v1',
			'/reset-preset',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'reset_preset_api' ),
				'permission_callback' => array( $this, 'check_permission' ),
			)
		);
	}

	/**
	 * Mega menu post id from the query string or the JSON body. Zero when it is not one of our posts.
	 *
	 * @param array<string, mixed> $body JSON body.
	 */
	private function mega_post_id_from_request( WP_REST_Request $request, array $body ): int {
		$post_id = absint( $request->get_param( 'post_id' ) );
		if ( $post_id < 1 && ! empty( $body['post_id'] ) ) {
			$post_id = absint( $body['post_id'] );
		}
		if ( $post_id < 1 || Visual_Mega_Menu_CPT::POST_TYPE !== get_post_type( $post_id ) ) {
			return 0;
		}
		return $post_id;
	}

	/**
	 * Payload the builder screen loads for one mega menu post.
	 *
	 * @return array<string, mixed>
	 */
	private function config_for_editor( int $post_id ): array {
		$stored = Visual_Mega_Menu_CPT::get_config( $post_id );
		if ( empty( $stored['visual_mega_menu_builder'] ) ) {
			$stored = array(
				'visual_mega_menu_builder' => array( 'menuItems' => array() ),
				'visual_mega_menu_items'   => array(),
			);
		}
		$stored['post_id'] = $post_id;
		return $stored;
	}

	/**
	 * Write the builder payload onto one mega menu post.
	 *
	 * @param array<string, mixed> $sanitized Clean payload.
	 */
	private function save_mega_post( int $post_id, array $sanitized, string $title = '' ): WP_REST_Response {
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return new WP_REST_Response( array( 'message' => 'Forbidden' ), 403 );
		}

		if ( '' !== trim( $title ) ) {
			wp_update_post(
				array(
					'ID'         => $post_id,
					'post_title' => sanitize_text_field( $title ),
				)
			);
		}

		$items = $sanitized['visual_mega_menu_builder']['menuItems'] ?? null;
		if ( is_array( $items ) && ! empty( $items ) ) {
			$this->ensure_mega_menu_terms_exist( $sanitized['visual_mega_menu_builder']['menuItems'] );
		}

		update_post_meta( $post_id, Visual_Mega_Menu_CPT::META_CONFIG, $sanitized );

		return rest_ensure_response(
			array(
				'success' => true,
				'post_id' => $post_id,
				'title'   => get_the_title( $post_id ),
				'message' => 'Mega Menu saved.',
			)
		);
	}

	/**
	 * Check admin permission
	 */
	public function check_permission(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Return current options
	 */
	public function get_options_api( WP_REST_Request $request ): WP_REST_Response {
		$post_id = $this->mega_post_id_from_request( $request, array() );
		if ( $post_id > 0 ) {
			return rest_ensure_response( $this->config_for_editor( $post_id ) );
		}

		$plugin_opts = get_option( 'visual_mega_menu_options', array() );
		$theme_opts  = get_option( 'starter_theme_theme_options', array() );

		$response = array();

		if ( is_array( $plugin_opts ) && ! empty( $plugin_opts['visual_mega_menu_builder'] ) ) {
			$response['visual_mega_menu_builder'] = $plugin_opts['visual_mega_menu_builder'];
			$response['visual_mega_menu_items']   = $plugin_opts['visual_mega_menu_items'] ?? array();
		} elseif ( is_array( $theme_opts ) && ! empty( $theme_opts['visual_mega_menu_builder'] ) ) {
			$response['visual_mega_menu_builder'] = $theme_opts['visual_mega_menu_builder'];
			$response['visual_mega_menu_items']   = $theme_opts['visual_mega_menu_items'] ?? array();
		} elseif ( is_array( $theme_opts ) && ! empty( $theme_opts['gbp_mega_menu_builder'] ) ) {
			$response['visual_mega_menu_builder'] = $theme_opts['gbp_mega_menu_builder'];
			$response['visual_mega_menu_items']   = $theme_opts['gbp_mega_menu_items'] ?? array();
		} else {
			// Load from preset JSON
			$preset = $this->get_excel_preset_data();
			if ( ! empty( $preset['visual_mega_menu_builder'] ) ) {
				$response['visual_mega_menu_builder'] = $preset['visual_mega_menu_builder'];
				$response['visual_mega_menu_items']   = $preset['visual_mega_menu_items'] ?? array();
			}
		}

		return rest_ensure_response( $response );
	}

	/**
	 * Save options
	 */
	public function save_options_api( WP_REST_Request $request ): WP_REST_Response {
		$params = $request->get_json_params();
		if ( empty( $params ) || ! is_array( $params ) ) {
			return new WP_REST_Response( array( 'message' => 'Invalid JSON payload' ), 400 );
		}

		$sanitized   = $this->sanitize_recursively( $params );
		$post_id     = $this->mega_post_id_from_request( $request, $sanitized );
		$is_template = ! empty( $params['is_template'] );
		$title       = isset( $params['title'] ) ? sanitize_text_field( (string) $params['title'] ) : '';
		unset( $sanitized['post_id'], $sanitized['is_template'], $sanitized['title'] );

		if ( $post_id > 0 ) {
			return $this->save_mega_post( $post_id, $sanitized, $title );
		}

		if ( $is_template ) {
			$new_post_id = wp_insert_post(
				array(
					'post_type'   => Visual_Mega_Menu_CPT::POST_TYPE,
					'post_status' => 'publish',
					'post_title'  => '' !== trim( $title ) ? $title : __( 'Untitled Mega Menu', 'visual-mega-menu-builder' ),
				),
				true
			);
			if ( is_wp_error( $new_post_id ) ) {
				return new WP_REST_Response( array( 'message' => $new_post_id->get_error_message() ), 500 );
			}
			return $this->save_mega_post( (int) $new_post_id, $sanitized );
		}

		if ( ! empty( $sanitized['visual_mega_menu_builder']['menuItems'] ) && is_array( $sanitized['visual_mega_menu_builder']['menuItems'] ) ) {
			$this->ensure_mega_menu_terms_exist( $sanitized['visual_mega_menu_builder']['menuItems'] );
		}

		// Save in dedicated plugin option
		$plugin_opts = get_option( 'visual_mega_menu_options', array() );
		if ( ! is_array( $plugin_opts ) ) {
			$plugin_opts = array();
		}
		$plugin_opts = array_merge( $plugin_opts, $sanitized );
		update_option( 'visual_mega_menu_options', $plugin_opts );

		// Sync with starter_theme_theme_options for backward compatibility
		$theme_opts = get_option( 'starter_theme_theme_options', array() );
		if ( ! is_array( $theme_opts ) ) {
			$theme_opts = array();
		}
		if ( isset( $sanitized['visual_mega_menu_builder'] ) ) {
			$theme_opts['visual_mega_menu_builder'] = $sanitized['visual_mega_menu_builder'];
		}
		if ( isset( $sanitized['visual_mega_menu_items'] ) ) {
			$theme_opts['visual_mega_menu_items'] = $sanitized['visual_mega_menu_items'];
		}
		update_option( 'starter_theme_theme_options', $theme_opts );

		return rest_ensure_response( array(
			'success' => true,
			'message' => 'Mega Menu options updated successfully.',
		) );
	}

	/**
	 * Reset to excel preset
	 */
	public function reset_preset_api(): WP_REST_Response {
		$preset = $this->get_excel_preset_data();
		if ( empty( $preset ) || empty( $preset['visual_mega_menu_builder'] ) ) {
			return new WP_REST_Response( array( 'message' => 'Preset file not found or invalid' ), 500 );
		}

		update_option( 'visual_mega_menu_options', $preset );

		$theme_opts = get_option( 'starter_theme_theme_options', array() );
		if ( ! is_array( $theme_opts ) ) {
			$theme_opts = array();
		}
		$theme_opts['visual_mega_menu_builder'] = $preset['visual_mega_menu_builder'];
		if ( ! empty( $preset['visual_mega_menu_items'] ) ) {
			$theme_opts['visual_mega_menu_items'] = $preset['visual_mega_menu_items'];
		}
		update_option( 'starter_theme_theme_options', $theme_opts );

		return rest_ensure_response( array(
			'success' => true,
			'message' => 'Reset to preset completed.',
		) );
	}

	/**
	 * Return full builder dataset: categories, pages, products, default tree, preset items
	 */
	public function get_mega_builder_data_api(): WP_REST_Response {
		$categories         = array();
		$default_menu_items = array();

		if ( taxonomy_exists( 'product_cat' ) ) {
			$exclude = array( 187 );
			$default = (int) get_option( 'default_product_cat' );
			if ( $default > 0 ) {
				$exclude[] = $default;
			}

			$terms = get_terms( array(
				'taxonomy'   => 'product_cat',
				'hide_empty' => false,
				'exclude'    => $exclude,
				'orderby'    => 'menu_order',
				'order'      => 'ASC',
			) );

			if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
				$terms_by_id  = array();
				$children_map = array();

				foreach ( $terms as $t ) {
					$tid = (int) $t->term_id;
					$pid = (int) $t->parent;
					if ( $pid === $tid ) {
						$pid       = 0;
						$t->parent = 0;
					}
					$terms_by_id[ $tid ] = $t;
					if ( ! isset( $children_map[ $pid ] ) ) {
						$children_map[ $pid ] = array();
					}
					$children_map[ $pid ][] = $tid;
				}

				foreach ( $terms as $term ) {
					$tid       = (int) $term->term_id;
					$pid       = (int) $term->parent;
					$thumb_id  = (int) get_term_meta( $tid, 'thumbnail_id', true );
					$thumb_url = $thumb_id > 0 ? (string) wp_get_attachment_image_url( $thumb_id, 'woocommerce_thumbnail' ) : '';
					if ( ! $thumb_url && $thumb_id > 0 ) {
						$thumb_url = (string) wp_get_attachment_image_url( $thumb_id, 'thumbnail' );
					}
					$term_link = get_term_link( $term );
					$term_url  = ! is_wp_error( $term_link ) ? (string) $term_link : home_url( '/?product_cat=' . $term->slug );

					$group_name = 'หมวดหมู่หลัก (Level 1)';
					if ( $pid > 0 && isset( $terms_by_id[ $pid ] ) ) {
						$group_name = $terms_by_id[ $pid ]->name;
					}

					$categories[] = array(
						'id'        => 'cat-' . $tid,
						'term_id'   => $tid,
						'parent'    => $pid,
						'name'      => $term->name,
						'slug'      => $term->slug,
						'icon'      => 'ri-box-3-line',
						'count'     => (int) $term->count,
						'group'     => $group_name,
						'url'       => $term_url,
						'thumb_url' => $thumb_url,
					);
				}

				// Build default MenuItem[] from top-level categories
				$top_ids = isset( $children_map[0] ) ? $children_map[0] : array();
				foreach ( $top_ids as $l1_id ) {
					if ( ! isset( $terms_by_id[ $l1_id ] ) ) {
						continue;
					}
					$l1_term      = $terms_by_id[ $l1_id ];
					$l1_link      = get_term_link( $l1_term );
					$l1_url       = ! is_wp_error( $l1_link ) ? (string) $l1_link : home_url( '/?product_cat=' . $l1_term->slug );
					$l1_thumb_id  = (int) get_term_meta( $l1_id, 'thumbnail_id', true );
					$l1_thumb_url = $l1_thumb_id > 0 ? (string) wp_get_attachment_image_url( $l1_thumb_id, 'woocommerce_thumbnail' ) : '';

					$l2_ids   = isset( $children_map[ $l1_id ] ) ? $children_map[ $l1_id ] : array();
					$columns  = array();
					$children = array();

					foreach ( $l2_ids as $l2_id ) {
						if ( ! isset( $terms_by_id[ $l2_id ] ) ) {
							continue;
						}
						$l2_term      = $terms_by_id[ $l2_id ];
						$l2_link      = get_term_link( $l2_term );
						$l2_url       = ! is_wp_error( $l2_link ) ? (string) $l2_link : home_url( '/?product_cat=' . $l2_term->slug );
						$l2_thumb_id  = (int) get_term_meta( $l2_id, 'thumbnail_id', true );
						$l2_thumb_url = $l2_thumb_id > 0 ? (string) wp_get_attachment_image_url( $l2_thumb_id, 'thumbnail' ) : '';

						$l3_ids    = isset( $children_map[ $l2_id ] ) ? $children_map[ $l2_id ] : array();
						$col_items = array();

						foreach ( $l3_ids as $l3_id ) {
							if ( ! isset( $terms_by_id[ $l3_id ] ) ) {
								continue;
							}
							$l3_term = $terms_by_id[ $l3_id ];
							$l3_link = get_term_link( $l3_term );
							$l3_url  = ! is_wp_error( $l3_link ) ? (string) $l3_link : home_url( '/?product_cat=' . $l3_term->slug );

							$l3_node = array(
								'id'       => 'link-term-' . $l3_id,
								'termId'   => $l3_id,
								'label'    => $l3_term->name,
								'url'      => $l3_url,
								'icon'     => 'ri-arrow-right-s-line',
								'children' => array(),
							);

							$col_items[] = $l3_node;
						}

						$children[] = array(
							'id'       => 'sub-term-' . $l2_id,
							'termId'   => $l2_id,
							'label'    => $l2_term->name,
							'url'      => $l2_url,
							'icon'     => 'ri-folder-3-line',
							'thumbUrl' => $l2_thumb_url,
							'children' => $col_items,
						);

						$columns[] = array(
							'id'       => 'col-term-' . $l2_id,
							'termId'   => $l2_id,
							'heading'  => $l2_term->name,
							'url'      => $l2_url,
							'thumbUrl' => $l2_thumb_url,
							'items'    => $col_items,
						);
					}

					if ( empty( $columns ) ) {
						$columns[] = array(
							'id'       => 'col-default-' . $l1_id,
							'termId'   => $l1_id,
							'heading'  => $l1_term->name,
							'url'      => $l1_url,
							'thumbUrl' => $l1_thumb_url,
							'items'    => array(),
						);
					}

					$default_menu_items[] = array(
						'id'                    => 'menu-term-' . $l1_id,
						'termId'                => $l1_id,
						'label'                 => $l1_term->name,
						'url'                   => $l1_url,
						'icon'                  => 'ri-box-3-line',
						'thumbUrl'              => $l1_thumb_url,
						'enableMegaMenu'        => true,
						'dropdownWidth'         => 'container',
						'columnsCount'          => 4,
						'showMenuIcons'         => true,
						'openInNewTab'          => false,
						'enableHoverDropdown'   => true,
						'enableMobileAccordion' => true,
						'children'              => $children,
						'columns'               => $columns,
						'promoCard'             => array(
							'enabled'  => true,
							'badge'    => 'หมวดหมู่แนะนำ',
							'title'    => $l1_term->name,
							'subtitle' => 'สินค้าคุณภาพ มาตรฐานโรงงาน พร้อมจัดส่งทั่วไทย',
							'ctaText'  => 'ดูสินค้าทั้งหมด',
							'ctaUrl'   => $l1_url,
						),
					);
				}
			}
		}

		// Pages
		$pages      = array();
		$page_posts = get_posts( array(
			'post_type'      => 'page',
			'post_status'    => 'publish',
			'posts_per_page' => 100,
			'orderby'        => 'menu_order title',
			'order'          => 'ASC',
		) );
		foreach ( $page_posts as $p ) {
			$pages[] = array(
				'id'    => 'page-' . $p->ID,
				'title' => $p->post_title ? $p->post_title : ( 'Page #' . $p->ID ),
				'slug'  => $p->post_name,
				'url'   => (string) get_permalink( $p->ID ),
				'icon'  => 'ri-pages-line',
			);
		}

		// Products
		$products   = array();
		$prod_posts = get_posts( array(
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'posts_per_page' => 80,
			'orderby'        => 'date',
			'order'          => 'DESC',
		) );
		$palette = array( '#EEF2FF', '#F0FDF4', '#FEF3C7', '#F3E8FF', '#E0F2FE' );
		foreach ( $prod_posts as $idx => $prod ) {
			$sku       = (string) get_post_meta( $prod->ID, '_sku', true );
			$raw_price = get_post_meta( $prod->ID, '_price', true );
			$thumb_url = get_the_post_thumbnail_url( $prod->ID, 'thumbnail' );
			$products[] = array(
				'id'         => 'prod-' . $prod->ID,
				'name'       => $prod->post_title,
				'sku'        => $sku !== '' ? $sku : ( 'ID-' . $prod->ID ),
				'price'      => $raw_price !== '' ? ( '฿' . number_format( (float) $raw_price ) ) : 'ดูราคา',
				'thumbColor' => $palette[ $idx % count( $palette ) ],
				'icon'       => 'ri-shopping-bag-3-line',
				'url'        => (string) get_permalink( $prod->ID ),
				'thumb_url'  => $thumb_url ? (string) $thumb_url : '',
			);
		}

		// Excel Preset Items
		$excel_preset_items = array();
		$preset_data        = $this->get_excel_preset_data();
		if ( ! empty( $preset_data['visual_mega_menu_builder']['menuItems'] ) ) {
			$excel_preset_items = $preset_data['visual_mega_menu_builder']['menuItems'];
			if ( function_exists( 'vmm_header_mega_term_url' ) ) {
				foreach ( $excel_preset_items as &$p_item ) {
					$p_tid         = isset( $p_item['termId'] ) ? (int) $p_item['termId'] : 0;
					$p_lbl         = isset( $p_item['label'] ) ? (string) $p_item['label'] : '';
					$p_url         = isset( $p_item['url'] ) ? (string) $p_item['url'] : '';
					$res_l1        = $p_tid;
					$p_item['url'] = vmm_header_mega_term_url( $p_tid, $p_url, $p_lbl, 0, $res_l1 );
					if ( $res_l1 > 0 ) {
						$p_item['termId'] = $res_l1;
					}
					if ( isset( $p_item['promoCard'] ) && is_array( $p_item['promoCard'] ) ) {
						$p_item['promoCard']['ctaUrl'] = $p_item['url'];
					}
					if ( ! empty( $p_item['columns'] ) && is_array( $p_item['columns'] ) ) {
						foreach ( $p_item['columns'] as &$p_col ) {
							$c_tid        = isset( $p_col['termId'] ) ? (int) $p_col['termId'] : 0;
							$c_lbl        = isset( $p_col['heading'] ) ? (string) $p_col['heading'] : '';
							$c_url        = isset( $p_col['url'] ) ? (string) $p_col['url'] : '';
							$res_l2       = $c_tid;
							$p_col['url'] = vmm_header_mega_term_url( $c_tid, $c_url, $c_lbl, $res_l1, $res_l2 );
							if ( $res_l2 > 0 ) {
								$p_col['termId'] = $res_l2;
							}
							if ( ! empty( $p_col['items'] ) && is_array( $p_col['items'] ) ) {
								foreach ( $p_col['items'] as &$p_lnk ) {
									$l_tid        = isset( $p_lnk['termId'] ) ? (int) $p_lnk['termId'] : 0;
									$l_lbl        = isset( $p_lnk['label'] ) ? (string) $p_lnk['label'] : '';
									$l_url        = isset( $p_lnk['url'] ) ? (string) $p_lnk['url'] : '';
									$res_l3       = $l_tid;
									$p_lnk['url'] = vmm_header_mega_term_url( $l_tid, $l_url, $l_lbl, $res_l2 > 0 ? $res_l2 : $res_l1, $res_l3 );
									if ( $res_l3 > 0 ) {
										$p_lnk['termId'] = $res_l3;
									}
								}
							}
						}
					}
				}
				unset( $p_item, $p_col, $p_lnk );
			}
		}

		return rest_ensure_response( array(
			'categories'         => $categories,
			'pages'              => $pages,
			'products'           => $products,
			'defaultMenuItems'   => $default_menu_items,
			'excelPresetItems'   => $excel_preset_items,
		) );
	}

	/**
	 * Flat categories for quick search
	 */
	public function get_mega_categories_api(): WP_REST_Response {
		if ( ! taxonomy_exists( 'product_cat' ) ) {
			return rest_ensure_response( array() );
		}

		$terms = get_terms( array(
			'taxonomy'   => 'product_cat',
			'hide_empty' => false,
			'orderby'    => 'menu_order',
			'order'      => 'ASC',
		) );

		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			return rest_ensure_response( array() );
		}

		$terms_by_id = array();
		foreach ( $terms as $t ) {
			$terms_by_id[ (int) $t->term_id ] = $t;
		}

		$result = array();
		foreach ( $terms as $term ) {
			$tid       = (int) $term->term_id;
			$pid       = (int) $term->parent;
			$thumb_id  = (int) get_term_meta( $tid, 'thumbnail_id', true );
			$thumb_url = $thumb_id > 0 ? (string) wp_get_attachment_image_url( $thumb_id, 'woocommerce_thumbnail' ) : '';
			$term_link = get_term_link( $term );
			$term_url  = ! is_wp_error( $term_link ) ? (string) $term_link : home_url( '/?product_cat=' . $term->slug );

			$group = 'หมวดหมู่หลัก (Level 1)';
			if ( $pid > 0 && isset( $terms_by_id[ $pid ] ) ) {
				$group = $terms_by_id[ $pid ]->name;
			}

			$result[] = array(
				'id'        => 'cat-' . $tid,
				'term_id'   => $tid,
				'parent'    => $pid,
				'name'      => $term->name,
				'slug'      => $term->slug,
				'icon'      => 'ri-box-3-line',
				'count'     => (int) $term->count,
				'group'     => $group,
				'url'       => $term_url,
				'thumb_url' => $thumb_url,
			);
		}

		return rest_ensure_response( $result );
	}

	/**
	 * Ensure terms exist and fix self-parenting loops
	 */
	public function ensure_mega_menu_terms_exist( array &$menu_items ): void {
		if ( ! taxonomy_exists( 'product_cat' ) ) {
			return;
		}

		$existing_terms = get_terms( array(
			'taxonomy'   => 'product_cat',
			'hide_empty' => false,
			'fields'     => 'id=>name',
		) );

		$existing_ids = is_array( $existing_terms ) ? array_keys( $existing_terms ) : array();

		foreach ( $menu_items as &$item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$l1_tid = isset( $item['termId'] ) ? (int) $item['termId'] : 0;
			if ( $l1_tid > 0 && in_array( $l1_tid, $existing_ids, true ) ) {
				$t = get_term( $l1_tid, 'product_cat' );
				if ( $t && ! is_wp_error( $t ) && (int) $t->parent === $l1_tid ) {
					wp_update_term( $l1_tid, 'product_cat', array( 'parent' => 0 ) );
				}
			}

			if ( ! empty( $item['columns'] ) && is_array( $item['columns'] ) ) {
				foreach ( $item['columns'] as &$col ) {
					if ( ! is_array( $col ) ) {
						continue;
					}
					$l2_tid = isset( $col['termId'] ) ? (int) $col['termId'] : 0;
					if ( $l2_tid > 0 && in_array( $l2_tid, $existing_ids, true ) ) {
						$t2 = get_term( $l2_tid, 'product_cat' );
						if ( $t2 && ! is_wp_error( $t2 ) && (int) $t2->parent === $l2_tid ) {
							$target_parent = ( $l1_tid > 0 && $l1_tid !== $l2_tid ) ? $l1_tid : 0;
							wp_update_term( $l2_tid, 'product_cat', array( 'parent' => $target_parent ) );
						}
					}

					if ( ! empty( $col['items'] ) && is_array( $col['items'] ) ) {
						foreach ( $col['items'] as &$lnk ) {
							if ( ! is_array( $lnk ) ) {
								continue;
							}
							$l3_tid = isset( $lnk['termId'] ) ? (int) $lnk['termId'] : 0;
							if ( $l3_tid > 0 && in_array( $l3_tid, $existing_ids, true ) ) {
								$t3 = get_term( $l3_tid, 'product_cat' );
								if ( $t3 && ! is_wp_error( $t3 ) && (int) $t3->parent === $l3_tid ) {
									$target_parent = ( $l2_tid > 0 && $l2_tid !== $l3_tid ) ? $l2_tid : 0;
									wp_update_term( $l3_tid, 'product_cat', array( 'parent' => $target_parent ) );
								}
							}
						}
					}
				}
			}
		}
		unset( $item, $col, $lnk );
	}

	/**
	 * Get Excel preset JSON data
	 */
	public function get_excel_preset_data(): array {
		$paths = array(
			VISUAL_MEGA_MENU_PATH . 'includes/mega-menu-excel-preset.json',
			get_template_directory() . '/inc/mega-menu-excel-preset.json',
		);

		foreach ( $paths as $p ) {
			if ( file_exists( $p ) ) {
				$raw = file_get_contents( $p );
				if ( $raw ) {
					$decoded = json_decode( $raw, true );
					if ( is_array( $decoded ) ) {
						return $decoded;
					}
				}
			}
		}

		return array();
	}

	/**
	 * Recursive sanitization
	 */
	private function sanitize_recursively( $data ) {
		if ( is_array( $data ) ) {
			$clean = array();
			foreach ( $data as $k => $v ) {
				$safe_key           = is_int( $k ) ? $k : (string) preg_replace( '/[^a-zA-Z0-9_-]/', '', (string) $k );
				$clean[ $safe_key ] = $this->sanitize_recursively( $v );
			}
			return $clean;
		} elseif ( is_string( $data ) ) {
			return sanitize_text_field( $data );
		}
		return $data;
	}
}
