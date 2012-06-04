var http = require('http'),
	cv = require('opencv'),
	face_cascade = new cv.CascadeClassifier( '../data/haarcascade_frontalface_alt.xml');


cv.readImage( fs.readFileSync( '../mona.jpg' ), function( err, im ) {
	face_cascade.detectMultiScale( im, function() {
		console.log( arguments );
	} );
} );
