/**
 * External dependencies
 */
import '@automattic/calypso-polyfills';
import { I18nProvider } from '@automattic/react-i18n';
import { getLanguageFile } from '../../lib/i18n-utils/switch-locale';
import * as React from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import config from '../../config';
import { subscribe, select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { Gutenboard } from './gutenboard';
import { setupWpDataDebug } from './devtools';
import accessibleFocus from 'lib/accessible-focus';
import { USER_STORE } from './stores/user';

/**
 * Style dependencies
 */
import 'assets/stylesheets/gutenboarding.scss';
import 'components/environment-badge/style.scss';

window.AppBoot = async () => {
	if ( ! config.isEnabled( 'gutenboarding' ) ) {
		window.location.href = '/';
		return;
	}
	setupWpDataDebug();

	// Add accessible-focus listener.
	accessibleFocus();

	let unsubscribe = () => undefined;
	const locale = await new Promise< string >( resolve => {
		if ( window.currentUser ) {
			resolve( window.currentUser.language );
		}

		select( USER_STORE ).getCurrentUser();
		unsubscribe = subscribe( () => {
			const currentUser = select( USER_STORE ).getCurrentUser();
			if ( currentUser ) {
				resolve( currentUser.language );
			}
			if ( ! select( 'core/data' ).isResolving( USER_STORE, 'getCurrentUser' ) ) {
				resolve( config( 'i18n_default_locale_slug' ) );
			}
		} ) as any;
	} );
	unsubscribe();
	const localeData = await new Promise< object >( resolve => {
		if ( window.i18nLocaleStrings ) {
			try {
				const bootstrappedLocaleData = JSON.parse( window.i18nLocaleStrings );
				return resolve( bootstrappedLocaleData );
			} catch {}
		}
		getLocaleData( locale ).then( resolve );
	} );

	ReactDom.render(
		<I18nProvider locale={ locale } localeData={ localeData }>
			<BrowserRouter basename="gutenboarding">
				<Gutenboard />
			</BrowserRouter>
		</I18nProvider>,
		document.getElementById( 'wpcom' )
	);
};

async function getLocaleData( locale: string ) {
	if ( ! locale || locale === config( 'i18n_default_locale_slug' ) ) {
		return {};
	}
	return getLanguageFile( locale );
}
