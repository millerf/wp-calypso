/**
 * External dependencies
 */
import { generatePath, useRouteMatch } from 'react-router-dom';
import { getLanguageSlugs } from '../../lib/i18n-utils';
import { ValuesType } from 'utility-types';

export const Step = {
	IntentGathering: 'about',
	DesignSelection: 'design',
	PageSelection: 'pages',
	Signup: 'signup',
	CreateSite: 'create-site',
} as const;

export const langs: string[] = getLanguageSlugs();
export const steps = Object.keys( Step ).map( key => Step[ key as keyof typeof Step ] );

export const path = `/:step(${ steps.join( '|' ) })/:lang(${ langs.join( '|' ) })?`;

export type StepType = ValuesType< typeof Step >;

export function usePath( step: StepType | undefined, lang?: string ) {
	const match = useRouteMatch< { lang?: string } >( path );
	lang = lang || match?.params.lang;

	// When step is undefined (coming from <Link>).
	if ( ! step ) {
		return '/' + ( lang && langs.includes( lang ) ? lang : '' );
	}

	return generatePath( path, {
		step,
		...( lang && langs.includes( lang ) && { lang } ),
	} );
}
