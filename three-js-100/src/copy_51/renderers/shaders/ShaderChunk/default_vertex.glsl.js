export default /* glsl */`
void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

export const unique_id_18722 = 18722;