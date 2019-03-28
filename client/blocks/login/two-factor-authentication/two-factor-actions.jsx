/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { localize } from 'i18n-calypso';
import { isTwoFactorAuthTypeSupported } from 'state/login/selectors';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import { sendSmsCode } from 'state/login/actions';
import { login } from 'lib/paths';

class TwoFactorActions extends Component {
	static propTypes = {
		isSecurityKeySupported: PropTypes.bool.isRequired,
		isAuthenticatorSupported: PropTypes.bool.isRequired,
		isSmsSupported: PropTypes.bool.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		sendSmsCode: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string.isRequired,
	};

	sendSmsCode = event => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_two_factor_switch_to_sms_link_click' );

		page( login( { isNative: true, twoFactorAuthType: 'sms' } ) );

		this.props.sendSmsCode();
	};

	recordAuthenticatorLinkClick = event => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_two_factor_switch_to_authenticator_link_click' );

		page( login( { isNative: true, twoFactorAuthType: 'authenticator' } ) );
	};

	recordSecurityKeyLinkClick = event => {
		event.preventDefault();
		// tracks
		page( login( { isNative: true, twoFactorAuthType: 'security-key' } ) );
	};

	render() {
		const {
			isSecurityKeySupported,
			isAuthenticatorSupported,
			isSmsSupported,
			translate,
			twoFactorAuthType,
		} = this.props;

		const isSmsAvailable = isSmsSupported && twoFactorAuthType !== 'sms';
		const isAuthenticatorAvailable =
			isAuthenticatorSupported && twoFactorAuthType !== 'authenticator';
		const isSecurityKeyAvailable = isSecurityKeySupported && twoFactorAuthType !== 'security-key';

		if ( ! isSmsAvailable && ! isAuthenticatorAvailable && ! isSecurityKeyAvailable ) {
			return null;
		}

		return (
			<Card className="two-factor-authentication__form-action is-compact">
				<p>{ translate( 'Or continue to your account using:' ) }</p>
				{ isSecurityKeyAvailable && (
					<p>
						<button data-e2e-link="2fa-webauthn-link" onClick={ this.recordSecurityKeyLinkClick }>
							{ translate( 'Your security key' ) }
						</button>
					</p>
				) }

				{ isSmsAvailable && (
					<p>
						<button data-e2e-link="2fa-sms-link" onClick={ this.sendSmsCode }>
							{ translate( 'Code via text message' ) }
						</button>
					</p>
				) }

				{ isAuthenticatorAvailable && (
					<p>
						<button data-e2e-link="2fa-otp-link" onClick={ this.recordAuthenticatorLinkClick }>
							{ translate( 'Your authenticator app' ) }
						</button>
					</p>
				) }
			</Card>
		);
	}
}

export default connect(
	state => ( {
		isAuthenticatorSupported: isTwoFactorAuthTypeSupported( state, 'authenticator' ),
		isSmsSupported: isTwoFactorAuthTypeSupported( state, 'sms' ),
		isSecurityKeySupported: isTwoFactorAuthTypeSupported( state, 'security-key' ),
	} ),
	{
		recordTracksEvent,
		sendSmsCode,
	}
)( localize( TwoFactorActions ) );
