// spaceship constructor
class Spaceship {
    constructor(object, name, type, sceneRef){
        this.obj = object;
        this.name = name;
        this.type = type;
        this.sceneRef = sceneRef;
        this.health = 100;
        this.attack = 25;
        this.canShoot = 0;
        this.alive = true;
    }
// returns the name of the spaceship
    returnName(){
        return this.name;
    }
    /* function for damage; decrements the spaceship's health
          if spaceship health drops below zero, spaceship dies */
    damage(value) {
        if(this.health > 0){
            this.health -= value;
        };
        
        if(this.health <= 0){
            this.alive = false;
            this.sceneRef.remove(this.obj);
            this.sceneRef.remove(this.box.visualization);
            this.sceneRef.remove(this.box.box);
        };
    }

    moveForward(value){
        this.obj.translateZ(-value);
    }

    rotateAngle(value){
        this.obj.rotateY(value);
    }

    setBoxRef(box){
        this.box = box;
    }
};

class CollisionDetection{
// renders a collision detector in the form of a cube around mesh
    constructor(obj){
        this.visualization = new THREE.BoxHelper(obj);
        this.box = new THREE.Box3().setFromObject(obj);
        //scene.add(this.visualization);
    }

    setRef(ref){
        this.ref = ref;
    }
    // allows box to follow spaceship movement
    update(obj){
        if(obj != undefined){
            //this.visualization.update();
            this.box = this.box.setFromObject(obj);
        }

    }
}

var camera, backgroundScene, scene, renderer, manager, texture;
var spaceshipList = [];
var player;
var player2;
var visibleHeight, visibleWidth;
var clock;
var keyboard = new THREEx.KeyboardState();
var bulletList = [];
var boundingBoxList = [];

init();
animate();

function init(){
    container = document.createElement( 'div' );
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 150;
    /* initialize background texture here */

    scene = new THREE.Scene();
    const loader = new THREE.TextureLoader();
    const bgTexture = loader.load('images/spaceBackground.jpg');
    scene.background = bgTexture;
    var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
    scene.add(ambientLight);

    var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
	camera.add( pointLight );
    scene.add(camera);

    //var obj = LoadModel('models/enemy_spaceship.obj', 'models/enemy_spaceship.mtl');
    //scene.add(obj);
    player = CreateElement("Player", "Spaceship", 'models/player_spaceship.obj', 'models/player_spaceship.mtl');
    player.obj.rotateX(Math.PI / 2);
    player.obj.rotateY(Math.PI);

    player2 = CreateElement("Player2", "Spaceship", 'models/player_spaceship.obj', 'models/player_spaceship.mtl');
    player2.obj.rotateX(Math.PI/2);


    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    visibleHeight = visibleHeightAtZDepth(0,camera);
    visibleWidth = visibleWidthAtZDepth(0, camera);

    player.obj.translateZ(-visibleHeight/2 + 10);
    player2.obj.translateZ(-visibleHeight/2 + 10);

    clock = new THREE.Clock();

};

function CreateElement(name, type, ObjURL, MtlURL){
    var obj = LoadModel(ObjURL, MtlURL);
    obj.name = name;
    scene.add(obj);

    var temp = new Spaceship(obj, name, type, scene);
    var box = new CollisionDetection(temp.obj);
    temp.setBoxRef(box);
    box.setRef(temp);

    spaceshipList.push(temp);
    boundingBoxList.push(box);


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
    update();
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


function update(){
    var delta = clock.getDelta();
    var moveDistance = 35 * delta;
    var rotationAngle = Math.PI/2 * delta;

    for(var index = 0; index < bulletList.length; index+= 1){
        if(bulletList[index] === undefined){
            continue;
        }
        if(bulletList[index].alive == false){
            bulletList.splice(index,1);
            continue;
        }

        bulletList[index].position.add(bulletList[index].velocity);
        bulletList[index].box.update(bulletList[index]);

        //check the bullet collection
        if(bulletList[index].from == "Player" &&
        bulletList[index].box.box.intersectsBox(player2.box.box) == true){

            scene.remove(bulletList[index].box.visualization);
            scene.remove(bulletList[index]);
            player2.damage(10);
            bulletList.splice(index, 1);
            console.log('hit player2');
            console.log(player2.health);
        }

        if(bulletList[index].from == "Player2" &&
        bulletList[index].box.box.intersectsBox(player.box.box) == true){
            scene.remove(bulletList[index].box.visualization);
            scene.remove(bulletList[index]);
            player.damage(10);
            bulletList.splice(index, 1);
            console.log('hit player');
            console.log(player.health);
        }
    }

    for(var index = 0; index < boundingBoxList.length; index += 1){
        if(boundingBoxList[index] === undefined){
            continue;
        }
        if(boundingBoxList[index].ref.alive = false){
            boundingBoxList.splice(index, 1);
            continue;
        }
        boundingBoxList[index].update(boundingBoxList[index].ref.obj);
    }

    if(keyboard.pressed('W')){
        player.moveForward(-moveDistance);
    };
    if(keyboard.pressed('S')){
        player.moveForward(moveDistance);
    };
    if(keyboard.pressed('A')){
        player.rotateAngle(rotationAngle);
    };
    if(keyboard.pressed('D')){
        player.rotateAngle(-rotationAngle)
    }

    if(keyboard.pressed('space') && player.canShoot <= 0){
        shoot(player.obj.position,player.obj.rotation, 0xffff00, "Player");
        player.canShoot = 10;
    }

    if(keyboard.pressed('L') && player2.canShoot <= 0){
        shoot(player2.obj.position, player2.obj.rotation, 0xff0000, "Player2");
        player2.canShoot = 10;
    }

    //console.log(player.obj.rotation);

    if(keyboard.pressed('up')){
        player2.moveForward(-moveDistance);
    };
    if(keyboard.pressed('down')){
        player2.moveForward(moveDistance);
    };
    if(keyboard.pressed('left')){
        player2.rotateAngle(rotationAngle);
    };
    if(keyboard.pressed('right')){
        player2.rotateAngle(-rotationAngle)
    }

    if(player.canShoot > 0){
        player.canShoot -= 1;
    }
    if(player2.canShoot > 0){
        player2.canShoot -= 1;
    }

};

function shoot(pos,rot, colorNum, from){
    var geometry = new THREE.SphereGeometry(0.5, 8, 8);
    var material = new THREE.MeshBasicMaterial({color: colorNum});
    var bullet = new THREE.Mesh(geometry, material);

    var box = new CollisionDetection(bullet);
    bullet.box = box;
    bullet.from = from;
    box.setRef(bullet);

    if(rot.x <= 0){
        bullet.position.set(pos.x + 10*Math.sin(rot.y), pos.y + 10*Math.cos(rot.y), pos.z);
        bullet.velocity = new THREE.Vector3(
            Math.sin(rot.y),
            Math.cos(rot.y),
            0
        );
    }else{
        bullet.position.set(pos.x + 10*Math.sin(rot.y), pos.y - 10*Math.cos(rot.y), pos.z);
        bullet.velocity = new THREE.Vector3(
            Math.sin(rot.y),
            -Math.cos(rot.y),
            0
        );
    }



    bullet.alive = true;
    setTimeout(
        function(){
            if(bullet != undefined){
                bullet.alive = false;
                scene.remove(bullet);
                scene.remove(bullet.box.visualization);
            }

        },
        1500
    );

    scene.add(bullet);
    bulletList.push(bullet);
}
