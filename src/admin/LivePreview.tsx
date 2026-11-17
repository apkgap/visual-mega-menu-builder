/**
 * Section E — Live Preview
 * Realistic website navigation preview inside a browser-style container
 * Includes LivePreview and MobileMenuPreview
 *
 * @package starter-theme
 */

import { useState } from '@wordpress/element';
import { MenuItem, MegaMenuSettingsState } from './types';

interface MobileMenuPreviewProps {
	items: MenuItem[];
	selectedMenuId: string;
	onSelectMenu: ( id: string ) => void;
	visibilitySettings: MegaMenuSettingsState;
}

export const MobileMenuPreview = ( {
	items,
	selectedMenuId,
	onSelectMenu,
	visibilitySettings,
}: MobileMenuPreviewProps ) => {
	const [ expandedMobileIds, setExpandedMobileIds ] = useState<Record<string, boolean>>( {} );

	const toggleMobileAccordion = ( id: string ) => {
		setExpandedMobileIds( ( prev ) => ( {
			...prev,
			[ id ]: ! prev[ id ],
		} ) );
	};

	return (
		<div
			id="mm-mobile-preview-frame"
			className="mm-mobile-preview"
			style={ {
				maxWidth: '360px',
				margin: '0 auto',
				background: '#FFFFFF',
				border: '1px solid #E2E8F0',
				borderRadius: '16px',
				overflow: 'hidden',
				boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
			} }
		>
			{ /* Mobile Top Bar */ }
			<div
				id="mm-mobile-preview-topbar"
				className="mm-mobile-preview__topbar"
				style={ {
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '12px 16px',
					borderBottom: '1px solid #F1F5F9',
					background: '#FFFFFF',
				} }
			>
				<div
					id="mm-mobile-preview-brand"
					className="mm-mobile-preview__brand"
					style={ { display: 'flex', alignItems: 'center', gap: '8px' } }
				>
					<span
						id="mm-mobile-preview-logo-badge"
						className="mm-mobile-preview__logo-badge"
						style={ {
							width: '26px',
							height: '26px',
							borderRadius: '7px',
							background: '#4169F7',
							color: '#FFFFFF',
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: '14px',
						} }
					>
						<i id="mm-mobile-preview-logo-ico" className="ri-box-3-line"></i>
					</span>
					<span
						id="mm-mobile-preview-logo-text"
						className="mm-mobile-preview__logo-text"
						style={ { fontSize: '13.5px', fontWeight: 700, color: '#0F172A' } }
					>
						StoreFront
					</span>
				</div>

				<div
					id="mm-mobile-preview-icons"
					className="mm-mobile-preview__icons"
					style={ { display: 'flex', alignItems: 'center', gap: '10px', color: '#475569' } }
				>
					<i id="mm-mobile-preview-search-ico" className="ri-search-line" style={ { fontSize: '16px' } }></i>
					<i id="mm-mobile-preview-cart-ico" className="ri-shopping-bag-3-line" style={ { fontSize: '16px' } }></i>
					<span
						id="mm-mobile-preview-menu-btn"
						className="mm-mobile-preview__menu-btn"
						style={ {
							width: '28px',
							height: '28px',
							borderRadius: '6px',
							background: '#F1F5F9',
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: '#0F172A',
						} }
					>
						<i id="mm-mobile-preview-close-ico" className="ri-menu-3-line"></i>
					</span>
				</div>
			</div>

			{ /* Mobile Accordion List */ }
			<div
				id="mm-mobile-preview-list"
				className="mm-mobile-preview__list"
				style={ { padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '4px' } }
			>
				{ items.map( ( item ) => {
					const isSelected = item.id === selectedMenuId;
					const hasAccordionContent =
						( item.enableMegaMenu && item.columns.length > 0 ) || item.children.length > 0;
					const canAccordion =
						visibilitySettings.mobileAccordion && item.enableMobileAccordion && hasAccordionContent;
					const isExpanded = expandedMobileIds[ item.id ] ?? isSelected;
					const showIcon = visibilitySettings.showIcons && item.showMenuIcons;

					return (
						<div
							key={ item.id }
							id={ `mm-mobile-item-${ item.id }` }
							className="mm-mobile-preview__item"
							style={ {
								border: isSelected ? '1px solid #C7D7FE' : '1px solid #F1F5F9',
								borderRadius: '8px',
								background: isSelected ? '#F8FAFF' : '#FFFFFF',
								overflow: 'hidden',
							} }
						>
							<div
								id={ `mm-mobile-item-row-${ item.id }` }
								className="mm-mobile-preview__item-row"
								onClick={ () => {
									onSelectMenu( item.id );
									if ( canAccordion ) {
										toggleMobileAccordion( item.id );
									}
								} }
								style={ {
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									padding: '10px 12px',
									cursor: 'pointer',
								} }
							>
								<div
									id={ `mm-mobile-item-left-${ item.id }` }
									className="mm-mobile-preview__item-left"
									style={ { display: 'flex', alignItems: 'center', gap: '8px' } }
								>
									{ showIcon && (
										<i
											id={ `mm-mobile-item-ico-${ item.id }` }
											className={ item.icon || 'ri-Menu-line'.toLowerCase() }
											style={ {
												fontSize: '15px',
												color: isSelected ? '#4169F7' : '#64748B',
											} }
										></i>
									) }
									<span
										id={ `mm-mobile-item-label-${ item.id }` }
										className="mm-mobile-preview__item-label"
										style={ {
											fontSize: '13px',
											fontWeight: isSelected ? 600 : 500,
											color: isSelected ? '#4169F7' : '#0F172A',
										} }
									>
										{ item.label }
									</span>
								</div>

								{ canAccordion && (
									<i
										id={ `mm-mobile-item-arrow-${ item.id }` }
										className={ isExpanded ? 'ri-subtract-line' : 'ri-add-line' }
										style={ { fontSize: '15px', color: '#64748B' } }
									></i>
								) }
							</div>

							{ /* Mobile Accordion Body */ }
							{ canAccordion && isExpanded && (
								<div
									id={ `mm-mobile-item-body-${ item.id }` }
									className="mm-mobile-preview__item-body"
									style={ {
										padding: '6px 12px 12px 12px',
										borderTop: '1px solid #F1F5F9',
										background: '#FFFFFF',
										display: 'flex',
										flexDirection: 'column',
										gap: '10px',
									} }
								>
									{ item.enableMegaMenu && item.columns.length > 0 ? (
										item.columns.slice( 0, item.columnsCount ).map( ( col ) => (
											<div
												key={ col.id }
												id={ `mm-mobile-col-${ col.id }` }
												className="mm-mobile-preview__col"
											>
												<div
													id={ `mm-mobile-col-title-${ col.id }` }
													className="mm-mobile-preview__col-title"
													style={ {
														fontSize: '11px',
														fontWeight: 700,
														color: '#64748B',
														textTransform: 'uppercase',
														letterSpacing: '0.04em',
														marginBottom: '4px',
													} }
												>
													{ col.heading }
												</div>
												<div
													id={ `mm-mobile-col-links-${ col.id }` }
													className="mm-mobile-preview__col-links"
													style={ {
														display: 'flex',
														flexDirection: 'column',
														gap: '4px',
														paddingLeft: '6px',
													} }
												>
													{ col.items.map( ( link ) => (
														<div
															key={ link.id }
															id={ `mm-mobile-link-${ link.id }` }
															className="mm-mobile-preview__link"
															style={ {
																display: 'flex',
																alignItems: 'center',
																gap: '6px',
																fontSize: '12.5px',
																color: '#334155',
																padding: '3px 0',
															} }
														>
															{ showIcon && (
																<i
																	id={ `mm-mobile-link-ico-${ link.id }` }
																	className={ link.icon || 'ri-arrow-right-s-line' }
																	style={ { fontSize: '13px', color: '#94A3B8' } }
																></i>
															) }
															<span id={ `mm-mobile-link-txt-${ link.id }` } className="mm-mobile-preview__link-txt">
																{ link.label }
															</span>
														</div>
													) ) }
												</div>
											</div>
										) )
									) : (
										<div
											id={ `mm-mobile-subitems-${ item.id }` }
											className="mm-mobile-preview__subitems"
											style={ { display: 'flex', flexDirection: 'column', gap: '4px' } }
										>
											{ item.children.map( ( child ) => (
												<div
													key={ child.id }
													id={ `mm-mobile-sub-${ child.id }` }
													className="mm-mobile-preview__sub"
													style={ {
														fontSize: '12.5px',
														color: '#334155',
														padding: '4px 6px',
													} }
												>
													{ child.label }
												</div>
											) ) }
										</div>
									) }
								</div>
							) }
						</div>
					);
				} ) }
			</div>
		</div>
	);
};

interface LivePreviewProps {
	items: MenuItem[];
	selectedMenuId: string;
	onSelectMenu: ( id: string ) => void;
	visibilitySettings: MegaMenuSettingsState;
}

export const LivePreview = ( {
	items,
	selectedMenuId,
	onSelectMenu,
	visibilitySettings,
}: LivePreviewProps ) => {
	const [ previewMode, setPreviewMode ] = useState<'desktop' | 'mobile'>( 'desktop' );

	const activeMenu = items.find( ( m ) => m.id === selectedMenuId ) || items[ 0 ];
	const showIcons = visibilitySettings.showIcons && ( activeMenu?.showMenuIcons ?? true );
	const visibleColumns = activeMenu ? activeMenu.columns.slice( 0, activeMenu.columnsCount ) : [];

	return (
		<div
			id="mm-live-preview-card"
			className="mm-card"
			style={ {
				background: '#FFFFFF',
				border: '1px solid #E2E8F0',
				borderRadius: '12px',
				padding: '20px',
				boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
			} }
		>
			{ /* Card Header + Mode Switcher */ }
			<div
				id="mm-live-preview-header"
				className="mm-card__header"
				style={ {
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: '12px',
					marginBottom: '14px',
					flexWrap: 'wrap',
				} }
			>
				<div id="mm-live-preview-title-wrap" className="mm-card__title-wrap">
					<div
						id="mm-live-preview-title-row"
						className="mm-card__title-row"
						style={ { display: 'flex', alignItems: 'center', gap: '8px' } }
					>
						<h3
							id="mm-live-preview-title"
							className="mm-card__title"
							style={ { margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' } }
						>
							Live Preview
						</h3>
						<span
							id="mm-live-preview-status-dot"
							className="mm-live-preview__badge"
							style={ {
								display: 'inline-flex',
								alignItems: 'center',
								gap: '5px',
								fontSize: '11px',
								fontWeight: 600,
								padding: '2px 8px',
								borderRadius: '999px',
								background: '#ECFDF5',
								color: '#059669',
							} }
						>
							<span
								id="mm-live-preview-dot"
								className="mm-live-preview__dot"
								style={ {
									width: '6px',
									height: '6px',
									borderRadius: '50%',
									background: '#10B981',
								} }
							></span>
							Real-time
						</span>
					</div>
					<p
						id="mm-live-preview-subtitle"
						className="mm-card__subtitle"
						style={ { margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' } }
					>
						Interactive store navigation preview
					</p>
				</div>

				{ /* Desktop / Mobile Switcher */ }
				<div
					id="mm-live-preview-mode-switch"
					className="mm-live-preview__mode-switch"
					style={ {
						display: 'inline-flex',
						background: '#F1F5F9',
						padding: '3px',
						borderRadius: '8px',
						gap: '2px',
					} }
				>
					<button
						id="mm-preview-btn-desktop"
						className={ `mm-preview-mode-btn ${ previewMode === 'desktop' ? 'is-active' : '' }` }
						type="button"
						onClick={ () => setPreviewMode( 'desktop' ) }
						style={ {
							display: 'inline-flex',
							alignItems: 'center',
							gap: '5px',
							padding: '5px 10px',
							fontSize: '12px',
							fontWeight: 600,
							borderRadius: '6px',
							border: 'none',
							cursor: 'pointer',
							background: previewMode === 'desktop' ? '#FFFFFF' : 'transparent',
							color: previewMode === 'desktop' ? '#0F172A' : '#64748B',
							boxShadow:
								previewMode === 'desktop' ? '0 1px 2px rgba(15, 23, 42, 0.06)' : 'none',
							transition: 'all 150ms ease',
						} }
					>
						<i id="mm-preview-btn-desktop-ico" className="ri-computer-line"></i>
						<span>Desktop</span>
					</button>
					<button
						id="mm-preview-btn-mobile"
						className={ `mm-preview-mode-btn ${ previewMode === 'mobile' ? 'is-active' : '' }` }
						type="button"
						onClick={ () => setPreviewMode( 'mobile' ) }
						style={ {
							display: 'inline-flex',
							alignItems: 'center',
							gap: '5px',
							padding: '5px 10px',
							fontSize: '12px',
							fontWeight: 600,
							borderRadius: '6px',
							border: 'none',
							cursor: 'pointer',
							background: previewMode === 'mobile' ? '#FFFFFF' : 'transparent',
							color: previewMode === 'mobile' ? '#0F172A' : '#64748B',
							boxShadow:
								previewMode === 'mobile' ? '0 1px 2px rgba(15, 23, 42, 0.06)' : 'none',
							transition: 'all 150ms ease',
						} }
					>
						<i id="mm-preview-btn-mobile-ico" className="ri-smartphone-line"></i>
						<span>Mobile</span>
					</button>
				</div>
			</div>

			{ /* Browser Window Chrome */ }
			<div
				id="mm-browser-window"
				className="mm-browser-window"
				style={ {
					border: '1px solid #E2E8F0',
					borderRadius: '10px',
					background: '#F8FAFC',
					overflow: 'hidden',
				} }
			>
				{ /* Browser Top Bar */ }
				<div
					id="mm-browser-topbar"
					className="mm-browser-window__topbar"
					style={ {
						display: 'flex',
						alignItems: 'center',
						gap: '10px',
						padding: '8px 12px',
						background: '#F1F5F9',
						borderBottom: '1px solid #E2E8F0',
					} }
				>
					<div
						id="mm-browser-dots"
						className="mm-browser-window__dots"
						style={ { display: 'flex', gap: '5px' } }
					>
						<span
							id="mm-browser-dot-red"
							className="mm-browser-window__dot"
							style={ { width: '9px', height: '9px', borderRadius: '50%', background: '#FCA5A5' } }
						></span>
						<span
							id="mm-browser-dot-yellow"
							className="mm-browser-window__dot"
							style={ { width: '9px', height: '9px', borderRadius: '50%', background: '#FCD34D' } }
						></span>
						<span
							id="mm-browser-dot-green"
							className="mm-browser-window__dot"
							style={ { width: '9px', height: '9px', borderRadius: '50%', background: '#86EFAC' } }
						></span>
					</div>
					<div
						id="mm-browser-url-bar"
						className="mm-browser-window__url"
						style={ {
							flex: 1,
							background: '#FFFFFF',
							border: '1px solid #E2E8F0',
							borderRadius: '5px',
							padding: '3px 10px',
							fontSize: '11px',
							color: '#64748B',
							display: 'flex',
							alignItems: 'center',
							gap: '6px',
						} }
					>
						<i id="mm-browser-lock-ico" className="ri-lock-line" style={ { fontSize: '11px', color: '#10B981' } }></i>
						<span id="mm-browser-url-text" className="mm-browser-window__url-text">
							https://yourstore.com{ activeMenu?.url || '/products' }
						</span>
					</div>
					<span
						id="mm-browser-width-tag"
						className="mm-browser-window__width-tag"
						style={ {
							fontSize: '10.5px',
							fontWeight: 600,
							color: '#64748B',
							padding: '2px 6px',
							background: '#E2E8F0',
							borderRadius: '4px',
						} }
					>
						{ activeMenu?.dropdownWidth === 'full' ? 'Full Width' : 'Container' }
					</span>
				</div>

				{ /* Viewport Content */ }
				<div
					id="mm-browser-viewport"
					className="mm-browser-window__viewport"
					style={ { padding: previewMode === 'mobile' ? '16px 12px' : '0' } }
				>
					{ previewMode === 'mobile' ? (
						<MobileMenuPreview
							items={ items }
							selectedMenuId={ selectedMenuId }
							onSelectMenu={ onSelectMenu }
							visibilitySettings={ visibilitySettings }
						/>
					) : (
						<div id="mm-desktop-preview-wrap" className="mm-desktop-preview">
							{ /* Website Navigation Bar */ }
							<div
								id="mm-desktop-navbar"
								className="mm-desktop-preview__navbar"
								style={ {
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									padding: '12px 18px',
									background: '#FFFFFF',
									borderBottom: '1px solid #E2E8F0',
									gap: '12px',
								} }
							>
								{ /* Store Logo */ }
								<div
									id="mm-desktop-logo"
									className="mm-desktop-preview__logo"
									style={ {
										display: 'flex',
										alignItems: 'center',
										gap: '8px',
										flexShrink: 0,
									} }
								>
									<span
										id="mm-desktop-logo-mark"
										className="mm-desktop-preview__logo-mark"
										style={ {
											width: '28px',
											height: '28px',
											borderRadius: '7px',
											background: '#4169F7',
											color: '#FFFFFF',
											display: 'inline-flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontSize: '15px',
										} }
									>
										<i id="mm-desktop-logo-ico" className="ri-box-3-line"></i>
									</span>
									<span
										id="mm-desktop-logo-name"
										className="mm-desktop-preview__logo-name"
										style={ {
											fontSize: '13.5px',
											fontWeight: 700,
											color: '#0F172A',
											letterSpacing: '-0.01em',
										} }
									>
										StoreFront
									</span>
								</div>

								{ /* Navigation Links */ }
								<nav
									id="mm-desktop-nav-links"
									className="mm-desktop-preview__nav"
									style={ {
										display: 'flex',
										alignItems: 'center',
										gap: '4px',
										flexWrap: 'wrap',
									} }
								>
									{ items.map( ( navItem ) => {
										const isActive = navItem.id === selectedMenuId;
										return (
											<button
												key={ navItem.id }
												id={ `mm-desktop-nav-item-${ navItem.id }` }
												className={ `mm-desktop-preview__nav-btn ${ isActive ? 'is-active' : '' }` }
												type="button"
												onClick={ () => onSelectMenu( navItem.id ) }
												onMouseEnter={ () => {
													if ( visibilitySettings.hoverToOpen && navItem.enableHoverDropdown ) {
														onSelectMenu( navItem.id );
													}
												} }
												style={ {
													display: 'inline-flex',
													alignItems: 'center',
													gap: '4px',
													padding: '6px 10px',
													borderRadius: '6px',
													border: 'none',
													background: isActive ? '#EEF4FF' : 'transparent',
													color: isActive ? '#4169F7' : '#334155',
													fontSize: '12.5px',
													fontWeight: isActive ? 600 : 500,
													cursor: 'pointer',
													transition: 'all 150ms ease',
												} }
											>
												<span id={ `mm-desktop-nav-txt-${ navItem.id }` } className="mm-desktop-preview__nav-txt">
													{ navItem.label }
												</span>
												{ navItem.enableMegaMenu && (
													<i
														id={ `mm-desktop-nav-caret-${ navItem.id }` }
														className="ri-arrow-down-s-line"
														style={ { fontSize: '13px', opacity: 0.8 } }
													></i>
												) }
											</button>
										);
									} ) }
								</nav>

								{ /* Right Utility Icons */ }
								<div
									id="mm-desktop-utilities"
									className="mm-desktop-preview__utilities"
									style={ {
										display: 'flex',
										alignItems: 'center',
										gap: '10px',
										color: '#475569',
										flexShrink: 0,
									} }
								>
									<span
										id="mm-desktop-search-btn"
										className="mm-desktop-preview__util-icon"
										style={ {
											width: '28px',
											height: '28px',
											borderRadius: '6px',
											display: 'inline-flex',
											alignItems: 'center',
											justifyContent: 'center',
											background: '#F8FAFC',
											border: '1px solid #E2E8F0',
										} }
									>
										<i id="mm-desktop-search-ico" className="ri-search-line" style={ { fontSize: '14px' } }></i>
									</span>
									<span
										id="mm-desktop-cart-btn"
										className="mm-desktop-preview__util-icon"
										style={ {
											width: '28px',
											height: '28px',
											borderRadius: '6px',
											display: 'inline-flex',
											alignItems: 'center',
											justifyContent: 'center',
											background: '#F8FAFC',
											border: '1px solid #E2E8F0',
											position: 'relative',
										} }
									>
										<i id="mm-desktop-cart-ico" className="ri-shopping-bag-3-line" style={ { fontSize: '14px' } }></i>
									</span>
								</div>
							</div>

							{ /* Expanded Mega Menu Area */ }
							<div
								id="mm-desktop-stage"
								className="mm-desktop-preview__stage"
								style={ {
									padding: activeMenu?.dropdownWidth === 'full' ? '0' : '14px',
									background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
									minHeight: '250px',
								} }
							>
								{ activeMenu && activeMenu.enableMegaMenu ? (
									<div
										id="mm-desktop-dropdown-panel"
										className="mm-desktop-preview__dropdown"
										style={ {
											background: '#FFFFFF',
											border:
												activeMenu.dropdownWidth === 'full'
													? 'none'
													: '1px solid #E2E8F0',
											borderBottom: '1px solid #E2E8F0',
											borderRadius: activeMenu.dropdownWidth === 'full' ? '0' : '10px',
											padding: '18px',
											boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.06)',
										} }
									>
										<div
											id="mm-desktop-dropdown-grid"
											className="mm-desktop-preview__grid"
											style={ {
												display: 'grid',
												gridTemplateColumns: `repeat(${ Math.min(
													Math.max( visibleColumns.length, 1 ),
													activeMenu.columnsCount
												) }, minmax(0, 1fr))`,
												gap: '16px',
											} }
										>
											{ visibleColumns.map( ( col ) => (
												<div
													key={ col.id }
													id={ `mm-preview-col-${ col.id }` }
													className="mm-desktop-preview__col"
												>
													<div
														id={ `mm-preview-col-heading-${ col.id }` }
														className="mm-desktop-preview__col-heading"
														style={ {
															fontSize: '11.5px',
															fontWeight: 700,
															color: '#0F172A',
															textTransform: 'uppercase',
															letterSpacing: '0.04em',
															marginBottom: '10px',
															paddingBottom: '6px',
															borderBottom: '1px solid #F1F5F9',
														} }
													>
														{ col.heading }
													</div>
													<ul
														id={ `mm-preview-col-list-${ col.id }` }
														className="mm-desktop-preview__col-list"
														style={ {
															listStyle: 'none',
															margin: 0,
															padding: 0,
															display: 'flex',
															flexDirection: 'column',
															gap: '7px',
														} }
													>
														{ col.items.map( ( link ) => (
															<li
																key={ link.id }
																id={ `mm-preview-link-${ link.id }` }
																className="mm-desktop-preview__link-item"
																style={ {
																	display: 'flex',
																	alignItems: 'center',
																	gap: '7px',
																	fontSize: '12.5px',
																	color: '#475569',
																} }
															>
																{ showIcons && (
																	<i
																		id={ `mm-preview-link-ico-${ link.id }` }
																		className={ link.icon || 'ri-arrow-right-s-line' }
																		style={ {
																			fontSize: '13.5px',
																			color: '#4169F7',
																			flexShrink: 0,
																		} }
																	></i>
																) }
																<span
																	id={ `mm-preview-link-txt-${ link.id }` }
																	className="mm-desktop-preview__link-txt"
																	style={ {
																		whiteSpace: 'nowrap',
																		overflow: 'hidden',
																		textOverflow: 'ellipsis',
																	} }
																>
																	{ link.label }
																</span>
															</li>
														) ) }
													</ul>
												</div>
											) ) }
										</div>

										{ /* Promotional Featured Card Footer inside Mega Menu */ }
										{ activeMenu.promoCard?.enabled && (
											<div
												id="mm-preview-promo-banner"
												className="mm-desktop-preview__promo"
												style={ {
													marginTop: '16px',
													padding: '12px 14px',
													borderRadius: '8px',
													background: '#F8FAFF',
													border: '1px solid #DBEAFE',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'space-between',
													gap: '12px',
													flexWrap: 'wrap',
												} }
											>
												<div
													id="mm-preview-promo-info"
													className="mm-desktop-preview__promo-info"
													style={ { display: 'flex', alignItems: 'center', gap: '10px' } }
												>
													<span
														id="mm-preview-promo-badge"
														className="mm-desktop-preview__promo-badge"
														style={ {
															fontSize: '10px',
															fontWeight: 700,
															textTransform: 'uppercase',
															padding: '3px 7px',
															borderRadius: '4px',
															background: '#4169F7',
															color: '#FFFFFF',
														} }
													>
														{ activeMenu.promoCard.badge }
													</span>
													<div id="mm-preview-promo-text" className="mm-desktop-preview__promo-text">
														<div
															id="mm-preview-promo-title"
															className="mm-desktop-preview__promo-title"
															style={ { fontSize: '12.5px', fontWeight: 700, color: '#0F172A' } }
														>
															{ activeMenu.promoCard.title }
														</div>
														<div
															id="mm-preview-promo-sub"
															className="mm-desktop-preview__promo-sub"
															style={ { fontSize: '11.5px', color: '#64748B' } }
														>
															{ activeMenu.promoCard.subtitle }
														</div>
													</div>
												</div>

												<span
													id="mm-preview-promo-cta"
													className="mm-desktop-preview__promo-cta"
													style={ {
														fontSize: '12px',
														fontWeight: 600,
														color: '#4169F7',
														display: 'inline-flex',
														alignItems: 'center',
														gap: '4px',
													} }
												>
													<span>{ activeMenu.promoCard.ctaText }</span>
													<i id="mm-preview-promo-cta-ico" className="ri-arrow-right-line"></i>
												</span>
											</div>
										) }
									</div>
								) : (
									<div
										id="mm-desktop-standard-notice"
										className="mm-desktop-preview__standard-notice"
										style={ {
											background: '#FFFFFF',
											border: '1px solid #E2E8F0',
											borderRadius: '10px',
											padding: '28px 20px',
											textAlign: 'center',
										} }
									>
										<i
											id="mm-desktop-standard-ico"
											className="ri-navigation-line"
											style={ { fontSize: '22px', color: '#94A3B8', display: 'block', marginBottom: '6px' } }
										></i>
										<div
											id="mm-desktop-standard-title"
											className="mm-desktop-preview__standard-title"
											style={ { fontSize: '13.5px', fontWeight: 600, color: '#0F172A' } }
										>
											{ activeMenu?.label } — Standard Link ({ activeMenu?.url })
										</div>
										<p
											id="mm-desktop-standard-desc"
											className="mm-desktop-preview__standard-desc"
											style={ { margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' } }
										>
											Enable Mega Menu on this item or select <strong>Products</strong> to preview the multi-column dropdown.
										</p>
									</div>
								) }
							</div>
						</div>
					) }
				</div>
			</div>
		</div>
	);
};

