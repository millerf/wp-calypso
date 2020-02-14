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

export function makePath( step: StepType | undefined, lang?: string ) {
	return generatePath( path, {
		step,
		...( lang && langs.includes( lang ) && { lang } ),
	} );
}

export function usePath( step: StepType | undefined, lang?: string ) {
	const match = useRouteMatch< { lang?: string } >( path );
	return makePath( step, lang || match?.params.lang );
}
