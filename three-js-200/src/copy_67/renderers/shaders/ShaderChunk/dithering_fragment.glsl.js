export default /* glsl */`
#ifdef DITHERING

	gl_FragColor.rgb = dithering( gl_FragColor.rgb );

#endif
`;

export const unique_id_24646 = 24646;