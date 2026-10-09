export const RESULT_COPY_REF = 'result_copy';
export const RESULT_COPY_URL = `https://mbti.buddybird.xyz/?ref=${RESULT_COPY_REF}`;

export function isResultCopyReferral(search: string): boolean {
	return new URLSearchParams(search).get('ref') === RESULT_COPY_REF;
}
