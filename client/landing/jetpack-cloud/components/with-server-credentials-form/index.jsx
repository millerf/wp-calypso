/**
 * External dependendies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { find, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { deleteCredentials, updateCredentials } from 'state/jetpack/credentials/actions';
import { getSiteSlug } from 'state/sites/selectors';
import getJetpackCredentialsUpdateStatus from 'state/selectors/get-jetpack-credentials-update-status';
import getRewindState from 'state/selectors/get-rewind-state';
import QueryRewindState from 'components/data/query-rewind-state';

// This is an experiment. I'm 100% sure this is not the right place to put a HOC.
// I don't like its name either. The idea is to put all the logic here so we can
// then have the UI we want without having to rewrite this.
function withServerCredentialsForm( WrappedComponent ) {
	const ServerCredentialsFormClass = class ServerCredentialsForm extends Component {
		static propTypes = {
			role: PropTypes.string.isRequired,
			siteId: PropTypes.number,
			siteUrl: PropTypes.string,
			requirePath: PropTypes.bool,
			formIsSubmitting: PropTypes.bool,
			formSubmissionStatus: PropTypes.string,
		};

		static defaultProps = {
			requirePath: false,
		};

		state = {
			form: {
				protocol: 'ssh',
				host: '',
				port: 22,
				user: '',
				pass: '',
				path: '',
				kpri: '',
			},
			formErrors: {
				host: false,
				port: false,
				user: false,
				pass: false,
				path: false,
			},
			showAdvancedSettings: false,
		};

		handleFieldChange = ( { target: { name, value } } ) => {
			const changedProtocol = 'protocol' === name;
			const defaultPort = 'ftp' === value ? 21 : 22;

			const form = Object.assign(
				this.state.form,
				{ [ name ]: value },
				changedProtocol && { port: defaultPort }
			);

			this.setState( {
				form,
				formErrors: { ...this.state.formErrors, [ name ]: false },
			} );
		};

		handleSubmit = () => {
			const { requirePath, role, siteId, siteUrl } = this.props;

			const payload = {
				role,
				site_url: siteUrl,
				...this.state.form,
			};

			let userError = '';

			if ( ! payload.user ) {
				userError = translate( 'Please enter your server username.' );
			} else if ( 'root' === payload.user ) {
				userError = translate(
					"We can't accept credentials for the root user. " +
						'Please provide or create credentials for another user with access to your server.'
				);
			}

			const errors = Object.assign(
				! payload.host && { host: translate( 'Please enter a valid server address.' ) },
				! payload.port && { port: translate( 'Please enter a valid server port.' ) },
				isNaN( payload.port ) && { port: translate( 'Port number must be numeric.' ) },
				userError && { user: userError },
				! payload.pass &&
					! payload.kpri && { pass: translate( 'Please enter your server password.' ) },
				! payload.path && requirePath && { path: translate( 'Please enter a server path.' ) }
			);

			return isEmpty( errors )
				? this.props.updateCredentials( siteId, payload )
				: this.setState( { formErrors: errors } );
		};

		handleDelete = () => this.props.deleteCredentials( this.props.siteId, this.props.role );

		toggleAdvancedSettings = () =>
			this.setState( { showAdvancedSettings: ! this.state.showAdvancedSettings } );

		UNSAFE_componentWillReceiveProps( nextProps ) {
			const { rewindState, role, siteSlug } = nextProps;
			const credentials = find( rewindState.credentials, { role: role } );
			const nextForm = Object.assign( {}, this.state.form );

			// Populate the fields with data from state if credentials are already saved
			nextForm.protocol = credentials ? credentials.type : nextForm.protocol;
			nextForm.host = isEmpty( nextForm.host ) && credentials ? credentials.host : nextForm.host;
			nextForm.port = isEmpty( nextForm.port ) && credentials ? credentials.port : nextForm.port;
			nextForm.user = isEmpty( nextForm.user ) && credentials ? credentials.user : nextForm.user;
			nextForm.path = isEmpty( nextForm.path ) && credentials ? credentials.path : nextForm.path;

			// Populate the host field with the site slug if needed
			nextForm.host =
				isEmpty( nextForm.host ) && siteSlug ? siteSlug.split( '::' )[ 0 ] : nextForm.host;

			this.setState( { form: nextForm } );
		}

		render() {
			const { form, formErrors, showAdvancedSettings } = this.state;
			const {
				formIsSubmitting,
				formSubmissionStatus,
				requirePath,
				siteId,
				...otherProps
			} = this.props;
			return (
				<>
					<QueryRewindState siteId={ siteId } />
					<WrappedComponent
						form={ form }
						formErrors={ formErrors }
						formIsSubmitting={ formIsSubmitting }
						formSubmissionStatus={ formSubmissionStatus }
						requirePath={ requirePath }
						handleFieldChange={ this.handleFieldChange }
						handleSubmit={ this.handleSubmit }
						handleDelete={ this.handleDelete }
						showAdvancedSettings={ showAdvancedSettings }
						toggleAdvancedSettings={ this.toggleAdvancedSettings }
						{ ...otherProps }
					/>
				</>
			);
		}
	};

	const mapStateToProps = ( state, { siteId } ) => {
		const formSubmissionStatus = getJetpackCredentialsUpdateStatus( state, siteId );
		return {
			formSubmissionStatus,
			formIsSubmitting: 'pending' === formSubmissionStatus,
			siteSlug: getSiteSlug( state, siteId ),
			rewindState: getRewindState( state, siteId ),
		};
	};

	return connect( mapStateToProps, { deleteCredentials, updateCredentials } )(
		ServerCredentialsFormClass
	);
}

export default withServerCredentialsForm;
