export default /* glsl */`
#ifdef USE_LOGDEPTHBUF

	#ifdef USE_LOGDEPTHBUF_EXT

		varying float vFragDepth;

	#else

		uniform float logDepthBufFC;

	#endif

#endif
`;

export const unique_id_17646 = 17646;