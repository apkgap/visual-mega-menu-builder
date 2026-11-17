/**
 * TypeScript Interfaces for Mega Menu Builder Settings UI
 *
 * @package starter-theme
 */

export interface MenuLinkItem {
	id: string;
	termId?: number;
	label: string;
	url: string;
	icon?: string;
	thumbUrl?: string;
	openInNewTab?: boolean;
	badge?: string;
	children?: MenuLinkItem[];
}

export interface MenuColumn {
	id: string;
	termId?: number;
	heading: string;
	url?: string;
	thumbUrl?: string;
	items: MenuLinkItem[];
}

export interface MenuItem {
	id: string;
	termId?: number;
	label: string;
	url: string;
	icon: string;
	thumbUrl?: string;
	enableMegaMenu: boolean;
	dropdownWidth: 'full' | 'container';
	columnsCount: 2 | 3 | 4 | 5 | 6;
	showMenuIcons: boolean;
	openInNewTab: boolean;
	enableHoverDropdown: boolean;
	enableMobileAccordion: boolean;
	children: MenuLinkItem[];
	columns: MenuColumn[];
	promoCard?: {
		enabled: boolean;
		badge: string;
		title: string;
		subtitle: string;
		ctaText: string;
		ctaUrl: string;
	};
}

export interface ProductCategory {
	id: string;
	term_id?: number;
	parent?: number;
	name: string;
	slug: string;
	icon: string;
	count: number;
	group: string;
	url: string;
	thumb_url?: string;
}

export interface Product {
	id: string;
	name: string;
	sku: string;
	price: string;
	thumbColor: string;
	icon: string;
	url: string;
	thumb_url?: string;
}

export interface WordPressPage {
	id: string;
	title: string;
	slug: string;
	url: string;
	icon: string;
}

export interface MegaMenuSettingsState {
	hoverToOpen: boolean;
	showIcons: boolean;
	mobileAccordion: boolean;
}

export const INITIAL_VISIBILITY_SETTINGS: MegaMenuSettingsState = {
	hoverToOpen: true,
	showIcons: true,
	mobileAccordion: true,
};

export const INITIAL_MENU_ITEMS: MenuItem[] = [];
export const MOCK_WP_PAGES: WordPressPage[] = [];
export const MOCK_PRODUCT_CATEGORIES: ProductCategory[] = [];
export const MOCK_PRODUCTS: Product[] = [];
