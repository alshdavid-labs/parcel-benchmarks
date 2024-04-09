/**
 * @author mrdoob / http://mrdoob.com/
 */

var _context;

var AudioContext = {

	getContext: function () {

		if ( _context === undefined ) {

			_context = new ( window.AudioContext || window.webkitAudioContext )();

		}

		return _context;

	},

	setContext: function ( value ) {

		_context = value;

	}

};

export { AudioContext };

export const unique_id_18 = 18;