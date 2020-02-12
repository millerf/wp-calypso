/**
 * External dependencies
 */
import '@automattic/calypso-polyfills';
import { I18nProvider } from '@automattic/react-i18n';
import { getLanguageFile } from '../../lib/i18n-utils/switch-locale';
import React, { useState, FunctionComponent } from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import config from '../../config';

/**
 * Internal dependencies
 */
import { Gutenboard } from './gutenboard';
import { setupWpDataDebug } from './devtools';
import accessibleFocus from 'lib/accessible-focus';
/**
 * Style dependencies
 */
import 'assets/stylesheets/gutenboarding.scss';
import 'components/environment-badge/style.scss';

window.AppBoot = () => {
	if ( ! config.isEnabled( 'gutenboarding' ) ) {
		window.location.href = '/';
	} else {
		setupWpDataDebug();

		// Add accessible-focus listener.
		accessibleFocus();

		ReactDom.render(
			<CalypsoI18n>
				<BrowserRouter basename="gutenboarding">
					<Gutenboard />
				</BrowserRouter>
			</CalypsoI18n>,
			document.getElementById( 'wpcom' )
		);
	}
};

const CalypsoI18n: FunctionComponent = ( { children } ) => {
	const [ locale, setLocale ] = useState< string >( config( 'i18n_default_locale_slug' ) );

	// TODO: Hack for demonstration
	( window as any ).changeLocale = setLocale;

	return (
		<I18nProvider locale={ locale } onLocaleChange={ getLanguageFile }>
			{ children }
		</I18nProvider>
	);
};
