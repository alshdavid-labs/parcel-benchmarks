export default /* glsl */`
#ifdef ALPHATEST

	if ( diffuseColor.a < ALPHATEST ) discard;

#endif
`;

export const unique_id_54221 = 54221;