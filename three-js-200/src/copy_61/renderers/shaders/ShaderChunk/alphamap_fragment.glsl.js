export default /* glsl */`
#ifdef USE_ALPHAMAP

	diffuseColor.a *= texture2D( alphaMap, vUv ).g;

#endif
`;

export const unique_id_22399 = 22399;