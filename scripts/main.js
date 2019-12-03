
class Spaceship {
    constructor(object, name, type, sceneRef){
        this.obj = object;
        this.name = name;
        this.type = type;
        this.sceneRef = sceneRef;
        this.health = 100;
        this.attack = 25;
    }

    returnName(){
        return this.name;
    }

    damage(value) {
        this.health -= value;
        if(this.health <= 0){
            this.sceneRef.remove(this.obj);
        }
    }
};

var camera, scene, renderer, manager;
var spaceshipList = [];
var player;
var visibleHeight, visibleWidth;

init();
animate();

function init(){
    container = document.createElement( 'div' );
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 150;

    scene = new THREE.Scene();

    var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
    scene.add(ambientLight);

    var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
	camera.add( pointLight );
    scene.add(camera);

    //var obj = LoadModel('models/player_spaceship.obj', 'models/player_spaceship.mtl');
    //scene.add(obj);
    player = CreateElement("Player", "Spaceship", 'models/player_spaceship.obj', 'models/player_spaceship.mtl');
    player.obj.rotateX(Math.PI / 2);
    player.obj.rotateY(Math.PI);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    visibleHeight = visibleHeightAtZDepth(0,camera);
    visibleWidth = visibleWidthAtZDepth(0, camera);

};

function CreateElement(name, type, ObjURL, MtlURL){
    var obj = LoadModel(ObjURL, MtlURL);
    obj.name = name;
    scene.add(obj);
    var temp = new Spaceship(obj, name, type, scene);
    spaceshipList.push(temp);
    return temp;
}


function animate() {
    //this will fix the frame rate to 60fps, so we do not need fixed update
    //this function could be treated as a fixed update
    setTimeout(function(){
        requestAnimationFrame( animate );
    }, 1000 / 60)
    
    //player.obj.translateX(0.1);
    //console.log(player.obj.position);
    renderer.render( scene, camera );
    
};

function LoadModel(ObjURL,MtlURL){
    var mLoader = new THREE.MTLLoader();
    var oLoader = new THREE.OBJLoader();
    var result = new THREE.Object3D();
    mLoader.load( MtlURL, 
        function(materials){
            materials.preload();
            oLoader.setMaterials( materials );
            oLoader.load(
                ObjURL,
                function(object){
                    result.add(object);
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
    return result;
};


//code from 
//https://discourse.threejs.org/t/functions-to-calculate-the-visible-width-height-at-a-given-z-depth-from-a-perspective-camera/269
//this is used to calculate the height and width.
function visibleHeightAtZDepth( depth, camera ){
    // compensate for cameras not positioned at z=0
    var cameraOffset = camera.position.z;
    if ( depth < cameraOffset ) depth -= cameraOffset;
    else depth += cameraOffset;
  
    // vertical fov in radians
    var vFOV = camera.fov * Math.PI / 180; 
  
    // Math.abs to ensure the result is always positive
    return 2 * Math.tan( vFOV / 2 ) * Math.abs( depth );
  };
  
function visibleWidthAtZDepth( depth, camera ){
    var height = visibleHeightAtZDepth( depth, camera );
    return height * camera.aspect;
  };



