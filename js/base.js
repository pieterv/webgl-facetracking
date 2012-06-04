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
	var VIEW_ANGLE = 45,
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

	// add the camera to the scene
	scene.add(camera);

	// the camera starts at 0,0,0
	// so pull it back
	camera.position.z = 700;
	camera.position.x = 300;
	camera.position.y = 300;

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
	object = THREE.SceneUtils.createMultiMaterialObject( new THREE.CubeGeometry( 100, 100, 100, 4, 4, 4 ), materials );
	object.position.set( 100, 50, 100 );
	scene.add( object );


	//
	// Lights
	//

	// create a point light
	var pointLight = new THREE.PointLight(0xFFFFFF);

	// set its position
	pointLight.position.x = 300;
	pointLight.position.y = 250;
	pointLight.position.z = 230;

	// add to the scene
	scene.add(pointLight);


	object = new THREE.AxisHelper();
	object.position.set( 0, 0, 0 );
	object.scale.x = object.scale.y = object.scale.z = 0.5;
	scene.add( object );

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


	// draw!
	animate();

	function animate() {

		requestAnimationFrame( animate );

		render();
		stats.update();

	}

	function render() {

		if ( clicked ) rotate += ( mouse_position * -1 ) * 0.07;

		// var timer = Date.now() * 0.0002;

		camera.position.x = Math.cos( rotate ) * 500;
		camera.position.z = Math.sin( rotate ) * 500;

		camera.lookAt( scene.position );

		renderer.render( scene, camera );

	}

} );
