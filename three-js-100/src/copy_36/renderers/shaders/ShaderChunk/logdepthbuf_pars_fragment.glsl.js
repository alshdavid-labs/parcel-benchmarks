export default /* glsl */`
#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )

	uniform float logDepthBufFC;
	varying float vFragDepth;

#endif
`;

export const unique_id_13205 = 13205;