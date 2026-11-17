/**
 * Visual Mega Menu Builder — React Admin Entry Point
 *
 * Mounts the Mega Menu Builder SaaS dashboard into the admin page container.
 *
 * @package visual-mega-menu-builder
 */

import { createRoot } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { MegaMenuSettings } from './MegaMenuSettings';

// Set up nonce and REST base URL middleware from localized script data
const config = ( window as any ).VisualMegaMenuSettings || {};

if ( config.nonce ) {
	apiFetch.use( apiFetch.createNonceMiddleware( config.nonce ) );
}

if ( config.restRoot ) {
	apiFetch.use( apiFetch.createRootURLMiddleware( config.restRoot ) );
}

const mountBuilder = () => {
	const container = document.getElementById( 'visual-mega-menu-builder-root' );

	if ( container && ! ( container as any )._hasRoot ) {
		( container as any )._hasRoot = true;
		const root = createRoot( container );
		root.render( <MegaMenuSettings /> );
	}
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', mountBuilder );
} else {
	mountBuilder();
}
