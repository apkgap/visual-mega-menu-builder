/**
 * Section B — Edit Menu Item & Section F — Visibility & Behavior
 *
 * @package starter-theme
 */

import type { MenuItem, MegaMenuSettingsState } from './types';

interface SwitchProps {
	id: string;
	checked: boolean;
	onChange: ( next: boolean ) => void;
	label: string;
	description?: string;
}

export function CleanToggle( { id, checked, onChange, label, description }: SwitchProps ) {
	return (
		<div
			id={ `mm-toggle-wrap-${ id }` }
			className="mm-toggle-wrap"
			style={ {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				gap: '12px',
				padding: '8px 0',
			} }
		>
			<div id={ `mm-toggle-text-${ id }` } className="mm-toggle-text">
				<div style={ { fontSize: '13px', fontWeight: 500, color: '#0F172A' } }>{ label }</div>
				{ description && (
					<div style={ { fontSize: '11.5px', color: '#64748B', marginTop: '2px' } }>{ description }</div>
				) }
			</div>

			<button
				id={ `mm-toggle-btn-${ id }` }
				className="mm-toggle-btn"
				type="button"
				role="switch"
				aria-checked={ checked }
				onClick={ () => onChange( ! checked ) }
				style={ {
					position: 'relative',
					width: '38px',
					height: '22px',
					borderRadius: '999px',
					border: 'none',
					backgroundColor: checked ? '#4169F7' : '#CBD5E1',
					cursor: 'pointer',
					transition: 'background-color 160ms ease',
					padding: 0,
					flexShrink: 0,
				} }
			>
				<span
					id={ `mm-toggle-knob-${ id }` }
					className="mm-toggle-knob"
					style={ {
						position: 'absolute',
						top: '3px',
						left: checked ? '19px' : '3px',
						width: '16px',
						height: '16px',
						borderRadius: '999px',
						backgroundColor: '#FFFFFF',
						boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
						transition: 'left 160ms ease',
					} }
				/>
			</button>
		</div>
	);
}

interface MenuItemSettingsProps {
	item: MenuItem | null;
	onUpdate: ( patch: Partial<MenuItem> ) => void;
}

export function MenuItemSettings( { item, onUpdate }: MenuItemSettingsProps ) {
	if ( ! item ) {
		return (
			<section
				id="mm-section-item-settings-empty"
				className="mm-card"
				style={ {
					backgroundColor: '#FFFFFF',
					border: '1px solid #E2E8F0',
					borderRadius: '12px',
					padding: '24px',
					textAlign: 'center',
					color: '#64748B',
					fontSize: '13px',
				} }
			>
				Select a menu item on the left to configure its settings.
			</section>
		);
	}

	return (
		<section
			id="mm-section-item-settings"
			className="mm-card"
			style={ {
				backgroundColor: '#FFFFFF',
				border: '1px solid #E2E8F0',
				borderRadius: '12px',
				padding: '20px',
				boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
			} }
		>
			<div id="mm-item-settings-header" className="mm-item-settings-header" style={ { marginBottom: '16px' } }>
				<div style={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }>
					<h2 style={ { margin: 0, fontSize: '15px', fontWeight: 600, color: '#0F172A' } }>
						Edit Menu Item
					</h2>
					<span
						id="mm-editing-pill"
						className="mm-editing-pill"
						style={ {
							fontSize: '11px',
							fontWeight: 600,
							color: '#4169F7',
							backgroundColor: '#EEF4FF',
							padding: '3px 8px',
							borderRadius: '999px',
						} }
					>
						Editing: { item.label }
					</span>
				</div>
			</div>

			<div id="mm-item-basic-grid" className="mm-item-basic-grid" style={ { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' } }>
				<div id="mm-field-label" className="mm-field">
					<label
						htmlFor="mm-input-label"
						style={ { display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' } }
					>
						Menu Label
					</label>
					<input
						id="mm-input-label"
						className="mm-text-input"
						type="text"
						value={ item.label }
						onChange={ ( e ) => onUpdate( { label: e.target.value } ) }
						placeholder="Products"
						style={ inputStyle }
					/>
				</div>

				<div id="mm-field-url" className="mm-field">
					<label
						htmlFor="mm-input-url"
						style={ { display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' } }
					>
						Navigation URL
					</label>
					<input
						id="mm-input-url"
						className="mm-text-input"
						type="text"
						value={ item.url }
						onChange={ ( e ) => onUpdate( { url: e.target.value } ) }
						placeholder="/products"
						style={ inputStyle }
					/>
				</div>
			</div>

			<div
				id="mm-enable-mega-box"
				className="mm-enable-mega-box"
				style={ {
					padding: '10px 14px',
					borderRadius: '10px',
					backgroundColor: item.enableMegaMenu ? '#F5F8FF' : '#F8FAFC',
					border: item.enableMegaMenu ? '1px solid #C7D7FE' : '1px solid #E2E8F0',
					marginBottom: item.enableMegaMenu ? '16px' : '8px',
				} }
			>
				<CleanToggle
					id="enable-mega-menu"
					label="Enable Mega Menu"
					description="Display a multi-column rich dropdown under this navigation item."
					checked={ item.enableMegaMenu }
					onChange={ ( val ) => onUpdate( { enableMegaMenu: val } ) }
				/>
			</div>

			{ item.enableMegaMenu && (
				<div id="mm-mega-options" className="mm-mega-options" style={ { borderTop: '1px solid #F1F5F9', paddingTop: '14px' } }>
					{ /* Dropdown Width */ }
					<div id="mm-width-group" className="mm-width-group" style={ { marginBottom: '14px' } }>
						<span style={ { display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '8px' } }>
							Dropdown Width
						</span>
						<div id="mm-width-radios" className="mm-width-radios" style={ { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' } }>
							<label
								id="mm-radio-full"
								className="mm-radio-card"
								style={ {
									display: 'flex',
									alignItems: 'flex-start',
									gap: '8px',
									padding: '10px 12px',
									borderRadius: '9px',
									border: item.dropdownWidth === 'full' ? '1.5px solid #4169F7' : '1px solid #E2E8F0',
									backgroundColor: item.dropdownWidth === 'full' ? '#EEF4FF' : '#FFFFFF',
									cursor: 'pointer',
								} }
							>
								<input
									type="radio"
									name="mm-dropdown-width"
									checked={ item.dropdownWidth === 'full' }
									onChange={ () => onUpdate( { dropdownWidth: 'full' } ) }
									style={ { marginTop: '3px', accentColor: '#4169F7' } }
								/>
								<div>
									<div style={ { fontSize: '12.5px', fontWeight: 600, color: '#0F172A' } }>Full Width</div>
									<div style={ { fontSize: '11px', color: '#64748B', lineHeight: 1.35 } }>Span the entire available screen width.</div>
								</div>
							</label>

							<label
								id="mm-radio-container"
								className="mm-radio-card"
								style={ {
									display: 'flex',
									alignItems: 'flex-start',
									gap: '8px',
									padding: '10px 12px',
									borderRadius: '9px',
									border: item.dropdownWidth === 'container' ? '1.5px solid #4169F7' : '1px solid #E2E8F0',
									backgroundColor: item.dropdownWidth === 'container' ? '#EEF4FF' : '#FFFFFF',
									cursor: 'pointer',
								} }
							>
								<input
									type="radio"
									name="mm-dropdown-width"
									checked={ item.dropdownWidth === 'container' }
									onChange={ () => onUpdate( { dropdownWidth: 'container' } ) }
									style={ { marginTop: '3px', accentColor: '#4169F7' } }
								/>
								<div>
									<div style={ { fontSize: '12.5px', fontWeight: 600, color: '#0F172A' } }>Container</div>
									<div style={ { fontSize: '11px', color: '#64748B', lineHeight: 1.35 } }>Align with the website content container.</div>
								</div>
							</label>
						</div>
					</div>

					{ /* Columns Select */ }
					<div id="mm-columns-group" className="mm-columns-group" style={ { marginBottom: '14px' } }>
						<label
							htmlFor="mm-select-columns"
							style={ { display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' } }
						>
							Columns
						</label>
						<select
							id="mm-select-columns"
							className="mm-select"
							value={ item.columnsCount }
							onChange={ ( e ) => onUpdate( { columnsCount: Number( e.target.value ) as 2 | 3 | 4 | 5 | 6 } ) }
							style={ Object.assign( {}, inputStyle, { cursor: 'pointer' } ) }
						>
							<option value={ 2 }>2 Columns</option>
							<option value={ 3 }>3 Columns</option>
							<option value={ 4 }>4 Columns</option>
							<option value={ 5 }>5 Columns</option>
							<option value={ 6 }>6 Columns</option>
						</select>
					</div>

					{ /* Additional Settings */ }
					<div
						id="mm-additional-toggles"
						className="mm-additional-toggles"
						style={ {
							borderTop: '1px solid #F1F5F9',
							paddingTop: '8px',
							display: 'grid',
							gridTemplateColumns: '1fr 1fr',
							gap: '0 16px',
						} }
					>
						<CleanToggle
							id="item-show-icons"
							label="Show menu icons"
							checked={ item.showMenuIcons }
							onChange={ ( val ) => onUpdate( { showMenuIcons: val } ) }
						/>
						<CleanToggle
							id="item-new-tab"
							label="Open links in new tab"
							checked={ item.openInNewTab }
							onChange={ ( val ) => onUpdate( { openInNewTab: val } ) }
						/>
						<CleanToggle
							id="item-hover-dropdown"
							label="Enable hover dropdown"
							checked={ item.enableHoverDropdown }
							onChange={ ( val ) => onUpdate( { enableHoverDropdown: val } ) }
						/>
						<CleanToggle
							id="item-mobile-accordion"
							label="Enable mobile accordion"
							checked={ item.enableMobileAccordion }
							onChange={ ( val ) => onUpdate( { enableMobileAccordion: val } ) }
						/>
					</div>
				</div>
			) }
		</section>
	);
}

interface VisibilitySettingsProps {
	settings: MegaMenuSettingsState;
	onChange: ( patch: Partial<MegaMenuSettingsState> ) => void;
}

export function VisibilitySettings( { settings, onChange }: VisibilitySettingsProps ) {
	return (
		<section
			id="mm-section-visibility"
			className="mm-card"
			style={ {
				backgroundColor: '#FFFFFF',
				border: '1px solid #E2E8F0',
				borderRadius: '12px',
				padding: '18px 24px',
				marginTop: '20px',
				boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
			} }
		>
			<div id="mm-vis-header" className="mm-vis-header" style={ { marginBottom: '12px' } }>
				<h3 style={ { margin: 0, fontSize: '14px', fontWeight: 600, color: '#0F172A' } }>
					Visibility & Behavior
				</h3>
				<p style={ { margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' } }>
					Global navigation behavior across desktop and mobile viewports.
				</p>
			</div>

			<div
				id="mm-vis-grid"
				className="mm-vis-grid"
				style={ {
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
					gap: '16px',
				} }
			>
				<div
					id="mm-vis-card-hover"
					className="mm-vis-card"
					style={ {
						padding: '10px 14px',
						borderRadius: '10px',
						border: '1px solid #E2E8F0',
						backgroundColor: '#F8FAFC',
					} }
				>
					<CleanToggle
						id="global-hover-open"
						label="Hover to open"
						description="Open mega menu automatically on mouse hover."
						checked={ settings.hoverToOpen }
						onChange={ ( val ) => onChange( { hoverToOpen: val } ) }
					/>
				</div>

				<div
					id="mm-vis-card-icons"
					className="mm-vis-card"
					style={ {
						padding: '10px 14px',
						borderRadius: '10px',
						border: '1px solid #E2E8F0',
						backgroundColor: '#F8FAFC',
					} }
				>
					<CleanToggle
						id="global-show-icons"
						label="Show icons"
						description="Display outline icons next to navigation links."
						checked={ settings.showIcons }
						onChange={ ( val ) => onChange( { showIcons: val } ) }
					/>
				</div>

				<div
					id="mm-vis-card-accordion"
					className="mm-vis-card"
					style={ {
						padding: '10px 14px',
						borderRadius: '10px',
						border: '1px solid #E2E8F0',
						backgroundColor: '#F8FAFC',
					} }
				>
					<CleanToggle
						id="global-mobile-accordion"
						label="Mobile accordion"
						description="Collapse nested categories into expandable accordions on mobile."
						checked={ settings.mobileAccordion }
						onChange={ ( val ) => onChange( { mobileAccordion: val } ) }
					/>
				</div>
			</div>
		</section>
	);
}

const inputStyle: Record<string, any> = {
	width: '100%',
	padding: '8px 11px',
	fontSize: '13px',
	color: '#0F172A',
	backgroundColor: '#FFFFFF',
	border: '1px solid #E2E8F0',
	borderRadius: '8px',
	outline: 'none',
	boxSizing: 'border-box',
};

