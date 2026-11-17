/**
 * Section C — Add from WordPress & WooCommerce (ContentPicker, ContentSearch, ContentResultItem)
 *
 * @package starter-theme
 */

import { useState, useMemo } from '@wordpress/element';
import {
	MOCK_WP_PAGES,
	MOCK_PRODUCT_CATEGORIES,
	MOCK_PRODUCTS,
} from './types';
import type { MenuLinkItem, ProductCategory, Product, WordPressPage } from './types';
import { CleanToggle } from './MenuItemSettings';

interface ContentSearchProps {
	value: string;
	onChange: (val: string) => void;
	placeholder?: string;
}

export function ContentSearch({ value, onChange, placeholder }: ContentSearchProps) {
	return (
		<div id="mm-picker-search-wrap" className="mm-picker-search-wrap" style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
			<i
				className="ri-search-line"
				style={{
					position: 'absolute',
					left: '11px',
					top: '50%',
					transform: 'translateY(-50%)',
					color: '#64748B',
					fontSize: '14px',
					pointerEvents: 'none',
				}}
			/>
			<input
				id="mm-picker-search-input"
				className="mm-picker-search-input"
				type="search"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder || 'Search pages, categories or products...'}
				style={{
					width: '100%',
					padding: '8px 12px 8px 34px',
					fontSize: '13px',
					color: '#0F172A',
					backgroundColor: '#F8FAFC',
					border: '1px solid #E2E8F0',
					borderRadius: '8px',
					outline: 'none',
					boxSizing: 'border-box',
				}}
			/>
		</div>
	);
}

interface ContentResultItemProps {
	id: string;
	checked: boolean;
	onToggle: () => void;
	icon: string;
	thumbColor?: string;
	title: string;
	subtitle?: string;
	badge?: string | number;
}

export function ContentResultItem({
	id,
	checked,
	onToggle,
	icon,
	thumbColor,
	title,
	subtitle,
	badge,
}: ContentResultItemProps) {
	return (
		<label
			id={`mm-result-row-${id}`}
			className="mm-result-row"
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				gap: '10px',
				padding: '8px 10px',
				borderRadius: '8px',
				border: checked ? '1px solid #C7D7FE' : '1px solid transparent',
				backgroundColor: checked ? '#EEF4FF' : '#FFFFFF',
				cursor: 'pointer',
				transition: 'background-color 150ms ease, border-color 150ms ease',
			}}
		>
			<div id={`mm-result-left-${id}`} className="mm-result-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
				<input
					id={`mm-result-check-${id}`}
					className="mm-result-checkbox"
					type="checkbox"
					checked={checked}
					onChange={onToggle}
					style={{ width: '15px', height: '15px', accentColor: '#4169F7', cursor: 'pointer', margin: 0 }}
				/>

				<span
					id={`mm-result-icon-${id}`}
					className="mm-result-icon"
					style={{
						width: '28px',
						height: '28px',
						borderRadius: '7px',
						backgroundColor: thumbColor || (checked ? '#DBEAFE' : '#F1F5F9'),
						color: checked ? '#4169F7' : '#475569',
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: '14px',
						flexShrink: 0,
					}}
				>
					<i className={icon}></i>
				</span>

				<div id={`mm-result-meta-${id}`} className="mm-result-meta" style={{ minWidth: 0, flex: 1 }}>
					<div style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
						{title}
					</div>
					{subtitle && (
						<div style={{ fontSize: '11px', color: '#64748B' }}>
							{subtitle}
						</div>
					)}
				</div>
			</div>

			{badge !== undefined && (
				<span
					id={`mm-result-badge-${id}`}
					className="mm-result-badge"
					style={{
						fontSize: '11px',
						fontWeight: 600,
						color: '#475569',
						backgroundColor: '#F1F5F9',
						padding: '2px 8px',
						borderRadius: '999px',
						flexShrink: 0,
					}}
				>
					{badge}
				</span>
			)}
		</label>
	);
}

interface ContentPickerProps {
	pages?: WordPressPage[];
	categories?: ProductCategory[];
	products?: Product[];
	targetColumnHeading?: string;
	onAddItems: (links: MenuLinkItem[]) => void;
}

export function ContentPicker({
	pages = MOCK_WP_PAGES,
	categories = MOCK_PRODUCT_CATEGORIES,
	products = MOCK_PRODUCTS,
	targetColumnHeading = 'First Column',
	onAddItems,
}: ContentPickerProps) {
	const [activeTab, setActiveTab] = useState<'pages' | 'categories' | 'products' | 'custom'>('categories');
	const [search, setSearch] = useState('');
	const [catGroupFilter, setCatGroupFilter] = useState('all');
	const [selectedKeys, setSelectedKeys] = useState<Record<string, boolean>>({});

	// Custom Link state
	const [customText, setCustomText] = useState('');
	const [customUrl, setCustomUrl] = useState('https://');
	const [customNewTab, setCustomNewTab] = useState(false);

	const q = search.trim().toLowerCase();

	const categoryGroups = useMemo(() => {
		const groups = new Set<string>();
		categories.forEach((c) => groups.add(c.group));
		return ['all', ...Array.from(groups)];
	}, [categories]);

	const visiblePages = useMemo(() => {
		return pages.filter((p) => !q || p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
	}, [pages, q]);

	const visibleCategories = useMemo(() => {
		return categories.filter((c) => {
			if (catGroupFilter !== 'all' && c.group !== catGroupFilter) return false;
			if (!q) return true;
			return c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
		});
	}, [categories, catGroupFilter, q]);

	const visibleProducts = useMemo(() => {
		return products.filter((p) => {
			if (!q) return true;
			return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
		});
	}, [products, q]);

	const toggleKey = (key: string) => {
		setSelectedKeys((prev) => {
			const next = { ...prev };
			if (next[key]) {
				delete next[key];
			} else {
				next[key] = true;
			}
			return next;
		});
	};

	const currentVisibleKeys = useMemo(() => {
		if (activeTab === 'pages') return visiblePages.map((p) => `page:${p.id}`);
		if (activeTab === 'categories') return visibleCategories.map((c) => `cat:${c.id}`);
		if (activeTab === 'products') return visibleProducts.map((p) => `prod:${p.id}`);
		return [];
	}, [activeTab, visiblePages, visibleCategories, visibleProducts]);

	const allVisibleSelected = currentVisibleKeys.length > 0 && currentVisibleKeys.every((k) => !!selectedKeys[k]);

	const handleSelectAllVisible = () => {
		if (allVisibleSelected) {
			setSelectedKeys((prev) => {
				const next = { ...prev };
				currentVisibleKeys.forEach((k) => delete next[k]);
				return next;
			});
		} else {
			setSelectedKeys((prev) => {
				const next = { ...prev };
				currentVisibleKeys.forEach((k) => {
					next[k] = true;
				});
				return next;
			});
		}
	};

	const selectedCount = Object.keys(selectedKeys).length;

	const handleAddSelected = () => {
		const toAdd: MenuLinkItem[] = [];
		const now = Date.now();

		Object.keys(selectedKeys).forEach((key, idx) => {
			const [type, rawId] = key.split(':');
			if (type === 'page') {
				const found = pages.find((p) => String(p.id) === rawId);
				if (found) {
					toAdd.push({
						id: `added-page-${now}-${idx}`,
						label: found.title,
						url: found.url,
						icon: found.icon,
					});
				}
			} else if (type === 'cat') {
				const found = categories.find((c) => String(c.id) === rawId);
				if (found) {
					toAdd.push({
						id: `added-cat-${now}-${idx}`,
					termId: found.term_id || Number(found.id),
						label: found.name,
						url: found.url,
						icon: found.icon,
					thumbUrl: found.thumb_url,
					});
				}
			} else if (type === 'prod') {
				const found = products.find((p) => String(p.id) === rawId);
				if (found) {
					toAdd.push({
						id: `added-prod-${now}-${idx}`,
						label: found.name,
						url: found.url,
						icon: found.icon,
					});
				}
			}
		});

		if (toAdd.length > 0) {
			onAddItems(toAdd);
			setSelectedKeys({});
		}
	};

	const handleAddCustomLink = (e: any) => {
		e.preventDefault();
		if (!customText.trim()) return;
		onAddItems([
			{
				id: `custom-${Date.now()}`,
				label: customText.trim(),
				url: customUrl.trim() || '#',
				icon: 'ri-external-link-line',
				openInNewTab: customNewTab,
			},
		]);
		setCustomText('');
		setCustomUrl('https://');
		setCustomNewTab(false);
	};

	const tabs: Array<{ id: 'pages' | 'categories' | 'products' | 'custom'; label: string }> = [
		{ id: 'pages', label: 'Pages' },
		{ id: 'categories', label: 'Product Categories' },
		{ id: 'products', label: 'Products' },
		{ id: 'custom', label: 'Custom Link' },
	];

	return (
		<section
			id="mm-section-content-picker"
			className="mm-card"
			style={{
				backgroundColor: '#FFFFFF',
				border: '1px solid #E2E8F0',
				borderRadius: '12px',
				padding: '20px',
				marginTop: '16px',
				boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
			}}
		>
			<div id="mm-picker-header" className="mm-picker-header" style={{ marginBottom: '14px' }}>
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
					<h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>
						Add from WordPress & WooCommerce
					</h2>
					<span
						id="mm-picker-target-badge"
						className="mm-picker-target-badge"
						style={{
							fontSize: '11px',
							fontWeight: 500,
							color: '#475569',
							backgroundColor: '#F1F5F9',
							padding: '3px 8px',
							borderRadius: '6px',
						}}
					>
						Target: <strong style={{ color: '#4169F7' }}>{targetColumnHeading}</strong>
					</span>
				</div>
				<p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
					Select pages, product categories, products, or add a custom link to your mega menu.
				</p>
			</div>

			{ /* Tabs */}
			<div
				id="mm-picker-tabs"
				className="mm-picker-tabs"
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(4, 1fr)',
					gap: '4px',
					padding: '4px',
					backgroundColor: '#F1F5F9',
					borderRadius: '9px',
					marginBottom: '12px',
				}}
			>
				{tabs.map((tab) => {
					const isActive = activeTab === tab.id;
					return (
						<button
							id={`mm-picker-tab-${tab.id}`}
							className="mm-picker-tab-btn"
							key={tab.id}
							type="button"
							onClick={() => setActiveTab(tab.id)}
							style={{
								padding: '7px 6px',
								fontSize: '11.5px',
								fontWeight: isActive ? 600 : 500,
								color: isActive ? '#0F172A' : '#64748B',
								backgroundColor: isActive ? '#FFFFFF' : 'transparent',
								border: 'none',
								borderRadius: '6px',
								boxShadow: isActive ? '0 1px 2px rgba(15, 23, 42, 0.06)' : 'none',
								cursor: 'pointer',
								transition: 'all 150ms ease',
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
							}}
						>
							{tab.label}
						</button>
					);
				})}
			</div>

			{activeTab !== 'custom' ? (
				<div id="mm-picker-list-mode" className="mm-picker-list-mode">
					{ /* Search + Category Filter Row */}
					<div id="mm-picker-subtoolbar" className="mm-picker-subtoolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px', alignItems: 'stretch' }}>
						<ContentSearch value={search} onChange={setSearch} />

						{activeTab === 'categories' && (
							<select
								id="mm-picker-cat-filter"
								className="mm-picker-cat-filter"
								value={catGroupFilter}
								onChange={(e) => setCatGroupFilter(e.target.value)}
								style={{
									padding: '7px 10px',
									fontSize: '12px',
									color: '#334155',
									backgroundColor: '#F8FAFC',
									border: '1px solid #E2E8F0',
									borderRadius: '8px',
									cursor: 'pointer',
									flex: '1 1 180px',
									minWidth: 0,
									boxSizing: 'border-box',
								}}
							>
								{categoryGroups.map((g) => (
									<option key={g} value={g}>
										{g === 'all' ? 'All Groups' : g}
									</option>
								))}
							</select>
						)}
					</div>

					{ /* Select All Bar */}
					<div
						id="mm-picker-selectall-bar"
						className="mm-picker-selectall-bar"
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							padding: '4px 6px 8px 6px',
							fontSize: '11.5px',
							color: '#64748B',
						}}
					>
						<span>Showing {currentVisibleKeys.length} items</span>
						{currentVisibleKeys.length > 0 && (
							<button
								id="mm-picker-selectall-btn"
								className="mm-picker-selectall-btn"
								type="button"
								onClick={handleSelectAllVisible}
								style={{
									border: 'none',
									background: 'transparent',
									color: '#4169F7',
									fontSize: '11.5px',
									fontWeight: 600,
									cursor: 'pointer',
									padding: 0,
								}}
							>
								{allVisibleSelected ? 'Deselect visible' : 'Select all visible'}
							</button>
						)}
					</div>

					{ /* Scrollable Results Box */}
					<div
						id="mm-picker-results"
						className="mm-picker-results"
						style={{
							maxHeight: '220px',
							overflowY: 'auto',
							border: '1px solid #E2E8F0',
							borderRadius: '10px',
							padding: '6px',
							display: 'flex',
							flexDirection: 'column',
							gap: '2px',
							backgroundColor: '#FFFFFF',
						}}
					>
						{activeTab === 'pages' && (
							visiblePages.length === 0 ? (
								<div style={emptyBoxStyle}>No matching pages found.</div>
							) : (
								visiblePages.map((p) => (
									<ContentResultItem
										key={p.id}
										id={p.id}
										checked={!!selectedKeys[`page:${p.id}`]}
										onToggle={() => toggleKey(`page:${p.id}`)}
										icon={p.icon}
										title={p.title}
										subtitle={p.url}
									/>
								))
							)
						)}

						{activeTab === 'categories' && (
							visibleCategories.length === 0 ? (
								<div style={emptyBoxStyle}>No matching product categories found.</div>
							) : (
								visibleCategories.map((c) => (
									<ContentResultItem
										key={c.id}
										id={c.id}
										checked={!!selectedKeys[`cat:${c.id}`]}
										onToggle={() => toggleKey(`cat:${c.id}`)}
										icon={c.icon}
										title={c.name}
										subtitle={c.group}
										badge={`${c.count}`}
									/>
								))
							)
						)}

						{activeTab === 'products' && (
							visibleProducts.length === 0 ? (
								<div style={emptyBoxStyle}>No matching products found.</div>
							) : (
								visibleProducts.map((p) => (
									<ContentResultItem
										key={p.id}
										id={p.id}
										checked={!!selectedKeys[`prod:${p.id}`]}
										onToggle={() => toggleKey(`prod:${p.id}`)}
										icon={p.icon}
										thumbColor={p.thumbColor}
										title={p.name}
										subtitle={`SKU: ${p.sku}`}
										badge={p.price}
									/>
								))
							)
						)}
					</div>

					{ /* Footer Action Bar */}
					<div
						id="mm-picker-footer"
						className="mm-picker-footer"
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							marginTop: '12px',
						}}
					>
						<button
							id="mm-picker-clear-btn"
							className="mm-picker-clear-btn"
							type="button"
							disabled={selectedCount === 0}
							onClick={() => setSelectedKeys({})}
							style={{
								border: 'none',
								background: 'transparent',
								color: selectedCount > 0 ? '#64748B' : '#CBD5E1',
								fontSize: '12px',
								cursor: selectedCount > 0 ? 'pointer' : 'not-allowed',
								padding: '4px 0',
							}}
						>
							Clear selection
						</button>

						<button
							id="mm-picker-add-selected-btn"
							className="mm-btn-primary"
							type="button"
							disabled={selectedCount === 0}
							onClick={handleAddSelected}
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: '6px',
								padding: '8px 14px',
								borderRadius: '8px',
								border: 'none',
								backgroundColor: selectedCount > 0 ? '#4169F7' : '#CBD5E1',
								color: '#FFFFFF',
								fontSize: '12.5px',
								fontWeight: 600,
								cursor: selectedCount > 0 ? 'pointer' : 'not-allowed',
								transition: 'background-color 150ms ease',
							}}
						>
							<i className="ri-add-line" style={{ fontSize: '15px' }}></i>
							<span>Add selected ({selectedCount})</span>
						</button>
					</div>
				</div>
			) : (
				<form
					id="mm-custom-link-form"
					className="mm-custom-link-form"
					onSubmit={handleAddCustomLink}
					style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '4px' }}
				>
					<div id="mm-custom-field-text" className="mm-field">
						<label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
							Link Text
						</label>
						<input
							id="mm-custom-input-text"
							className="mm-input"
							type="text"
							value={customText}
							onChange={(e) => setCustomText(e.target.value)}
							placeholder="e.g. Flash Sale"
							style={{
								width: '100%',
								padding: '8px 11px',
								fontSize: '13px',
								border: '1px solid #E2E8F0',
								borderRadius: '8px',
								boxSizing: 'border-box',
							}}
						/>
					</div>

					<div id="mm-custom-field-url" className="mm-field">
						<label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
							URL
						</label>
						<input
							id="mm-custom-input-url"
							className="mm-input"
							type="text"
							value={customUrl}
							onChange={(e) => setCustomUrl(e.target.value)}
							placeholder="https://example.com"
							style={{
								width: '100%',
								padding: '8px 11px',
								fontSize: '13px',
								border: '1px solid #E2E8F0',
								borderRadius: '8px',
								boxSizing: 'border-box',
							}}
						/>
					</div>

					<CleanToggle
						id="custom-link-newtab"
						label="Open in New Tab"
						checked={customNewTab}
						onChange={setCustomNewTab}
					/>

					<div id="mm-custom-submit-wrap" className="mm-custom-submit-wrap" style={{ display: 'flex', justifyContent: 'flex-end' }}>
						<button
							id="mm-custom-add-btn"
							className="mm-btn-primary"
							type="submit"
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: '6px',
								padding: '8px 16px',
								borderRadius: '8px',
								border: 'none',
								backgroundColor: '#4169F7',
								color: '#FFFFFF',
								fontSize: '12.5px',
								fontWeight: 600,
								cursor: 'pointer',
							}}
						>
							<i className="ri-add-line"></i>
							<span>Add Custom Link</span>
						</button>
					</div>
				</form>
			)}
		</section>
	);
}

const emptyBoxStyle: Record<string, any> = {
	padding: '24px 12px',
	textAlign: 'center',
	color: '#64748B',
	fontSize: '12.5px',
};

