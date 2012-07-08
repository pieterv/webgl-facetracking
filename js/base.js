jQuery( function( $ ) {

	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	// get the DOM element to attach to
	// - assume we've got jQuery to hand
	var $window = $( window ),
		$container = $('#Scene');

	// set the scene size
	var WIDTH = $window.width(),
		HEIGHT = $window.height();

	// set some camera attributes
	var VIEW_ANGLE = 20,
		ASPECT = WIDTH / HEIGHT,
		NEAR = 0.1,
		FAR = 10000;

	// create a WebGL renderer, camera
	// and a scene
	var renderer = new THREE.WebGLRenderer();
	var camera =
		new THREE.PerspectiveCamera(
			VIEW_ANGLE,
			ASPECT,
			NEAR,
			FAR);

	var scene = new THREE.Scene();

	var cam = {
		x: 0,
		y: 0,
		z: 700
	};

	// add the camera to the scene
	scene.add(camera);

	// the camera starts at 0,0,0
	// so pull it back
	camera.position.z = cam.z;
	camera.position.x = cam.x;
	camera.position.y = cam.y;

	// start the renderer
	renderer.setSize(WIDTH, HEIGHT);

	// attach the render-supplied DOM element
	$container.append(renderer.domElement);


	var stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	$container.append( stats.domElement );

	//
	// Objects
	//

	// create the sphere's material
	var materials = [
		new THREE.MeshLambertMaterial( { ambient: 0xbbbbbb } ),
		new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, transparent: true, opacity: 0.1 } )
	];

	var object;

	[
		{
			x: 0,
			y: 0,
			scale: 1
		},
		{
			x: 50,
			y: 10,
			scale: 0.8
		},
		{
			x: -50,
			y: -20,
			scale: 0.9
		}
	].forEach( function( obj ) {
		var object,
			size_post = 500 * obj.scale,
			size_cir = 40 * obj.scale;


		object = THREE.SceneUtils.createMultiMaterialObject( new THREE.CylinderGeometry( 5, 5, size_post, 15, 5 ), materials );
		object.position.set( obj.x, obj.y, size_post / 2 );
		object.rotation.set( Math.PI / 2, 0, 0 );
		scene.add( object );


		object = THREE.SceneUtils.createMultiMaterialObject( new THREE.CylinderGeometry( size_cir, size_cir, 3, 30, 5 ), materials );
		object.position.set( obj.x, obj.y, 0 );
		object.rotation.set( Math.PI / 2, 0, 0 );
		scene.add( object );

	} );


	// object = THREE.SceneUtils.createMultiMaterialObject( new THREE.CylinderGeometry( 5, 5, 400, 10, 5 ), materials );
	// object.position.set( 0, 0, 200 );
	// object.rotation.set( Math.PI / 2, 0, 0 );
	// scene.add( object );


	// object = THREE.SceneUtils.createMultiMaterialObject( new THREE.CylinderGeometry( 20, 20, 3, 30, 5 ), materials );
	// object.position.set( 0, 0, 400 );
	// object.rotation.set( Math.PI / 2, 0, 0 );
	// scene.add( object );


	//
	// Lights
	//

	// create a point light
	var pointLight = new THREE.PointLight(0xFFFFFF);

	// set its position
	pointLight.position.x = 100;
	pointLight.position.y = 250;
	pointLight.position.z = 600;

	// add to the scene
	scene.add(pointLight);


	// object = new THREE.AxisHelper();
	// object.position.set( 0, 0, 0 );
	// object.scale.x = object.scale.y = object.scale.z = 0.5;
	// scene.add( object );

	var clicked = false, mouse_position = 0, rotate = 0;

	$container.bind( 'mousemove', function( e ) {
		var center = ( WIDTH / 2 );
		mouse_position = ( e.pageX - center ) / center;
	} );

	$container.bind( {
		'mousedown': function( e ) {
			clicked = true;
		},
		'mouseup': function( e ) {
			clicked = false;
		}
	} );

	//
	// FACEy
	//

	var face = {};

	face.video = document.createElement('video');
	face.backCanvas = document.createElement('canvas');

	// Elements on the page.
	var hasFace = false;

	function onStream( stream ) {
		face.video.addEventListener('canplay', function() {
			face.video.removeEventListener('canplay');
			setTimeout(function() {

				face.video.play();

				face.backCanvas.width =  face.video.videoWidth / 3;
				face.backCanvas.height = face.video.videoHeight / 3;
				face.backContext =       face.backCanvas.getContext('2d');

				$( face.backCanvas ).css( { 'position': 'absolute', 'bottom': 0, 'right': 0, 'border': '1px solid red' } ).appendTo( 'body' );

				hasFace = true;

			}, 500);
		}, true);
		
		var domURL = window.URL || window.webkitURL;
		face.video.src = domURL ? domURL.createObjectURL(stream) : stream;
	}

	function onError( err ) {
		console.log( 'Unable to get video stream!', err );
	}

	// Setup the video stream.
	navigator.getUserMedia_ = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	
	try {
		navigator.getUserMedia_({
			video: true,
			audio: false
		}, onStream, onError);
	} catch (e) {
		try {
			navigator.getUserMedia_('video', onStream, onError);
		} catch (e) {
			onError(e);
		}
	}

	face.video.loop = face.video.muted = true;
	face.video.load();

	//


	// draw!
	animate();

	function animate() {

		requestAnimationFrame( animate );

		render();
		stats.update();

	}

	function render() {

		if ( hasFace ) {
			var comp = [];
			face.backContext.drawImage(face.video, 0, 0, face.backCanvas.width, face.backCanvas.height);

			// https://github.com/neave/face-detection
			comp = ccv.detect_objects( face.ccv = face.ccv || {
				canvas: face.backCanvas,
				cascade: cascade,
				interval: 4,
				min_neighbors: 1
			} );

			if ( comp.length ) {
				var pos = comp[ 0 ],
					ratio_x = ( ( ( pos.width / 2 ) + pos.x ) / face.backCanvas.width ) - 0.5,
					ratio_y = ( ( ( pos.height / 2 ) + pos.y ) / face.backCanvas.height ) - 0.5,
					ratio_z = ( ( ( pos.width / face.backCanvas.width ) + ( pos.height / face.backCanvas.height ) ) / 2 ) - 0.5;

				camera.position.x = cam.x + ( ratio_x * -50 );
				camera.position.y = cam.y + ( ratio_y * -50 );
				camera.position.z = cam.z + ( ratio_z * -400 );

			}
		}


		// if ( clicked ) rotate += ( mouse_position * -1 ) * 0.07;

		// camera.position.x = Math.cos( rotate ) * 500;
		// camera.position.z = Math.sin( rotate ) * 500;

		camera.lookAt( scene.position );

		renderer.render( scene, camera );

	}

} );
