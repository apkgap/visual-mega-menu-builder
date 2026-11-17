<?php
/**
 * Frontend Controller & Renderer for Visual Mega Menu Builder
 *
 * @package visual-mega-menu-builder
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Visual_Mega_Menu_Frontend {

	/**
	 * Initialize frontend hooks
	 */
	public function init(): void {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_assets' ) );
		add_shortcode( 'visual_mega_menu', array( $this, 'render_shortcode' ) );

		// Polyfill theme global helpers on after_setup_theme if theme has not defined them
		add_action( 'after_setup_theme', array( $this, 'register_compatibility_polyfills' ), 999 );
	}

	/**
	 * Register compatibility polyfills only if not already declared by the active theme
	 */
	public function register_compatibility_polyfills(): void {
		if ( ! function_exists( 'vmm_header_mega_menu_config' ) ) {
			/**
			 * Polyfill vmm_header_mega_menu_config for theme header
			 */
			function vmm_header_mega_menu_config(): array {
				return Visual_Mega_Menu_Frontend::get_config();
			}
		}

		if ( ! function_exists( 'vmm_header_mega_term_url' ) ) {
			/**
			 * Polyfill vmm_header_mega_term_url for theme header
			 */
			function vmm_header_mega_term_url( $term_id, $raw_url = '', $label = '', $parent_term_id = 0, &$resolved_id = 0 ): string {
				return Visual_Mega_Menu_Frontend::resolve_term_url( (int) $term_id, (string) $raw_url, (string) $label, (int) $parent_term_id, $resolved_id );
			}
		}
	}

	/**
	 * Enqueue frontend CSS and interactive script
	 */
	public function enqueue_frontend_assets(): void {
		$remix_css_path = VISUAL_MEGA_MENU_PATH . 'assets/remixicon/fonts/remixicon.css';
		$remix_ver      = file_exists( $remix_css_path ) ? (string) filemtime( $remix_css_path ) : VISUAL_MEGA_MENU_VERSION;

		if ( ! wp_style_is( 'starter-theme-remixicon', 'enqueued' ) && ! wp_style_is( 'remixicon', 'enqueued' ) ) {
			wp_enqueue_style(
				'visual-mega-menu-remixicon',
				VISUAL_MEGA_MENU_URL . 'assets/remixicon/fonts/remixicon.css',
				array(),
				$remix_ver
			);
		}

		$css_path = VISUAL_MEGA_MENU_PATH . 'assets/css/visual-mega-menu-frontend.css';
		$css_ver  = file_exists( $css_path ) ? (string) filemtime( $css_path ) : VISUAL_MEGA_MENU_VERSION;
		wp_enqueue_style(
			'visual-mega-menu-frontend',
			VISUAL_MEGA_MENU_URL . 'assets/css/visual-mega-menu-frontend.css',
			array(),
			$css_ver
		);

		$js_path = VISUAL_MEGA_MENU_PATH . 'assets/js/visual-mega-menu-frontend.js';
		$js_ver  = file_exists( $js_path ) ? (string) filemtime( $js_path ) : VISUAL_MEGA_MENU_VERSION;
		wp_enqueue_script(
			'visual-mega-menu-frontend',
			VISUAL_MEGA_MENU_URL . 'assets/js/visual-mega-menu-frontend.js',
			array(),
			$js_ver,
			true
		);
	}

	/**
	 * Shortcode handler
	 */
	public function render_shortcode( $atts = array() ): string {
		$args = shortcode_atts(
			array(
				'layout'    => 'both',
				'active_tab'=> '',
			),
			$atts,
			'visual_mega_menu'
		);

		return $this->render_menu( $args );
	}

	/**
	 * Resolve term archive URL efficiently
	 */
	public static function resolve_term_url( int $term_id, string $raw_url = '', string $label = '', int $parent_term_id = 0, &$resolved_id = 0 ): string {
		static $terms_by_id   = null;
		static $terms_by_name = null;
		static $link_cache    = array();

		$resolved_id = $term_id;

		if ( ! taxonomy_exists( 'product_cat' ) ) {
			return $raw_url;
		}

		if ( null === $terms_by_id ) {
			$terms_by_id   = array();
			$terms_by_name = array();
			$all_terms     = get_terms(
				array(
					'taxonomy'   => 'product_cat',
					'hide_empty' => false,
				)
			);
			if ( ! is_wp_error( $all_terms ) && is_array( $all_terms ) ) {
				foreach ( $all_terms as $t ) {
					if ( (int) $t->parent === (int) $t->term_id ) {
						$t->parent = 0;
					}
					$tid                 = (int) $t->term_id;
					$terms_by_id[ $tid ] = $t;
					$name_key            = mb_strtolower( trim( $t->name ) );
					if ( ! isset( $terms_by_name[ $name_key ] ) ) {
						$terms_by_name[ $name_key ] = array();
					}
					$terms_by_name[ $name_key ][] = $t;
				}
			}
		}

		$is_category_shaped = (
			'' === $raw_url
			|| '#' === $raw_url
			|| false !== strpos( $raw_url, '?product_cat=' )
			|| false !== strpos( $raw_url, 'filter_cat' )
			|| false !== strpos( $raw_url, '/product-category/' )
		);

		if ( ! $is_category_shaped ) {
			return $raw_url;
		}

		$term = null;
		if ( $term_id > 0 && isset( $terms_by_id[ $term_id ] ) ) {
			$candidate = $terms_by_id[ $term_id ];
			if ( '' === $label || mb_strtolower( trim( $candidate->name ) ) === mb_strtolower( $label ) || $term_id < 1000 ) {
				$term = $candidate;
			}
		}

		if ( ! $term && '' !== $label ) {
			$name_key = mb_strtolower( $label );
			if ( ! empty( $terms_by_name[ $name_key ] ) ) {
				foreach ( $terms_by_name[ $name_key ] as $m_term ) {
					if ( $parent_term_id > 0 && (int) $m_term->parent === $parent_term_id ) {
						$term = $m_term;
						break;
					}
				}
				if ( ! $term ) {
					$term = reset( $terms_by_name[ $name_key ] );
				}
			}
		}

		if ( $term ) {
			$tid         = (int) $term->term_id;
			$resolved_id = $tid;
			if ( ! isset( $link_cache[ $tid ] ) ) {
				$t_link             = get_term_link( $term, 'product_cat' );
				$link_cache[ $tid ] = ! is_wp_error( $t_link ) ? (string) $t_link : '';
			}
			if ( '' !== $link_cache[ $tid ] ) {
				return $link_cache[ $tid ];
			}
		}

		if ( $parent_term_id > 0 && isset( $terms_by_id[ $parent_term_id ] ) ) {
			if ( ! isset( $link_cache[ $parent_term_id ] ) ) {
				$p_link                        = get_term_link( $terms_by_id[ $parent_term_id ], 'product_cat' );
				$link_cache[ $parent_term_id ] = ! is_wp_error( $p_link ) ? (string) $p_link : '';
			}
			if ( '' !== $link_cache[ $parent_term_id ] ) {
				return $link_cache[ $parent_term_id ];
			}
		}

		if ( false !== strpos( $raw_url, 'http://example.local' ) ) {
			$raw_url = str_replace( 'http://example.local', untrailingslashit( home_url() ), $raw_url );
		}

		return ( '' === $raw_url || '#' === $raw_url ) ? '#' : $raw_url;
	}

	/**
	 * Retrieve normalized configuration
	 *
	 * @return array{tabs: array, visibility: array}
	 */
	public static function get_config(): array {
		$plugin_opts = get_option( 'visual_mega_menu_options', array() );
		$builder     = array();

		if ( is_array( $plugin_opts ) && ! empty( $plugin_opts['visual_mega_menu_builder'] ) && is_array( $plugin_opts['visual_mega_menu_builder'] ) ) {
			$builder = $plugin_opts['visual_mega_menu_builder'];
		} else {
			$theme_opts = get_option( 'starter_theme_theme_options', array() );
			if ( is_array( $theme_opts ) && ! empty( $theme_opts['visual_mega_menu_builder'] ) && is_array( $theme_opts['visual_mega_menu_builder'] ) ) {
				$builder = $theme_opts['visual_mega_menu_builder'];
			} else {
				// Fallback to preset
				$preset_path = VISUAL_MEGA_MENU_PATH . 'includes/mega-menu-excel-preset.json';
				if ( file_exists( $preset_path ) ) {
					$preset_raw = file_get_contents( $preset_path );
					if ( $preset_raw ) {
						$decoded = json_decode( $preset_raw, true );
						if ( is_array( $decoded ) && ! empty( $decoded['visual_mega_menu_builder'] ) ) {
							$builder = $decoded['visual_mega_menu_builder'];
						}
					}
				}
			}
		}

		$vis_raw = isset( $builder['visibilitySettings'] ) && is_array( $builder['visibilitySettings'] )
			? $builder['visibilitySettings']
			: array();

		$visibility = array(
			'hoverToOpen'     => isset( $vis_raw['hoverToOpen'] ) ? ( $vis_raw['hoverToOpen'] !== false && (string) $vis_raw['hoverToOpen'] !== '0' ) : true,
			'showIcons'       => isset( $vis_raw['showIcons'] ) ? ( $vis_raw['showIcons'] !== false && (string) $vis_raw['showIcons'] !== '0' ) : true,
			'mobileAccordion' => isset( $vis_raw['mobileAccordion'] ) ? ( $vis_raw['mobileAccordion'] !== false && (string) $vis_raw['mobileAccordion'] !== '0' ) : true,
		);

		$tabs = array();

		if ( ! empty( $builder['menuItems'] ) && is_array( $builder['menuItems'] ) ) {
			foreach ( $builder['menuItems'] as $idx => $item ) {
				if ( ! is_array( $item ) ) {
					continue;
				}
				$enabled = isset( $item['enableMegaMenu'] )
					? ( $item['enableMegaMenu'] !== false && (string) $item['enableMegaMenu'] !== '0' )
					: true;
				if ( ! $enabled ) {
					continue;
				}

				$term_id      = isset( $item['termId'] ) ? (int) $item['termId'] : 0;
				$thumb_url    = ! empty( $item['thumb_url'] )
					? (string) $item['thumb_url']
					: ( ! empty( $item['thumbUrl'] ) ? (string) $item['thumbUrl'] : '' );
				$banner_thumb = $thumb_url;
				$item_url     = ! empty( $item['url'] ) ? (string) $item['url'] : '';

				if ( $term_id <= 0 && ! empty( $item['id'] ) && preg_match( '/term-(\d+)$/', (string) $item['id'], $id_matches ) ) {
					$term_id = (int) $id_matches[1];
				}

				$item_label     = ! empty( $item['label'] ) ? (string) $item['label'] : '';
				$resolved_l1_id = $term_id;
				if ( $term_id > 0 || '' !== $item_label ) {
					$item_url = self::resolve_term_url( $term_id, $item_url, $item_label, 0, $resolved_l1_id );
					if ( $resolved_l1_id > 0 ) {
						$term_id = $resolved_l1_id;
					}
					$t_thumb_id = $term_id > 0 ? (int) get_term_meta( $term_id, 'thumbnail_id', true ) : 0;
					if ( $t_thumb_id > 0 ) {
						if ( empty( $thumb_url ) ) {
							$thumb_url = (string) wp_get_attachment_image_url( $t_thumb_id, 'woocommerce_thumbnail' );
						}
						$med = wp_get_attachment_image_url( $t_thumb_id, 'medium' );
						if ( $med ) {
							$banner_thumb = (string) $med;
						}
					}
				}

				$cols_raw = isset( $item['columns'] ) && is_array( $item['columns'] ) ? $item['columns'] : array();
				$columns  = array();
				foreach ( $cols_raw as $c_idx => $col ) {
					if ( ! is_array( $col ) ) {
						continue;
					}
					$col_tid = isset( $col['termId'] ) ? (int) $col['termId'] : 0;
					if ( $col_tid <= 0 && ! empty( $col['id'] ) && preg_match( '/term-(\d+)$/', (string) $col['id'], $col_id_matches ) ) {
						$col_tid = (int) $col_id_matches[1];
					}
					$col_heading    = ! empty( $col['heading'] ) ? (string) $col['heading'] : '';
					$col_url        = ! empty( $col['url'] ) ? (string) $col['url'] : '';
					$resolved_l2_id = $col_tid;
					if ( $col_tid > 0 || '' !== $col_heading ) {
						$col_url = self::resolve_term_url( $col_tid, $col_url, $col_heading, $term_id, $resolved_l2_id );
						if ( $resolved_l2_id > 0 ) {
							$col_tid = $resolved_l2_id;
						}
					}
					$col_thumb = ! empty( $col['thumb_url'] )
						? (string) $col['thumb_url']
						: ( ! empty( $col['thumbUrl'] ) ? (string) $col['thumbUrl'] : '' );
					if ( empty( $col_thumb ) && $col_tid > 0 ) {
						$ct_id = (int) get_term_meta( $col_tid, 'thumbnail_id', true );
						if ( $ct_id > 0 ) {
							$col_thumb = (string) wp_get_attachment_image_url( $ct_id, 'thumbnail' );
						}
					}

					$links_raw = isset( $col['items'] ) && is_array( $col['items'] ) ? $col['items'] : array();
					$links     = array();
					foreach ( $links_raw as $l_idx => $lnk ) {
						if ( ! is_array( $lnk ) || empty( $lnk['label'] ) ) {
							continue;
						}
						$lnk_tid = isset( $lnk['termId'] ) ? (int) $lnk['termId'] : 0;
						if ( $lnk_tid <= 0 && ! empty( $lnk['id'] ) && preg_match( '/term-(\d+)$/', (string) $lnk['id'], $lnk_id_matches ) ) {
							$lnk_tid = (int) $lnk_id_matches[1];
						}
						$lnk_label      = (string) $lnk['label'];
						$lnk_url        = ! empty( $lnk['url'] ) ? (string) $lnk['url'] : '#';
						$resolved_l3_id = $lnk_tid;
						if ( $lnk_tid > 0 || '' !== $lnk_label ) {
							$lnk_url = self::resolve_term_url( $lnk_tid, $lnk_url, $lnk_label, $col_tid > 0 ? $col_tid : $term_id, $resolved_l3_id );
						}
						$links[] = array(
							'id'           => ! empty( $lnk['id'] ) ? (string) $lnk['id'] : ( 'lnk-' . $idx . '-' . $c_idx . '-' . $l_idx ),
							'label'        => (string) $lnk['label'],
							'url'          => $lnk_url,
							'icon'         => ! empty( $lnk['icon'] ) ? (string) $lnk['icon'] : 'ri-arrow-right-s-line',
							'openInNewTab' => ! empty( $lnk['openInNewTab'] ) && (string) $lnk['openInNewTab'] !== '0',
						);
					}

					$columns[] = array(
						'id'        => ! empty( $col['id'] ) ? (string) $col['id'] : ( 'col-' . $idx . '-' . $c_idx ),
						'heading'   => ! empty( $col['heading'] ) ? (string) $col['heading'] : '',
						'url'       => $col_url,
						'thumb_url' => $col_thumb,
						'items'     => $links,
					);
				}

				$cols_count = isset( $item['columnsCount'] ) ? (int) $item['columnsCount'] : 4;
				if ( $cols_count < 2 || $cols_count > 6 ) {
					$cols_count = 4;
				}

				$tabs[] = array(
					'key'                  => ! empty( $item['id'] ) ? sanitize_html_class( (string) $item['id'] ) : ( 'tab-' . $idx ),
					'label'                => ! empty( $item['label'] ) ? (string) $item['label'] : 'Category',
					'url'                  => ! empty( $item_url ) ? $item_url : '#',
					'icon'                 => ! empty( $item['icon'] ) ? (string) $item['icon'] : 'ri-box-3-line',
					'thumb_url'            => $thumb_url,
					'banner_thumb_url'     => $banner_thumb,
					'dropdown_width'       => ( isset( $item['dropdownWidth'] ) && $item['dropdownWidth'] === 'full' ) ? 'full' : 'container',
					'columns_count'        => $cols_count,
					'show_menu_icons'      => ! isset( $item['showMenuIcons'] ) || ( $item['showMenuIcons'] !== false && (string) $item['showMenuIcons'] !== '0' ),
					'open_in_new_tab'      => ! empty( $item['openInNewTab'] ) && (string) $item['openInNewTab'] !== '0',
					'enable_hover'         => ! isset( $item['enableHoverDropdown'] ) || ( $item['enableHoverDropdown'] !== false && (string) $item['enableHoverDropdown'] !== '0' ),
					'enable_mobile_accord' => ! isset( $item['enableMobileAccordion'] ) || ( $item['enableMobileAccordion'] !== false && (string) $item['enableMobileAccordion'] !== '0' ),
					'columns'              => $columns,
				);
			}
		}

		return array(
			'tabs'       => $tabs,
			'visibility' => $visibility,
		);
	}

	/**
	 * Render standalone mega menu HTML
	 */
	public function render_menu( array $args = array() ): string {
		$config     = self::get_config();
		$tabs       = $config['tabs'];
		$visibility = $config['visibility'];

		if ( empty( $tabs ) ) {
			return '';
		}

		$layout     = $args['layout'] ?? 'both';
		$active_tab = ! empty( $args['active_tab'] ) ? (string) $args['active_tab'] : $tabs[0]['key'];

		ob_start();
		?>
		<!-- id MUST come before class -->
		<div id="visual-mega-menu-builder-container" class="visual-mega-menu-builder-wrapper">

			<?php if ( 'mobile' !== $layout ) : ?>
			<!-- Desktop View -->
			<div id="visual-mega-desktop-view" class="visual-mega-desktop">
				<!-- Left Sidebar Tabs -->
				<ul id="visual-mega-tabs-list" class="visual-mega-tabs-list" role="tablist">
					<?php foreach ( $tabs as $idx => $tab ) : ?>
						<?php
						$is_active = ( $tab['key'] === $active_tab || ( empty( $active_tab ) && 0 === $idx ) );
						$tab_id    = 'visual-mega-tab-btn-' . esc_attr( $tab['key'] );
						$panel_id  = 'visual-mega-panel-' . esc_attr( $tab['key'] );
						?>
						<li>
							<button
								id="<?php echo esc_attr( $tab_id ); ?>"
								class="visual-mega-tab-btn<?php echo $is_active ? ' is-active' : ''; ?>"
								type="button"
								role="tab"
								aria-selected="<?php echo $is_active ? 'true' : 'false'; ?>"
								aria-controls="<?php echo esc_attr( $panel_id ); ?>"
								data-tab="<?php echo esc_attr( $tab['key'] ); ?>"
								data-hover="<?php echo $tab['enable_hover'] ? '1' : '0'; ?>"
							>
								<?php if ( ! empty( $tab['thumb_url'] ) ) : ?>
									<img src="<?php echo esc_url( $tab['thumb_url'] ); ?>" class="visual-mega-tab-thumb" alt="" loading="lazy" />
								<?php elseif ( ! empty( $visibility['showIcons'] ) && ! empty( $tab['show_menu_icons'] ) ) : ?>
									<i class="<?php echo esc_attr( $tab['icon'] ); ?> visual-mega-tab-icon" aria-hidden="true"></i>
								<?php endif; ?>
								<span><?php echo esc_html( $tab['label'] ); ?></span>
								<i class="ri-arrow-right-s-line visual-mega-tab-arrow" aria-hidden="true"></i>
							</button>
						</li>
					<?php endforeach; ?>
				</ul>

				<!-- Right Content Panels -->
				<div id="visual-mega-panels-wrap" class="visual-mega-content-area">
					<?php foreach ( $tabs as $idx => $tab ) : ?>
						<?php
						$is_active = ( $tab['key'] === $active_tab || ( empty( $active_tab ) && 0 === $idx ) );
						$panel_id  = 'visual-mega-panel-' . esc_attr( $tab['key'] );
						$tab_id    = 'visual-mega-tab-btn-' . esc_attr( $tab['key'] );
						$cols      = ! empty( $tab['columns'] ) ? $tab['columns'] : array();
						$cols_num  = $tab['columns_count'] ?? 4;
						?>
						<div
							id="<?php echo esc_attr( $panel_id ); ?>"
							class="visual-mega-panel<?php echo $is_active ? ' is-active' : ''; ?>"
							role="tabpanel"
							aria-labelledby="<?php echo esc_attr( $tab_id ); ?>"
							data-panel="<?php echo esc_attr( $tab['key'] ); ?>"
						>
							<?php if ( ! empty( $cols ) ) : ?>
								<div class="visual-mega-columns-grid cols-<?php echo esc_attr( (string) $cols_num ); ?>">
									<?php foreach ( $cols as $col_idx => $col ) : ?>
										<div class="visual-mega-col">
											<?php if ( ! empty( $col['heading'] ) ) : ?>
												<a href="<?php echo esc_url( $col['url'] ?: '#' ); ?>" class="visual-mega-col-heading">
													<?php if ( ! empty( $col['thumb_url'] ) ) : ?>
														<img src="<?php echo esc_url( $col['thumb_url'] ); ?>" class="visual-mega-col-thumb" alt="" loading="lazy" />
													<?php endif; ?>
													<span><?php echo esc_html( $col['heading'] ); ?></span>
												</a>
											<?php endif; ?>

											<?php if ( ! empty( $col['items'] ) ) : ?>
												<ul class="visual-mega-links-list">
													<?php foreach ( $col['items'] as $lnk ) : ?>
														<li class="visual-mega-link-item">
															<a
																href="<?php echo esc_url( $lnk['url'] ?: '#' ); ?>"
																<?php echo ! empty( $lnk['openInNewTab'] ) ? 'target="_blank" rel="noopener noreferrer"' : ''; ?>
															>
																<i class="<?php echo esc_attr( $lnk['icon'] ?: 'ri-arrow-right-s-line' ); ?>" aria-hidden="true"></i>
																<span><?php echo esc_html( $lnk['label'] ); ?></span>
															</a>
														</li>
													<?php endforeach; ?>
												</ul>
											<?php endif; ?>
										</div>
									<?php endforeach; ?>
								</div>
							<?php endif; ?>
						</div>
					<?php endforeach; ?>
				</div>
			</div>
			<?php endif; ?>

			<?php if ( 'desktop' !== $layout ) : ?>
			<!-- Mobile Accordion View -->
			<div id="visual-mega-mobile-view" class="visual-mega-mobile">
				<?php foreach ( $tabs as $idx => $tab ) : ?>
					<?php
					$item_id = 'visual-mega-mobile-item-' . esc_attr( $tab['key'] );
					$body_id = 'visual-mega-mobile-body-' . esc_attr( $tab['key'] );
					$cols    = ! empty( $tab['columns'] ) ? $tab['columns'] : array();
					?>
					<div id="<?php echo esc_attr( $item_id ); ?>" class="visual-mega-mobile-item">
						<div class="visual-mega-mobile-header">
							<a href="<?php echo esc_url( $tab['url'] ); ?>" class="visual-mega-mobile-title">
								<?php if ( ! empty( $tab['thumb_url'] ) ) : ?>
									<img src="<?php echo esc_url( $tab['thumb_url'] ); ?>" class="visual-mega-tab-thumb" alt="" loading="lazy" />
								<?php elseif ( ! empty( $visibility['showIcons'] ) && ! empty( $tab['show_menu_icons'] ) ) : ?>
									<i class="<?php echo esc_attr( $tab['icon'] ); ?>" aria-hidden="true"></i>
								<?php endif; ?>
								<span><?php echo esc_html( $tab['label'] ); ?></span>
							</a>
							<?php if ( ! empty( $cols ) && ! empty( $visibility['mobileAccordion'] ) && ! empty( $tab['enable_mobile_accord'] ) ) : ?>
								<button
									class="visual-mega-mobile-toggle"
									type="button"
									aria-expanded="false"
									aria-controls="<?php echo esc_attr( $body_id ); ?>"
									aria-label="<?php echo esc_attr__( 'เปิด/ปิดหมวดหมู่ย่อย', 'visual-mega-menu-builder' ); ?>"
								>
									<i class="ri-arrow-down-s-line" aria-hidden="true"></i>
								</button>
							<?php endif; ?>
						</div>

						<?php if ( ! empty( $cols ) && ! empty( $visibility['mobileAccordion'] ) && ! empty( $tab['enable_mobile_accord'] ) ) : ?>
							<div id="<?php echo esc_attr( $body_id ); ?>" class="visual-mega-mobile-body">
								<?php foreach ( $cols as $col ) : ?>
									<div class="visual-mega-mobile-col" style="margin-bottom: 12px;">
										<?php if ( ! empty( $col['heading'] ) ) : ?>
											<a href="<?php echo esc_url( $col['url'] ?: '#' ); ?>" class="visual-mega-col-heading" style="font-size: 13.5px;">
												<?php if ( ! empty( $col['thumb_url'] ) ) : ?>
													<img src="<?php echo esc_url( $col['thumb_url'] ); ?>" class="visual-mega-col-thumb" alt="" loading="lazy" />
												<?php endif; ?>
												<span><?php echo esc_html( $col['heading'] ); ?></span>
											</a>
										<?php endif; ?>

										<?php if ( ! empty( $col['items'] ) ) : ?>
											<ul class="visual-mega-links-list" style="padding-left: 8px;">
												<?php foreach ( $col['items'] as $lnk ) : ?>
													<li class="visual-mega-link-item">
														<a
															href="<?php echo esc_url( $lnk['url'] ?: '#' ); ?>"
															<?php echo ! empty( $lnk['openInNewTab'] ) ? 'target="_blank" rel="noopener noreferrer"' : ''; ?>
														>
															<i class="<?php echo esc_attr( $lnk['icon'] ?: 'ri-arrow-right-s-line' ); ?>" aria-hidden="true"></i>
															<span><?php echo esc_html( $lnk['label'] ); ?></span>
														</a>
													</li>
												<?php endforeach; ?>
											</ul>
										<?php endif; ?>
									</div>
								<?php endforeach; ?>
							</div>
						<?php endif; ?>
					</div>
				<?php endforeach; ?>
			</div>
			<?php endif; ?>

		</div>
		<?php
		return (string) ob_get_clean();
	}
}
