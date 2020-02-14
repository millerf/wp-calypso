/**
 * External dependencies
 */
import '@automattic/calypso-polyfills';
import React, { FunctionComponent } from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import config from '../../config';

/**
 * Internal dependencies
 */
import { Gutenboard } from './gutenboard';
import { setupWpDataDebug } from './devtools';
import accessibleFocus from 'lib/accessible-focus';
import { path, usePath, Step, StepType } from './path';

/**
 * Style dependencies
 */
import 'assets/stylesheets/gutenboarding.scss';
import 'components/environment-badge/style.scss';

interface Props {
	step: StepType;
	lang?: string | undefined;
}

const RedirectFallback: FunctionComponent< Props > = ( { step, lang } ) => {
	const fallbackPath = usePath( step, lang );
	return <Redirect to={ fallbackPath } />;
};

window.AppBoot = () => {
	if ( ! config.isEnabled( 'gutenboarding' ) ) {
		window.location.href = '/';
	} else {
		setupWpDataDebug();

		// Add accessible-focus listener.
		accessibleFocus();

		ReactDom.render(
			<BrowserRouter basename="gutenboarding">
				<Switch>
					<Route exact path={ path }>
						<Gutenboard />
					</Route>
					<Route>
						<RedirectFallback step={ Step.IntentGathering } />
					</Route>
				</Switch>
			</BrowserRouter>,
			document.getElementById( 'wpcom' )
		);
	}
};
