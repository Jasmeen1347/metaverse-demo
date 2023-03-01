import Movements from "./movement.js";
import polygon from "./Web3.js";
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { Water } from './jsm/objects/Water.js';
import { Sky } from './jsm/objects/Sky.js';

import abi from './abi/abi.json' assert {type: "json"}

let controls, water, sun, mesh;

// 0x0eBD5C3F6B73735509e8a93aAc3E500FDf008937 address of contract
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xF1EF1E)
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
camera.position.set( 30, 30, 100 );

// const renderer = new THREE.WebGLRenderer();
// renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild(renderer.domElement);

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild( renderer.domElement );

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
light.add( directionalLight );
scene.add(light)

const surfaceTexture = new THREE.TextureLoader().load( 'textures/terrain/grasslight-big.jpg')
const geometry_area = new THREE.BoxGeometry( 100, 0.5, 100 );
const material_area = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
material_area.map = surfaceTexture;
const area = new THREE.Mesh( geometry_area, material_area );
scene.add(area);

// const geometry = new THREE.BoxGeometry( 30, 30, 30 );
// const material = new THREE.MeshStandardMaterial( { roughness: 0 } );

// mesh = new THREE.Mesh( geometry, material );
// scene.add( mesh );


// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add(cube);

const sky = new Sky();
// function initEnviroment() {
    sun = new THREE.Vector3();

    // Water

    const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load( 'textures/waternormals.jpg', function ( texture ) {

                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

            } ),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );

    water.rotation.x = - Math.PI / 2;

    scene.add(water);
    
    // Skybox

    
    sky.scale.setScalar( 10000 );
    scene.add( sky );

    const skyUniforms = sky.material.uniforms;

    skyUniforms[ 'turbidity' ].value = 10;
    skyUniforms[ 'rayleigh' ].value = 2;
    skyUniforms[ 'mieCoefficient' ].value = 0.005;
    skyUniforms[ 'mieDirectionalG' ].value = 0.8;


// }

// initEnviroment()

// function updateSun() {
    const parameters = {
        elevation: 2,
        azimuth: 180
    };

    const pmremGenerator = new THREE.PMREMGenerator( renderer );
    let renderTarget;
    
    const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
    const theta = THREE.MathUtils.degToRad( parameters.azimuth );

    sun.setFromSphericalCoords( 1, phi, theta );

    sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
    water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

    if ( renderTarget !== undefined ) renderTarget.dispose();

    renderTarget = pmremGenerator.fromScene( sky );

    scene.environment = renderTarget.texture;

// }

// updateSun();

controls = new OrbitControls( camera, renderer.domElement );
controls.maxPolarAngle = Math.PI * 0.495;
controls.target.set( 0, 10, 0 );
controls.minDistance = 40.0;
controls.maxDistance = 200.0;
controls.update();



function animate() {
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    requestAnimationFrame(animate);
    render();
    renderer.render(scene, camera);
    
    // if (Movements.isPressed(37)) { // left
    //     camera.position.x -= 0.5
    // }

    // if (Movements.isPressed(38)) { // up
    //     // camera.position.z -= 0.05
    //     camera.position.y += 0.5
    // }

    // if (Movements.isPressed(39)) { // right
    //     camera.position.x += 0.5
    // }

    // if (Movements.isPressed(40)) { // down
    //     // camera.position.z += 0.05
    //     camera.position.y -= 0.5
    // }

    // camera.lookAt(area.position)
}
animate();

// camera.position.z = 5;
// camera.position.set(0, 15, 60);
// camera.rotate.set(0, 15, 60);


function render() {

    const time = performance.now() * 0.001;

    // mesh.position.y = Math.sin( time ) * 20 + 5;
    // mesh.rotation.x = time * 0.5;
    // mesh.rotation.z = time * 0.51;

    water.material.uniforms['time'].value += 1.0 / 60.0;
    window.addEventListener( 'resize', onWindowResize );

    renderer.render( scene, camera );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

renderer.render(scene, camera)

const button = document.querySelector("#mint");
button.addEventListener("click", mintNFT);

async function mintNFT() {
    let nft_name = document.querySelector("#nft_name").value;
    let nft_width = document.querySelector("#nft_width").value;
    let nft_height = document.querySelector("#nft_height").value;
    let nft_depth = document.querySelector("#nft_depth").value;
    let nft_x = document.querySelector("#nft_x").value;
    let nft_y = document.querySelector("#nft_y").value;
    let nft_z = document.querySelector("#nft_z").value;
  
    if (typeof window.ethereum == "undefined") {
      rej("You should install Metamask");
    }
  
    let web3 = new Web3(window.ethereum);
    let contract = new web3.eth.Contract(
      abi,
      "0x0eBD5C3F6B73735509e8a93aAc3E500FDf008937"
    );
        console.log(nft_name, nft_width, nft_height, nft_depth, nft_x, nft_y, nft_z);
    web3.eth.requestAccounts().then((accounts) => {
      contract.methods
        .mint(nft_name, nft_width, nft_height, nft_depth, nft_x, nft_y, nft_z)
        .send({
          from: accounts[0],
          value: "10",
        })
        .then((data) => {
          console.log("NFT is minted");
        });
    });
  }


polygon.then((result) => {
    result.nft.forEach((object, index) => {
      if (index <= result.supply) {
        const geometry_cube = new THREE.BoxGeometry(object.w, object.h, object.d);
        const material_cube = new THREE.MeshPhongMaterial({ color: 0x1be3ef });
        const nft = new THREE.Mesh(geometry_cube, material_cube);
  
        nft.position.set(object.x, object.y, object.z);
        scene.add(nft);
      }
    });
  });