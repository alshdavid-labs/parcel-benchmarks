import { _Math } from '../../math/Math.js';
import { Vector3 } from '../../math/Vector3.js';
import { Matrix4 } from '../../math/Matrix4.js';

/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Extensible curve object
 *
 * Some common of curve methods:
 * .getPoint( t, optionalTarget ), .getTangent( t )
 * .getPointAt( u, optionalTarget ), .getTangentAt( u )
 * .getPoints(), .getSpacedPoints()
 * .getLength()
 * .updateArcLengths()
 *
 * This following curves inherit from THREE.Curve:
 *
 * -- 2D curves --
 * THREE.ArcCurve
 * THREE.CubicBezierCurve
 * THREE.EllipseCurve
 * THREE.LineCurve
 * THREE.QuadraticBezierCurve
 * THREE.SplineCurve
 *
 * -- 3D curves --
 * THREE.CatmullRomCurve3
 * THREE.CubicBezierCurve3
 * THREE.LineCurve3
 * THREE.QuadraticBezierCurve3
 *
 * A series of curves can be represented as a THREE.CurvePath.
 *
 **/

/**************************************************************
 *	Abstract Curve base class
 **************************************************************/

function Curve() {

	this.type = 'Curve';

	this.arcLengthDivisions = 200;

}

Object.assign( Curve.prototype, {

	// Virtual base class method to overwrite and implement in subclasses
	//	- t [0 .. 1]

	getPoint: function ( /* t, optionalTarget */ ) {

		console.warn( 'THREE.Curve: .getPoint() not implemented.' );
		return null;

	},

	// Get point at relative position in curve according to arc length
	// - u [0 .. 1]

	getPointAt: function ( u, optionalTarget ) {

		var t = this.getUtoTmapping( u );
		return this.getPoint( t, optionalTarget );

	},

	// Get sequence of points using getPoint( t )

	getPoints: function ( divisions ) {

		if ( divisions === undefined ) divisions = 5;

		var points = [];

		for ( var d = 0; d <= divisions; d ++ ) {

			points.push( this.getPoint( d / divisions ) );

		}

		return points;

	},

	// Get sequence of points using getPointAt( u )

	getSpacedPoints: function ( divisions ) {

		if ( divisions === undefined ) divisions = 5;

		var points = [];

		for ( var d = 0; d <= divisions; d ++ ) {

			points.push( this.getPointAt( d / divisions ) );

		}

		return points;

	},

	// Get total curve arc length

	getLength: function () {

		var lengths = this.getLengths();
		return lengths[ lengths.length - 1 ];

	},

	// Get list of cumulative segment lengths

	getLengths: function ( divisions ) {

		if ( divisions === undefined ) divisions = this.arcLengthDivisions;

		if ( this.cacheArcLengths &&
			( this.cacheArcLengths.length === divisions + 1 ) &&
			! this.needsUpdate ) {

			return this.cacheArcLengths;

		}

		this.needsUpdate = false;

		var cache = [];
		var current, last = this.getPoint( 0 );
		var p, sum = 0;

		cache.push( 0 );

		for ( p = 1; p <= divisions; p ++ ) {

			current = this.getPoint( p / divisions );
			sum += current.distanceTo( last );
			cache.push( sum );
			last = current;

		}

		this.cacheArcLengths = cache;

		return cache; // { sums: cache, sum: sum }; Sum is in the last element.

	},

	updateArcLengths: function () {

		this.needsUpdate = true;
		this.getLengths();

	},

	// Given u ( 0 .. 1 ), get a t to find p. This gives you points which are equidistant

	getUtoTmapping: function ( u, distance ) {

		var arcLengths = this.getLengths();

		var i = 0, il = arcLengths.length;

		var targetArcLength; // The targeted u distance value to get

		if ( distance ) {

			targetArcLength = distance;

		} else {

			targetArcLength = u * arcLengths[ il - 1 ];

		}

		// binary search for the index with largest value smaller than target u distance

		var low = 0, high = il - 1, comparison;

		while ( low <= high ) {

			i = Math.floor( low + ( high - low ) / 2 ); // less likely to overflow, though probably not issue here, JS doesn't really have integers, all numbers are floats

			comparison = arcLengths[ i ] - targetArcLength;

			if ( comparison < 0 ) {

				low = i + 1;

			} else if ( comparison > 0 ) {

				high = i - 1;

			} else {

				high = i;
				break;

				// DONE

			}

		}

		i = high;

		if ( arcLengths[ i ] === targetArcLength ) {

			return i / ( il - 1 );

		}

		// we could get finer grain at lengths, or use simple interpolation between two points

		var lengthBefore = arcLengths[ i ];
		var lengthAfter = arcLengths[ i + 1 ];

		var segmentLength = lengthAfter - lengthBefore;

		// determine where we are between the 'before' and 'after' points

		var segmentFraction = ( targetArcLength - lengthBefore ) / segmentLength;

		// add that fractional amount to t

		var t = ( i + segmentFraction ) / ( il - 1 );

		return t;

	},

	// Returns a unit vector tangent at t
	// In case any sub curve does not implement its tangent derivation,
	// 2 points a small delta apart will be used to find its gradient
	// which seems to give a reasonable approximation

	getTangent: function ( t ) {

		var delta = 0.0001;
		var t1 = t - delta;
		var t2 = t + delta;

		// Capping in case of danger

		if ( t1 < 0 ) t1 = 0;
		if ( t2 > 1 ) t2 = 1;

		var pt1 = this.getPoint( t1 );
		var pt2 = this.getPoint( t2 );

		var vec = pt2.clone().sub( pt1 );
		return vec.normalize();

	},

	getTangentAt: function ( u ) {

		var t = this.getUtoTmapping( u );
		return this.getTangent( t );

	},

	computeFrenetFrames: function ( segments, closed ) {

		// see http://www.cs.indiana.edu/pub/techreports/TR425.pdf

		var normal = new Vector3();

		var tangents = [];
		var normals = [];
		var binormals = [];

		var vec = new Vector3();
		var mat = new Matrix4();

		var i, u, theta;

		// compute the tangent vectors for each segment on the curve

		for ( i = 0; i <= segments; i ++ ) {

			u = i / segments;

			tangents[ i ] = this.getTangentAt( u );
			tangents[ i ].normalize();

		}

		// select an initial normal vector perpendicular to the first tangent vector,
		// and in the direction of the minimum tangent xyz component

		normals[ 0 ] = new Vector3();
		binormals[ 0 ] = new Vector3();
		var min = Number.MAX_VALUE;
		var tx = Math.abs( tangents[ 0 ].x );
		var ty = Math.abs( tangents[ 0 ].y );
		var tz = Math.abs( tangents[ 0 ].z );

		if ( tx <= min ) {

			min = tx;
			normal.set( 1, 0, 0 );

		}

		if ( ty <= min ) {

			min = ty;
			normal.set( 0, 1, 0 );

		}

		if ( tz <= min ) {

			normal.set( 0, 0, 1 );

		}

		vec.crossVectors( tangents[ 0 ], normal ).normalize();

		normals[ 0 ].crossVectors( tangents[ 0 ], vec );
		binormals[ 0 ].crossVectors( tangents[ 0 ], normals[ 0 ] );


		// compute the slowly-varying normal and binormal vectors for each segment on the curve

		for ( i = 1; i <= segments; i ++ ) {

			normals[ i ] = normals[ i - 1 ].clone();

			binormals[ i ] = binormals[ i - 1 ].clone();

			vec.crossVectors( tangents[ i - 1 ], tangents[ i ] );

			if ( vec.length() > Number.EPSILON ) {

				vec.normalize();

				theta = Math.acos( _Math.clamp( tangents[ i - 1 ].dot( tangents[ i ] ), - 1, 1 ) ); // clamp for floating pt errors

				normals[ i ].applyMatrix4( mat.makeRotationAxis( vec, theta ) );

			}

			binormals[ i ].crossVectors( tangents[ i ], normals[ i ] );

		}

		// if the curve is closed, postprocess the vectors so the first and last normal vectors are the same

		if ( closed === true ) {

			theta = Math.acos( _Math.clamp( normals[ 0 ].dot( normals[ segments ] ), - 1, 1 ) );
			theta /= segments;

			if ( tangents[ 0 ].dot( vec.crossVectors( normals[ 0 ], normals[ segments ] ) ) > 0 ) {

				theta = - theta;

			}

			for ( i = 1; i <= segments; i ++ ) {

				// twist a little...
				normals[ i ].applyMatrix4( mat.makeRotationAxis( tangents[ i ], theta * i ) );
				binormals[ i ].crossVectors( tangents[ i ], normals[ i ] );

			}

		}

		return {
			tangents: tangents,
			normals: normals,
			binormals: binormals
		};

	},

	clone: function () {

		return new this.constructor().copy( this );

	},

	copy: function ( source ) {

		this.arcLengthDivisions = source.arcLengthDivisions;

		return this;

	},

	toJSON: function () {

		var data = {
			metadata: {
				version: 4.5,
				type: 'Curve',
				generator: 'Curve.toJSON'
			}
		};

		data.arcLengthDivisions = this.arcLengthDivisions;
		data.type = this.type;

		return data;

	},

	fromJSON: function ( json ) {

		this.arcLengthDivisions = json.arcLengthDivisions;

		return this;

	}

} );


export { Curve };

export const unique_id_7817 = 7817;