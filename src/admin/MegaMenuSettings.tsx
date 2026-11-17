/**
 * Main Mega Menu Builder Settings UI (Connected to WordPress & WooCommerce REST API)
 * Orchestrates Sections A, B, C, D, E, and F in a responsive SaaS dashboard layout
 *
 * @package starter-theme
 */

import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import {
	MenuItem,
	MenuColumn,
	MenuLinkItem,
	ProductCategory,
	Product,
	WordPressPage,
	MegaMenuSettingsState,
	INITIAL_MENU_ITEMS,
	INITIAL_VISIBILITY_SETTINGS,
	MOCK_WP_PAGES,
	MOCK_PRODUCT_CATEGORIES,
	MOCK_PRODUCTS,
} from './types';
import { MenuStructure } from './MenuStructure';
import { MenuItemSettings, VisibilitySettings } from './MenuItemSettings';
import { ContentPicker } from './ContentPicker';
import { MegaMenuColumnBuilder } from './MegaMenuColumnBuilder';
import { LivePreview } from './LivePreview';

const getApiPath = (endpoint: string): string => {
	const prefix = (window as any).VisualMegaMenuSettings?.apiPrefix || '/visual-mega-menu/v1';
	return `${prefix}${endpoint}`;
};

export const MegaMenuSettings = () => {
	const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
	const [defaultWcItems, setDefaultWcItems] = useState<MenuItem[]>([]);
	const [excelPresetItems, setExcelPresetItems] = useState<MenuItem[]>([]);
	const [showImportModal, setShowImportModal] = useState<boolean>(false);
	const [importJsonText, setImportJsonText] = useState<string>('');
	const [importError, setImportError] = useState<string | null>(null);
	const [wpPages, setWpPages] = useState<WordPressPage[]>([]);
	const [wcCategories, setWcCategories] = useState<ProductCategory[]>([]);
	const [wcProducts, setWcProducts] = useState<Product[]>([]);

	const [selectedMenuId, setSelectedMenuId] = useState<string>('');
	const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
	const [visibilitySettings, setVisibilitySettings] = useState<MegaMenuSettingsState>(
		INITIAL_VISIBILITY_SETTINGS
	);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [saveToast, setSaveToast] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;
		setIsLoading(true);

		const fetchBuilderData = () =>
			apiFetch({ path: getApiPath('/mega-builder-data') })
				.catch(() => apiFetch({ path: '/starter_theme/v1/mega-builder-data' }))
				.catch(() => null);

		const fetchOptionsData = () =>
			apiFetch({ path: getApiPath('/options') })
				.catch(() => apiFetch({ path: '/starter_theme/v1/options' }))
				.catch(() => null);

		Promise.all([fetchBuilderData(), fetchOptionsData()]).then(([builderData, optionsData]: [any, any]) => {
			if (!isMounted) {
				return;
			}

			if (builderData) {
				if (Array.isArray(builderData.categories)) {
					setWcCategories(builderData.categories);
				}
				if (Array.isArray(builderData.pages)) {
					setWpPages(builderData.pages);
				}
				if (Array.isArray(builderData.products)) {
					setWcProducts(builderData.products);
				}
				if (Array.isArray(builderData.defaultMenuItems)) {
					setDefaultWcItems(builderData.defaultMenuItems);
				}
				if (Array.isArray(builderData.excelPresetItems)) {
					setExcelPresetItems(builderData.excelPresetItems);
				}
			}

			const savedBuilder = optionsData?.visual_mega_menu_builder;
			const legacyMockIds = ['menu-home', 'menu-products'];
			const hasOnlyMockItems =
				savedBuilder &&
				Array.isArray(savedBuilder.menuItems) &&
				savedBuilder.menuItems.length > 0 &&
				savedBuilder.menuItems.every((m: any) => legacyMockIds.includes(m.id));

			if (
				savedBuilder &&
				Array.isArray(savedBuilder.menuItems) &&
				savedBuilder.menuItems.length > 0 &&
				!hasOnlyMockItems
			) {
				const loadedItems: MenuItem[] = savedBuilder.menuItems.map((m: any) => {
					const rawCols = Array.isArray(m.columns)
						? m.columns.map((c: any) => ({
							...c,
							items: Array.isArray(c.items)
								? c.items.map((l: any) => ({
									...l,
									children: Array.isArray(l.children) ? l.children : [],
								}))
								: [],
						}))
						: [];

					const rawChildren: MenuLinkItem[] = Array.isArray(m.children) && m.children.length > 0
						? m.children.map((ch: any, chIdx: number) => {
							const matchedCol = rawCols.find(
								(col: any) =>
									(col.termId && ch.termId && Number(col.termId) === Number(ch.termId)) ||
									col.heading === ch.label
							) || rawCols[chIdx];
							const existingSub = Array.isArray(ch.children) && ch.children.length > 0
								? ch.children
								: (matchedCol?.items || []);
							return {
								...ch,
								children: existingSub,
							};
						})
						: rawCols.map((col: any) => ({
							id: col.id.replace(/^col-/, 'sub-'),
							termId: col.termId,
							label: col.heading,
							url: col.url || '#',
							icon: 'ri-folder-3-line',
							thumbUrl: col.thumbUrl,
							children: col.items || [],
						}));

					return {
						...m,
						enableMegaMenu: m.enableMegaMenu !== false && m.enableMegaMenu !== '0',
						showMenuIcons: m.showMenuIcons !== false && m.showMenuIcons !== '0',
						openInNewTab: m.openInNewTab === true || m.openInNewTab === '1',
						enableHoverDropdown: m.enableHoverDropdown !== false && m.enableHoverDropdown !== '0',
						enableMobileAccordion: m.enableMobileAccordion !== false && m.enableMobileAccordion !== '0',
						columnsCount: (Number(m.columnsCount) || 4) as 2 | 3 | 4 | 5 | 6,
						children: rawChildren,
						columns: rawCols,
					};
				});
				setMenuItems(loadedItems);
				setSelectedMenuId(loadedItems[0].id);
				setSelectedColumnId(loadedItems[0].columns?.[0]?.id || null);

				if (savedBuilder.visibilitySettings) {
					setVisibilitySettings({
						hoverToOpen:
							savedBuilder.visibilitySettings.hoverToOpen !== false &&
							savedBuilder.visibilitySettings.hoverToOpen !== '0',
						showIcons:
							savedBuilder.visibilitySettings.showIcons !== false &&
							savedBuilder.visibilitySettings.showIcons !== '0',
						mobileAccordion:
							savedBuilder.visibilitySettings.mobileAccordion !== false &&
							savedBuilder.visibilitySettings.mobileAccordion !== '0',
					});
				}
			} else if (
				builderData &&
				Array.isArray(builderData.defaultMenuItems) &&
				builderData.defaultMenuItems.length > 0
			) {
				setMenuItems(builderData.defaultMenuItems);
				setSelectedMenuId(builderData.defaultMenuItems[0].id);
				setSelectedColumnId(builderData.defaultMenuItems[0].columns?.[0]?.id || null);
			}

			setIsLoading(false);
		});

		return () => {
			isMounted = false;
		};
	}, []);

	const selectedMenuItem = menuItems.find((item) => item.id === selectedMenuId) || null;

	const handleSelectMenu = (id: string) => {
		if (selectedMenuId === id) {
			setSelectedMenuId('');
			setSelectedColumnId(null);
			return;
		}

		setSelectedMenuId(id);
		const target = menuItems.find((m) => m.id === id);
		if (target && target.columns.length > 0) {
			setSelectedColumnId(target.columns[0].id);
		} else {
			setSelectedColumnId(null);
		}
	};

	const handleUpdateSelectedItem = (patch: Partial<MenuItem>) => {
		if (!selectedMenuItem) {
			return;
		}
		setMenuItems((prev) =>
			prev.map((item) => {
				if (item.id !== selectedMenuItem.id) {
					return item;
				}
				const updated = { ...item, ...patch };
				if (patch.enableMegaMenu === true && updated.columns.length === 0) {
					const defaultCol: MenuColumn = {
						id: `col-${Date.now()}`,
						heading: 'Featured Links',
						items: updated.children.map((c) => ({ ...c })),
					};
					updated.columns = [defaultCol];
					setSelectedColumnId(defaultCol.id);
				}
				return updated;
			})
		);
	};

	const handleAddTopMenuItem = (label: string, url: string) => {
		const newId = `menu-${Date.now()}`;
		const newColId = `col-${Date.now() + 1}`;
		const newItem: MenuItem = {
			id: newId,
			label,
			url,
			icon: 'ri-layout-grid-line',
			enableMegaMenu: true,
			dropdownWidth: 'container',
			columnsCount: 4,
			showMenuIcons: true,
			openInNewTab: false,
			enableHoverDropdown: true,
			enableMobileAccordion: true,
			children: [],
			columns: [
				{
					id: newColId,
					heading: label,
					items: [],
				},
			],
		};
		setMenuItems((prev) => [...prev, newItem]);
		setSelectedMenuId(newId);
		setSelectedColumnId(newColId);
	};

	const handleDuplicateMenuItem = (id: string) => {
		const index = menuItems.findIndex((m) => m.id === id);
		if (index === -1) {
			return;
		}
		const source = menuItems[index];
		const cloneId = `menu-${Date.now()}`;
		const clone: MenuItem = {
			...source,
			id: cloneId,
			label: `${source.label} (Copy)`,
			children: source.children.map((c, idx) => ({
				...c,
				id: `sub-${Date.now()}-${idx}`,
			})),
			columns: source.columns.map((col, cIdx) => ({
				...col,
				id: `col-${Date.now()}-${cIdx}`,
				items: col.items.map((l, lIdx) => ({
					...l,
					id: `link-${Date.now()}-${cIdx}-${lIdx}`,
				})),
			})),
		};
		const next = [...menuItems];
		next.splice(index + 1, 0, clone);
		setMenuItems(next);
		setSelectedMenuId(cloneId);
	};

	const handleRemoveMenuItem = (id: string) => {
		const next = menuItems.filter((m) => m.id !== id);
		setMenuItems(next);
		if (selectedMenuId === id) {
			if (next.length > 0) {
				handleSelectMenu(next[0].id);
			} else {
				setSelectedMenuId('');
				setSelectedColumnId(null);
			}
		}
	};

	const handleReorderMenuItems = (fromIndex: number, toIndex: number) => {
		if (
			fromIndex < 0 ||
			toIndex < 0 ||
			fromIndex >= menuItems.length ||
			toIndex >= menuItems.length
		) {
			return;
		}
		const next = [...menuItems];
		const [moved] = next.splice(fromIndex, 1);
		next.splice(toIndex, 0, moved);
		setMenuItems(next);
	};

	const handleUpdateChildrenTree = (parentId: string, nextChildren: MenuLinkItem[]) => {
		setMenuItems((prev) =>
			prev.map((item) => {
				if (item.id !== parentId) {
					return item;
				}
				const syncedColumns: MenuColumn[] = nextChildren.map((l2Node) => ({
					id: l2Node.id.startsWith('col-')
						? l2Node.id
						: `col-${l2Node.id.replace(/^sub-/, '')}`,
					termId: l2Node.termId,
					heading: l2Node.label,
					url: l2Node.url,
					thumbUrl: l2Node.thumbUrl,
					items: (l2Node.children || []).map((l3Node) => ({
						...l3Node,
						children: l3Node.children || [],
					})),
				}));
				return {
					...item,
					children: nextChildren,
					columns: syncedColumns,
				};
			})
		);
	};

	const handleUpdateColumns = (nextColumns: MenuColumn[]) => {
		if (!selectedMenuItem) {
			return;
		}
		setMenuItems((prev) =>
			prev.map((item) => {
				if (item.id !== selectedMenuItem.id) {
					return item;
				}
				const syncedChildren: MenuLinkItem[] = nextColumns.map((col) => ({
					id: col.id.replace(/^col-/, 'sub-'),
					termId: col.termId,
					label: col.heading,
					url: col.url || '#',
					icon: 'ri-folder-3-line',
					thumbUrl: col.thumbUrl,
					children: (col.items || []).map((l3) => ({
						...l3,
						children: l3.children || [],
					})),
				}));
				return {
					...item,
					columns: nextColumns,
					children: syncedChildren,
				};
			})
		);
	};

	const handleJumpToColumnBuilder = (
		menuId: string,
		colId?: string,
		createNewColumn?: boolean
	) => {
		setSelectedMenuId(menuId);
		let targetColId: string | null = colId || null;
		const targetItem = menuItems.find((item) => item.id === menuId);
		const nextColumnIndex = targetItem?.columns?.length || 0;
		const generatedColId = createNewColumn || nextColumnIndex === 0
			? `col-${Date.now()}`
			: null;
		if (generatedColId) {
			targetColId = generatedColId;
		}

		setMenuItems((prev) =>
			prev.map((item) => {
				if (item.id !== menuId) {
					return item;
				}
				const nextColumns = [...(item.columns || [])];
				if (createNewColumn || nextColumns.length === 0) {
					const newCol: MenuColumn = {
						id: generatedColId || `col-${Date.now()}`,
						heading: `Column ${nextColumns.length + 1}`,
						items: [],
					};
					nextColumns.push(newCol);
					targetColId = newCol.id;
				} else if (!targetColId || !nextColumns.some((c) => c.id === targetColId)) {
					targetColId = nextColumns[0]?.id || null;
				}

				const syncedChildren: MenuLinkItem[] = nextColumns.map((col) => ({
					id: col.id.replace(/^col-/, 'sub-'),
					termId: col.termId,
					label: col.heading,
					url: col.url || '#',
					icon: 'ri-folder-3-line',
					thumbUrl: col.thumbUrl,
					children: (col.items || []).map((l3) => ({
						...l3,
						children: l3.children || [],
					})),
				}));

				return {
					...item,
					enableMegaMenu: true,
					columns: nextColumns,
					children: syncedChildren,
				};
			})
		);

		setTimeout(() => {
			if (targetColId) {
				setSelectedColumnId(targetColId);
			}
			const colCard = targetColId ? document.getElementById(`mm-col-card-${targetColId}`) : null;
			const builderCard = document.getElementById('mm-column-builder-card');
			const targetEl = colCard || builderCard;
			if (targetEl) {
				targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
			if (createNewColumn && targetColId) {
				const headingInput = document.getElementById(
					`mm-col-heading-input-${targetColId}`
				) as HTMLInputElement | null;
				if (headingInput) {
					headingInput.focus();
					headingInput.select();
				}
			}
		}, 60);
	};

	const handleAddContentItems = (newLinks: MenuLinkItem[]) => {
		if (newLinks.length === 0) {
			return;
		}

		if (!selectedMenuItem) {
			const newMenuItems: MenuItem[] = newLinks.map((link, index) => ({
				id: `menu-${link.id}-${Date.now()}-${index}`,
				termId: link.termId,
				label: link.label,
				url: link.url,
				icon: link.icon || 'ri-links-line',
				thumbUrl: link.thumbUrl,
				enableMegaMenu: true,
				dropdownWidth: 'container',
				columnsCount: 4,
				showMenuIcons: true,
				openInNewTab: link.openInNewTab || false,
				enableHoverDropdown: true,
				enableMobileAccordion: true,
				children: [],
				columns: [
					{
						id: `col-${link.id}-${Date.now()}-${index}`,
						heading: link.label,
						thumbUrl: link.thumbUrl,
						items: [],
					},
				],
			}));

			setMenuItems((prev) => [...prev, ...newMenuItems]);
			setSaveToast(`Added ${newMenuItems.length} item${newMenuItems.length > 1 ? 's' : ''} to Menu Structure`);
			setTimeout(() => setSaveToast(null), 2800);
			return;
		}

		const categoryLinks = newLinks.filter((link) => link.termId && link.termId > 0);
		if (categoryLinks.length === newLinks.length) {
			const newColumns = categoryLinks.map((link, index) => ({
				id: `col-${link.id}-${Date.now()}-${index}`,
				termId: link.termId,
				heading: link.label,
				url: link.url,
				thumbUrl: link.thumbUrl,
				items: [],
			}));
			const nextColumns = [...selectedMenuItem.columns, ...newColumns];
			setMenuItems((prev) => prev.map((item) => item.id === selectedMenuItem.id
				? {
					...item,
					enableMegaMenu: true,
					columns: nextColumns,
					children: nextColumns.map((col) => ({
						id: col.id.replace(/^col-/, 'sub-'),
						termId: col.termId,
						label: col.heading,
						url: col.url || '#',
						icon: 'ri-folder-3-line',
						thumbUrl: col.thumbUrl,
						children: [],
					}))
				} : item));
			setSelectedColumnId(newColumns[newColumns.length - 1].id);
			setSaveToast(`Added ${newColumns.length} category menu${newColumns.length > 1 ? 's' : ''}`);
			setTimeout(() => setSaveToast(null), 2800);
			return;
		}

		setMenuItems((prev) =>
			prev.map((item) => {
				if (item.id !== selectedMenuItem.id) {
					return item;
				}

				let columns = [...item.columns];
				if (columns.length === 0) {
					const firstCol: MenuColumn = {
						id: `col-${Date.now()}`,
						heading: 'Categories',
						items: [],
					};
					columns = [firstCol];
				}

				const targetColId =
					selectedColumnId && columns.some((c) => c.id === selectedColumnId)
						? selectedColumnId
						: columns[0].id;

				const updatedColumns = columns.map((col) =>
					col.id === targetColId
						? { ...col, items: [...col.items, ...newLinks] }
						: col
				);

				const syncedChildren: MenuLinkItem[] = updatedColumns.map((col) => ({
					id: col.id.replace(/^col-/, 'sub-'),
					termId: col.termId,
					label: col.heading,
					url: col.url || '#',
					icon: 'ri-folder-3-line',
					thumbUrl: col.thumbUrl,
					children: (col.items || []).map((l3) => ({
						...l3,
						children: l3.children || [],
					})),
				}));

				return {
					...item,
					enableMegaMenu: true,
					columns: updatedColumns,
					children: syncedChildren,
				};
			})
		);

		const targetColName =
			selectedMenuItem.columns.find((c) => c.id === selectedColumnId)?.heading ||
			selectedMenuItem.columns[0]?.heading ||
			'First Column';

		setSaveToast(
			`Added ${newLinks.length} item${newLinks.length > 1 ? 's' : ''} to "${targetColName}"`
		);
		setTimeout(() => setSaveToast(null), 2800);
	};

	const handleUpdateVisibility = (patch: Partial<MegaMenuSettingsState>) => {
		setVisibilitySettings((prev) => ({ ...prev, ...patch }));
	};

	const handleClearAllItems = () => {
		setMenuItems([]);
		setSelectedMenuId('');
		setSelectedColumnId(null);
		setSaveToast('ล้างรายการเมนูทั้งหมดแล้ว กด Save changes เพื่อบันทึก');
		setTimeout(() => setSaveToast(null), 3500);
	};

	const normalizeImportedItems = (rawItems: any[]): MenuItem[] => {
		return rawItems.map((m: any) => {
			const rawCols = Array.isArray(m.columns)
				? m.columns.map((c: any) => ({
					...c,
					items: Array.isArray(c.items)
						? c.items.map((l: any) => ({
							...l,
							children: Array.isArray(l.children) ? l.children : [],
						}))
						: [],
				}))
				: [];

			const rawChildren: MenuLinkItem[] = Array.isArray(m.children) && m.children.length > 0
				? m.children.map((ch: any, chIdx: number) => {
					const matchedCol = rawCols.find(
						(col: any) =>
							(col.termId && ch.termId && Number(col.termId) === Number(ch.termId)) ||
							col.heading === ch.label
					) || rawCols[chIdx];
					const existingSub = Array.isArray(ch.children) && ch.children.length > 0
						? ch.children
						: (matchedCol?.items || []);
					return {
						...ch,
						children: existingSub,
					};
				})
				: rawCols.map((col: any) => ({
					id: String(col.id || '').replace(/^col-/, 'sub-'),
					termId: col.termId,
					label: col.heading,
					url: col.url || '#',
					icon: 'ri-folder-3-line',
					thumbUrl: col.thumbUrl,
					children: col.items || [],
				}));

			return {
				...m,
				enableMegaMenu: m.enableMegaMenu !== false && m.enableMegaMenu !== '0',
				showMenuIcons: m.showMenuIcons !== false && m.showMenuIcons !== '0',
				openInNewTab: m.openInNewTab === true || m.openInNewTab === '1',
				enableHoverDropdown: m.enableHoverDropdown !== false && m.enableHoverDropdown !== '0',
				enableMobileAccordion: m.enableMobileAccordion !== false && m.enableMobileAccordion !== '0',
				columnsCount: (Number(m.columnsCount) || 4) as 2 | 3 | 4 | 5 | 6,
				children: rawChildren,
				columns: rawCols,
			};
		});
	};

	const handleSyncFromWooCommerce = () => {
		if (defaultWcItems.length === 0) {
			return;
		}
		setMenuItems(defaultWcItems);
		setSelectedMenuId(defaultWcItems[0].id);
		setSelectedColumnId(defaultWcItems[0].columns?.[0]?.id || null);
		setSaveToast('Loaded default WooCommerce category hierarchy. Click Save changes to apply.');
		setTimeout(() => setSaveToast(null), 3500);
	};

	const handleLoadExcelPreset = () => {
		if (excelPresetItems.length === 0) {
			return;
		}
		const normalized = normalizeImportedItems(excelPresetItems);
		setMenuItems(normalized);
		setSelectedMenuId(normalized[0]?.id || '');
		setSelectedColumnId(normalized[0]?.columns?.[0]?.id || null);
		setSaveToast('โหลดโครงสร้าง Mega Menu ตามไฟล์ Excel เรียบร้อยแล้ว! กด Save changes เพื่อบันทึก');
		setTimeout(() => setSaveToast(null), 4000);
	};

	const handleExportJson = () => {
		const syncedLegacyItems = menuItems
			.filter((m) => m.termId && m.termId > 0)
			.map((m) => ({
				term_id: String(m.termId),
				custom_label: m.label,
				enabled: m.enableMegaMenu ? '1' : '0',
				children: m.columns
					.filter((c) => c.termId && c.termId > 0)
					.map((c) => ({
						term_id: String(c.termId),
						custom_label: c.heading,
						enabled: '1',
						children: c.items
							.filter((l) => l.termId && l.termId > 0)
							.map((l) => ({
								term_id: String(l.termId),
								custom_label: l.label,
								enabled: '1',
							})),
					})),
			}));

		const payload = {
			version: '1.0',
			exportedAt: new Date().toISOString(),
			visual_mega_menu_builder: {
				menuItems,
				visibilitySettings,
			},
			visual_mega_menu_items: syncedLegacyItems,
		};

		const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		const dateStr = new Date().toISOString().slice(0, 10);
		a.download = 'visual-mega-menu-settings-' + dateStr + '.json';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		setSaveToast('Export ไฟล์ JSON สำเร็จแล้ว!');
		setTimeout(() => setSaveToast(null), 3000);
	};

	const handleApplyImportJson = (rawText: string) => {
		setImportError(null);
		try {
			const parsed = JSON.parse(rawText);
			const builderObj = parsed?.visual_mega_menu_builder || parsed;
			const rawItems = Array.isArray(builderObj?.menuItems)
				? builderObj.menuItems
				: Array.isArray(parsed)
					? parsed
					: null;

			if (!rawItems || rawItems.length === 0) {
				setImportError('ไม่พบข้อมูล menuItems ในไฟล์หรือข้อความ JSON ที่ระบุ');
				return;
			}

			const normalized = normalizeImportedItems(rawItems);
			setMenuItems(normalized);
			setSelectedMenuId(normalized[0]?.id || '');
			setSelectedColumnId(normalized[0]?.columns?.[0]?.id || null);

			if (builderObj?.visibilitySettings) {
				setVisibilitySettings({
					hoverToOpen:
						builderObj.visibilitySettings.hoverToOpen !== false &&
						builderObj.visibilitySettings.hoverToOpen !== '0',
					showIcons:
						builderObj.visibilitySettings.showIcons !== false &&
						builderObj.visibilitySettings.showIcons !== '0',
					mobileAccordion:
						builderObj.visibilitySettings.mobileAccordion !== false &&
						builderObj.visibilitySettings.mobileAccordion !== '0',
				});
			}

			setShowImportModal(false);
			setImportJsonText('');
			setSaveToast('Import ข้อมูล Mega Menu สำเร็จ (' + normalized.length + ' หมวดหลัก)! กด Save changes เพื่อบันทึก');
			setTimeout(() => setSaveToast(null), 4000);
		} catch (err: any) {
			setImportError('รูปแบบ JSON ไม่ถูกต้อง กรุณาตรวจสอบไฟล์หรือข้อความอีกครั้ง');
		}
	};

	const handleImportFileChange = (e: any) => {
		const file = e.target?.files?.[0];
		if (!file) {
			return;
		}
		const reader = new FileReader();
		reader.onload = (evt) => {
			const content = String(evt.target?.result || '');
			setImportJsonText(content);
			handleApplyImportJson(content);
		};
		reader.readAsText(file);
	};

	const handleSaveChanges = () => {
		if (isSaving) {
			return;
		}
		setIsSaving(true);

		// Also build legacy visual_mega_menu_items for compatibility
		const syncedLegacyItems = menuItems
			.filter((m) => m.termId && m.termId > 0)
			.map((m) => ({
				term_id: String(m.termId),
				custom_label: m.label,
				enabled: m.enableMegaMenu ? '1' : '0',
				children: m.columns
					.filter((c) => c.termId && c.termId > 0)
					.map((c) => ({
						term_id: String(c.termId),
						custom_label: c.heading,
						enabled: '1',
						children: c.items
							.filter((l) => l.termId && l.termId > 0)
							.map((l) => ({
								term_id: String(l.termId),
								custom_label: l.label,
								enabled: '1',
							})),
					})),
			}));

		const saveData = {
			visual_mega_menu_builder: {
				menuItems,
				visibilitySettings,
			},
			visual_mega_menu_items: syncedLegacyItems,
		};

		apiFetch({
			path: getApiPath('/options'),
			method: 'POST',
			data: saveData,
		})
			.catch(() =>
				apiFetch({
					path: '/starter_theme/v1/options',
					method: 'POST',
					data: saveData,
				})
			)
			.then(() => {
				setIsSaving(false);
				setSaveToast('บันทึกการตั้งค่าไปยัง Mega Menu หน้าเว็บเรียบร้อยแล้ว!');
				setTimeout(() => setSaveToast(null), 3500);
			})
			.catch(() => {
				setIsSaving(false);
				setSaveToast('เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง');
				setTimeout(() => setSaveToast(null), 3500);
			});
	};

	const activeTargetColumnName =
		selectedMenuItem?.columns.find((c) => c.id === selectedColumnId)?.heading ||
		selectedMenuItem?.columns[0]?.heading ||
		'First Column';

	return (
		<div id="mm-saas-dashboard-wrapper" className="mm-saas-dashboard">
			<style id="mm-saas-dashboard-styles" className="mm-saas-dashboard__styles">{`
				.mm-saas-dashboard {
					font-family: 'Inter', 'Noto Sans Thai', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
					background-color: #F8FAFC;
					color: #0F172A;
					padding: 24px;
					margin: -10px -20px 0 -2px;
					min-height: calc(100vh - 60px);
					box-sizing: border-box;
				}
				.mm-saas-dashboard *,
				.mm-saas-dashboard *::before,
				.mm-saas-dashboard *::after {
					box-sizing: border-box;
				}
				.mm-workspace-grid {
					display: grid;
					grid-template-columns: 1fr;
					gap: 20px;
					align-items: start;
				}
				.mm-col-stack {
					display: flex;
					flex-direction: column;
					gap: 20px;
					min-width: 0;
				}
				.mm-save-btn {
					background-color: #4169F7;
					color: #FFFFFF;
					border: none;
					border-radius: 10px;
					padding: 10px 18px;
					font-size: 13.5px;
					font-weight: 600;
					cursor: pointer;
					display: inline-flex;
					align-items: center;
					gap: 8px;
					box-shadow: 0 2px 6px rgba(65, 105, 247, 0.24);
					transition: background-color 160ms ease, transform 160ms ease, box-shadow 160ms ease;
				}
				.mm-save-btn:hover {
					background-color: #3154D9;
					box-shadow: 0 4px 10px rgba(49, 84, 217, 0.3);
				}
				.mm-save-btn:disabled {
					opacity: 0.65;
					cursor: wait;
				}
				.mm-secondary-btn {
					background-color: #FFFFFF;
					color: #334155;
					border: 1px solid #CBD5E1;
					border-radius: 10px;
					padding: 9px 14px;
					font-size: 12.5px;
					font-weight: 600;
					cursor: pointer;
					display: inline-flex;
					align-items: center;
					gap: 6px;
					transition: all 150ms ease;
				}
				.mm-secondary-btn:hover {
					background-color: #F1F5F9;
					color: #0F172A;
				}

				/* Tablet: 768px - 1439px (2 columns for structure & editor, preview spans full width below) */
				@media (min-width: 768px) and (max-width: 1439px) {
					.mm-workspace-grid {
						grid-template-columns: 38% calc(62% - 20px);
					}
					.mm-col-right {
						grid-column: 1 / -1;
					}
				}

				/* Desktop: 1440px and above (3-column layout: 25% / 35% / 40%) */
				@media (min-width: 1440px) {
					.mm-workspace-grid {
						grid-template-columns: calc(25% - 14px) calc(35% - 13px) calc(40% - 13px);
					}
				}

				/* Mobile: Below 768px */
				@media (max-width: 767px) {
					.mm-saas-dashboard {
						padding: 16px 12px;
						margin: 0;
					}
				}

				@keyframes mmSpin {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}
				@keyframes mmShimmer {
					0% { background-position: -200% 0; }
					100% { background-position: 200% 0; }
				}
				@keyframes mmFadeInUp {
					from {
						opacity: 0;
						transform: translateY(6px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				.mm-spin {
					display: inline-block;
					animation: mmSpin 900ms linear infinite;
				}
				.mm-fade-in {
					animation: mmFadeInUp 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
				}
				.mm-skeleton-card {
					background-color: #FFFFFF;
					border: 1px solid #E2E8F0;
					border-radius: 12px;
					padding: 20px;
					box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
				}
				.mm-skeleton-bar {
					background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
					background-size: 200% 100%;
					animation: mmShimmer 1.4s ease-in-out infinite;
					border-radius: 8px;
				}
			` }</style>

			{ /* Top Page Header */}
			<header
				id="mm-page-header"
				className="mm-page-header"
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: '16px',
					marginBottom: '24px',
					flexWrap: 'wrap',
				}}
			>
				<div id="mm-page-header-left" className="mm-page-header__left">
					<div
						id="mm-page-header-title-row"
						className="mm-page-header__title-row"
						style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
					>
						<span
							id="mm-page-header-icon-box"
							className="mm-page-header__icon-box"
							style={{
								width: '36px',
								height: '36px',
								borderRadius: '10px',
								background: '#EEF4FF',
								border: '1px solid #DBEAFE',
								color: '#4169F7',
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontSize: '18px',
							}}
						>
							<i id="mm-page-header-icon" className="ri-layout-masonry-line"></i>
						</span>
						<h1
							id="mm-page-title"
							className="mm-page-header__title"
							style={{
								margin: 0,
								fontSize: '22px',
								fontWeight: 700,
								color: '#0F172A',
								letterSpacing: '-0.02em',
							}}
						>
							Mega Menu Settings
						</h1>
						{isLoading && (
							<span
								id="mm-loading-pill"
								className="mm-page-header__loading"
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									gap: '6px',
									fontSize: '11.5px',
									fontWeight: 600,
									color: '#4169F7',
									background: '#EEF4FF',
									border: '1px solid #DBEAFE',
									padding: '4px 12px',
									borderRadius: '999px',
								}}
							>
								<i id="mm-loading-pill-ico" className="ri-loader-4-line mm-spin"></i>
								<span>กำลังซิงค์ข้อมูลจาก WordPress & WooCommerce...</span>
							</span>
						)}
					</div>
					<p
						id="mm-page-subtitle"
						className="mm-page-header__subtitle"
						style={{
							margin: '4px 0 0 0',
							fontSize: '13.5px',
							color: '#64748B',
						}}
					>
						Create and customize your mega menu to help customers find what they need.
					</p>
				</div>

				<div
					id="mm-page-header-actions"
					className="mm-page-header__actions"
					style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}
				>
					{saveToast && (
						<div
							id="mm-save-toast"
							className="mm-page-header__toast"
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: '6px',
								padding: '7px 12px',
								borderRadius: '8px',
								background: '#ECFDF5',
								border: '1px solid #A7F3D0',
								color: '#065F46',
								fontSize: '12.5px',
								fontWeight: 600,
							}}
						>
							<i id="mm-save-toast-ico" className="ri-checkbox-circle-line"></i>
							<span>{saveToast}</span>
						</div>
					)}

					{!isLoading && menuItems.length > 0 && (
						<button
							id="mm-clear-all-btn"
							className="mm-secondary-btn"
							type="button"
							onClick={handleClearAllItems}
							title="ล้างรายการเมนูทั้งหมด"
							style={{ color: '#EF4444', borderColor: '#FECACA' }}
						>
							<i id="mm-clear-all-ico" className="ri-delete-bin-line"></i>
							<span>Clear All</span>
						</button>
					)}

					{!isLoading && excelPresetItems.length > 0 && (
						<button
							id="mm-load-excel-preset-btn"
							className="mm-secondary-btn"
							type="button"
							onClick={handleLoadExcelPreset}
							title="โหลดโครงสร้างหมวดหมู่ตามไฟล์ Excel ทั้ง 8 หมวดหลัก"
							style={{ color: '#0284C7', borderColor: '#BAE6FD', backgroundColor: '#F0F9FF' }}
						>
							<i id="mm-load-excel-preset-ico" className="ri-file-excel-2-line"></i>
							<span>Load Excel Preset</span>
						</button>
					)}

					{!isLoading && (
						<button
							id="mm-export-json-btn"
							className="mm-secondary-btn"
							type="button"
							onClick={handleExportJson}
							title="ดาวน์โหลดการตั้งค่า Mega Menu เป็นไฟล์ JSON"
						>
							<i id="mm-export-json-ico" className="ri-download-2-line"></i>
							<span>Export JSON</span>
						</button>
					)}

					{!isLoading && (
						<button
							id="mm-import-json-btn"
							className="mm-secondary-btn"
							type="button"
							onClick={() => {
								setImportError(null);
								setShowImportModal(true);
							}}
							title="นำเข้าการตั้งค่า Mega Menu จากไฟล์ JSON"
						>
							<i id="mm-import-json-ico" className="ri-upload-2-line"></i>
							<span>Import JSON</span>
						</button>
					)}

					{!isLoading && defaultWcItems.length > 0 && (
						<button
							id="mm-sync-wc-btn"
							className="mm-secondary-btn"
							type="button"
							onClick={handleSyncFromWooCommerce}
							title="ดึงโครงสร้างหมวดหมู่เริ่มต้นจาก WooCommerce ใหม่"
						>
							<i id="mm-sync-wc-ico" className="ri-refresh-line"></i>
							<span>Sync WooCommerce</span>
						</button>
					)}

					<button
						id="mm-save-changes-btn"
						className="mm-save-btn"
						type="button"
						disabled={isSaving || isLoading}
						onClick={handleSaveChanges}
					>
						<i
							id="mm-save-changes-ico"
							className={isSaving ? 'ri-loader-4-line mm-spin' : 'ri-save-3-line'}
						></i>
						<span>{isSaving ? 'Saving...' : 'Save changes'}</span>
					</button>
				</div>
			</header>

			{showImportModal && (
				<div
					id="mm-import-modal-backdrop"
					className="mm-import-modal-backdrop"
					style={{
						position: 'fixed',
						inset: 0,
						zIndex: 99999,
						backgroundColor: 'rgba(15, 23, 42, 0.55)',
						backdropFilter: 'blur(2px)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '20px',
					}}
					onClick={() => setShowImportModal(false)}
				>
					<div
						id="mm-import-modal-dialog"
						className="mm-import-modal-dialog"
						style={{
							backgroundColor: '#FFFFFF',
							borderRadius: '14px',
							width: '100%',
							maxWidth: '640px',
							padding: '24px',
							boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
							border: '1px solid #E2E8F0',
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<div id="mm-import-modal-header" className="mm-import-modal__header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
							<div id="mm-import-modal-title-wrap" className="mm-import-modal__title-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
								<span id="mm-import-modal-icon" className="mm-import-modal__icon" style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#EEF4FF', color: '#4169F7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
									<i id="mm-import-modal-icon-i" className="ri-upload-cloud-2-line"></i>
								</span>
								<h3 id="mm-import-modal-title" className="mm-import-modal__title" style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
									Import Mega Menu Settings (JSON)
								</h3>
							</div>
							<button
								id="mm-import-modal-close"
								className="mm-secondary-btn"
								type="button"
								onClick={() => setShowImportModal(false)}
								style={{ padding: '6px 10px' }}
							>
								<i id="mm-import-modal-close-ico" className="ri-close-line"></i>
							</button>
						</div>

						<p id="mm-import-modal-desc" className="mm-import-modal__desc" style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
							เลือกไฟล์ .json ที่ได้จากการ Export หรือวางโค้ด JSON ด้านล่างเพื่อนำเข้าโครงสร้าง Mega Menu ทั้งหมด
						</p>

						<div id="mm-import-file-box" className="mm-import-modal__file-box" style={{ marginBottom: '16px', padding: '14px', border: '1px dashed #94A3B8', borderRadius: '10px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
							<input
								id="mm-import-file-input"
								className="mm-import-modal__file-input"
								type="file"
								accept=".json,application/json"
								onChange={handleImportFileChange}
								style={{ fontSize: '13px' }}
							/>
							{excelPresetItems.length > 0 && (
								<button
									id="mm-import-modal-excel-btn"
									className="mm-secondary-btn"
									type="button"
									onClick={() => {
										handleLoadExcelPreset();
										setShowImportModal(false);
									}}
									style={{ color: '#0284C7', borderColor: '#BAE6FD', backgroundColor: '#F0F9FF' }}
								>
									<i id="mm-import-modal-excel-ico" className="ri-file-excel-2-line"></i>
									<span>ดึงค่าเริ่มต้นตามไฟล์ Excel ทันที</span>
								</button>
							)}
						</div>

						<textarea
							id="mm-import-json-textarea"
							className="mm-import-modal__textarea"
							rows={8}
							value={importJsonText}
							onChange={(e) => setImportJsonText(e.target.value)}
							placeholder='{"visual_mega_menu_builder": {"menuItems": [...]}}'
							style={{
								width: '100%',
								fontFamily: 'Consolas, monospace',
								fontSize: '12px',
								padding: '12px',
								borderRadius: '8px',
								border: '1px solid #CBD5E1',
								marginBottom: '12px',
							}}
						/>

						{importError && (
							<div id="mm-import-error-msg" className="mm-import-modal__error" style={{ marginBottom: '12px', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '12.5px', fontWeight: 600 }}>
								{importError}
							</div>
						)}

						<div id="mm-import-modal-footer" className="mm-import-modal__footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
							<button
								id="mm-import-cancel-btn"
								className="mm-secondary-btn"
								type="button"
								onClick={() => setShowImportModal(false)}
							>
								<span>ยกเลิก</span>
							</button>
							<button
								id="mm-import-confirm-btn"
								className="mm-save-btn"
								type="button"
								onClick={() => handleApplyImportJson(importJsonText)}
							>
								<i id="mm-import-confirm-ico" className="ri-check-line"></i>
								<span>Import ข้อมูล</span>
							</button>
						</div>
					</div>
				</div>
			)}

			{isLoading ? (
				<div id="mm-loading-skeleton-container" className="mm-loading-skeleton">
					<div id="mm-skeleton-workspace" className="mm-workspace-grid">
						{ /* Left Skeleton: Menu Structure */}
						<div id="mm-skeleton-col-left" className="mm-col-stack mm-col-left">
							<div id="mm-skeleton-structure-card" className="mm-skeleton-card">
								<div id="mm-skeleton-structure-head" className="mm-skeleton-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
									<div id="mm-skeleton-structure-titles" className="mm-skeleton-titles" style={{ flex: 1 }}>
										<div id="mm-sk-bar-l1" className="mm-skeleton-bar" style={{ width: '130px', height: '16px', marginBottom: '6px' }} />
										<div id="mm-sk-bar-l2" className="mm-skeleton-bar" style={{ width: '190px', height: '11px' }} />
									</div>
									<div id="mm-sk-bar-l3" className="mm-skeleton-bar" style={{ width: '82px', height: '32px' }} />
								</div>
								<div id="mm-skeleton-tree-items" className="mm-skeleton-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
									{[1, 2, 3, 4, 5, 6].map((idx) => (
										<div
											key={idx}
											id={`mm-sk-tree-row-${idx}`}
											className="mm-skeleton-row"
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: '10px',
												padding: '10px 12px',
												border: '1px solid #F1F5F9',
												borderRadius: '10px',
											}}
										>
											<div id={`mm-sk-tree-ico-${idx}`} className="mm-skeleton-bar" style={{ width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0 }} />
											<div id={`mm-sk-tree-txt-${idx}`} className="mm-skeleton-bar" style={{ width: idx % 2 === 0 ? '65%' : '80%', height: '14px' }} />
										</div>
									))}
								</div>
							</div>
						</div>

						{ /* Center Skeleton: Item Settings + Content Picker */}
						<div id="mm-skeleton-col-center" className="mm-col-stack mm-col-center">
							<div id="mm-skeleton-settings-card" className="mm-skeleton-card">
								<div id="mm-sk-set-title" className="mm-skeleton-bar" style={{ width: '140px', height: '16px', marginBottom: '18px' }} />
								<div id="mm-sk-set-grid" className="mm-skeleton-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
									<div id="mm-sk-set-inp1" className="mm-skeleton-bar" style={{ height: '38px' }} />
									<div id="mm-sk-set-inp2" className="mm-skeleton-bar" style={{ height: '38px' }} />
								</div>
								<div id="mm-sk-set-toggle" className="mm-skeleton-bar" style={{ height: '54px', marginBottom: '14px' }} />
								<div id="mm-sk-set-radios" className="mm-skeleton-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
									<div id="mm-sk-set-rad1" className="mm-skeleton-bar" style={{ height: '58px' }} />
									<div id="mm-sk-set-rad2" className="mm-skeleton-bar" style={{ height: '58px' }} />
								</div>
							</div>

							<div id="mm-skeleton-picker-card" className="mm-skeleton-card">
								<div id="mm-sk-pick-title" className="mm-skeleton-bar" style={{ width: '210px', height: '16px', marginBottom: '8px' }} />
								<div id="mm-sk-pick-sub" className="mm-skeleton-bar" style={{ width: '260px', height: '11px', marginBottom: '14px' }} />
								<div id="mm-sk-pick-tabs" className="mm-skeleton-bar" style={{ height: '36px', marginBottom: '12px' }} />
								<div id="mm-sk-pick-search" className="mm-skeleton-bar" style={{ height: '36px', marginBottom: '12px' }} />
								<div id="mm-sk-pick-list" className="mm-skeleton-bar" style={{ height: '160px' }} />
							</div>
						</div>

						{ /* Right Skeleton: Column Builder + Live Preview */}
						<div id="mm-skeleton-col-right" className="mm-col-stack mm-col-right">
							<div id="mm-skeleton-builder-card" className="mm-skeleton-card">
								<div id="mm-sk-bld-head" className="mm-skeleton-head" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
									<div id="mm-sk-bld-title" className="mm-skeleton-bar" style={{ width: '200px', height: '16px' }} />
									<div id="mm-sk-bld-btn" className="mm-skeleton-bar" style={{ width: '100px', height: '30px' }} />
								</div>
								<div id="mm-sk-bld-cols" className="mm-skeleton-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
									<div id="mm-sk-bld-col1" className="mm-skeleton-bar" style={{ height: '170px' }} />
									<div id="mm-sk-bld-col2" className="mm-skeleton-bar" style={{ height: '170px' }} />
								</div>
							</div>

							<div id="mm-skeleton-preview-card" className="mm-skeleton-card">
								<div id="mm-sk-prv-head" className="mm-skeleton-head" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
									<div id="mm-sk-prv-title" className="mm-skeleton-bar" style={{ width: '140px', height: '16px' }} />
									<div id="mm-sk-prv-mode" className="mm-skeleton-bar" style={{ width: '130px', height: '28px' }} />
								</div>
								<div id="mm-sk-prv-browser" className="mm-skeleton-bar" style={{ height: '280px', borderRadius: '10px' }} />
							</div>
						</div>
					</div>
				</div>
			) : (
				<div id="mm-loaded-content-wrapper" className="mm-fade-in">
					{ /* Main Three-Column Workspace */}
					<div id="mm-workspace-grid" className="mm-workspace-grid">
						{ /* Left Column (25%): Section A — Menu Structure */}
						<div id="mm-col-left" className="mm-col-stack mm-col-left">
							<MenuStructure
								items={menuItems}
								selectedId={selectedMenuId}
								onSelect={handleSelectMenu}
								onAddMenuItem={handleAddTopMenuItem}
								onDuplicateMenuItem={handleDuplicateMenuItem}
								onDeleteMenuItem={handleRemoveMenuItem}
								onReorderMenuItems={handleReorderMenuItems}
								onUpdateChildrenTree={handleUpdateChildrenTree}
								onJumpToColumnBuilder={handleJumpToColumnBuilder}
							/>
						</div>

						{ /* Center Column (35%): Section B — Edit Menu Item + Section C — Content Picker */}
						<div id="mm-col-center" className="mm-col-stack mm-col-center">
							<MenuItemSettings
								item={selectedMenuItem}
								onUpdate={handleUpdateSelectedItem}
							/>

							<ContentPicker
								pages={wpPages}
								categories={wcCategories}
								products={wcProducts}
								targetColumnHeading={activeTargetColumnName}
								onAddItems={handleAddContentItems}
							/>
						</div>

						{ /* Right Column (40%): Section D — Mega Menu Content Builder + Section E — Live Preview */}
						<div id="mm-col-right" className="mm-col-stack mm-col-right">
							<MegaMenuColumnBuilder
								item={selectedMenuItem}
								selectedColumnId={selectedColumnId}
								onSelectColumn={setSelectedColumnId}
								onUpdateColumns={handleUpdateColumns}
							/>

							<LivePreview
								items={menuItems}
								selectedMenuId={selectedMenuId}
								onSelectMenu={handleSelectMenu}
								visibilitySettings={visibilitySettings}
							/>
						</div>
					</div>

					{ /* Section F — Visibility & Behavior (Horizontal Settings Card Below Workspace) */}
					<div
						id="mm-bottom-visibility-section"
						className="mm-bottom-section"
						style={{ marginTop: '20px' }}
					>
						<VisibilitySettings
							settings={visibilitySettings}
							onChange={handleUpdateVisibility}
						/>
					</div>
				</div>
			)}
		</div>
	);
};
