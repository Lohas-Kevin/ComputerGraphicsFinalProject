
var camera, scene, renderer, manager;

init();
animate();

function init(){
    container = document.createElement( 'div' );
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 25;

    scene = new THREE.Scene();

    var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
    scene.add(ambientLight);

    var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
	camera.add( pointLight );
    scene.add(camera);

    LoadModel('models/player_spaceship.obj', 'models/player_spaceship.mtl');

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

};


function animate() {
    //this will fix the frame rate to 60fps, so we do not need fixed update
    //this function could be treated as a fixed update
    setTimeout(function(){
        requestAnimationFrame( animate );
    }, 1000 / 60)
	
	renderer.render( scene, camera );
};

function LoadModel(ObjURL,MtlURL){
    var mLoader = new THREE.MTLLoader();
    var oLoader = new THREE.OBJLoader();
    mLoader.load( MtlURL, 
        function(materials){
            materials.preload();
            oLoader.setMaterials( materials );
            oLoader.load(
                ObjURL,
                function(object){
                    scene.add(object);
                },
                function(xhr){
                    console.log((xhr.loaded/xhr.total * 100) + '%loaded');
                },
                function(error){
                    console.log('An error happened');
                }
            )
        },
        function(xhr){
            console.log((xhr.loaded/xhr.total * 100) + '%loaded');
        },
        function(error){
            console.log('An error happened');
        }
    );
};
