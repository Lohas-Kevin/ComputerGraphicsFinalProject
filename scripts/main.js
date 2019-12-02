
class Spaceship {
    constructor(object, name, type, sceneRef){
        this.object = object;
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
            this.sceneRef.remove(this.object);
        }
    }
};

var camera, scene, renderer, manager;
var spaceshipList = [];
var player = new THREE.Object3D();

init();
animate();

function init(){
    container = document.createElement( 'div' );
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 120;

    scene = new THREE.Scene();

    var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
    scene.add(ambientLight);

    var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
	camera.add( pointLight );
    scene.add(camera);

    var obj = LoadModel('models/player_spaceship.obj', 'models/player_spaceship.mtl', "Test");
    scene.add(obj);
    

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

function LoadModel(ObjURL,MtlURL,name){
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



