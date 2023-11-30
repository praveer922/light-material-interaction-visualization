import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GUI} from "dat.gui";
import {GetRandomSample, SampleConductor, SampleDiffuse, SampleDielectric} from "./sample.js";

let camera, scene, renderer, arrow;

let arrowPosition;

let wis = [];
let wiArrows = [];

let isSamplingActive = false;
let currentSampleCount = 0;

const guiControls = {
    arrowRadius: 20,      // Initial radius of the arrow's position
    arrowAzimuth: 183,      // Initial azimuthal angle (in degrees)
    arrowPolar: 45,        // Initial polar angle (in degrees)
    sampleCount: 10, sampleMethod: 'Conductor', sampleRoughness: 0.5,
};

init();
animate();

function init() {

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    const sceneElement = document.querySelector('.scene');
    sceneElement.appendChild(renderer.domElement);

    const gui = new GUI();
    gui.add({startSampling}, "startSampling").name("Start Sampling");
    gui.add({stopSampling}, "stopSampling").name("Stop Sampling");
    gui.add(guiControls, 'arrowRadius', 5, 50).onChange(updateArrowPosition);
    gui.add(guiControls, 'arrowAzimuth', 0, 360).onChange(updateArrowPosition);
    gui.add(guiControls, 'arrowPolar', 0, 90).onChange(updateArrowPosition);

    gui.add(guiControls, 'sampleCount', 1, 1000).step(1);
    gui.add(guiControls, 'sampleMethod', ['Diffuse', 'Conductor', 'Dielectric']);

    const guiElement = document.querySelector('.control-panel');
    guiElement.appendChild(gui.domElement);

    // camera

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.set(15, 20, 30);
    scene.add(camera);

    // controls

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;

    // ambient light
    scene.add(new THREE.AmbientLight(0x666666));

    // point light
    const light = new THREE.PointLight(0xffffff, 3, 0, 0);
    camera.add(light);

    // helper
    scene.add(new THREE.AxesHelper(20));
    scene.add(new THREE.GridHelper(50, 10, 0x888888, 0x444444))

    const dir = new THREE.Vector3(1, 0, 0); // Direction of the arrow
    const theta = THREE.MathUtils.degToRad(guiControls.arrowAzimuth);
    const phi = THREE.MathUtils.degToRad(90 - guiControls.arrowPolar);
    arrowPosition = new THREE.Vector3(guiControls.arrowRadius * Math.sin(phi) * Math.cos(theta), guiControls.arrowRadius * Math.sin(phi) * Math.sin(theta), guiControls.arrowRadius * Math.cos(phi)); // standard cartesian coordinate

    console.log('standard coordinate arrowPosition: ', arrowPosition);
    // Init incident ray arrow
    const length = 5;
    const hex = 0xff0000; // Color of the arrow
    let arrowPositionClone = transferToRightHandCoordinate(arrowPosition); // right hand coordinate

    console.log('right hand coordinate arrowPosition', arrowPositionClone);
    arrow = new THREE.ArrowHelper(dir, arrowPositionClone, length, hex);
    updateArrowPosition();
    scene.add(arrow);


}

function animate() {

    requestAnimationFrame(animate);

    if (isSamplingActive && currentSampleCount < guiControls.sampleCount) {
        performSampling();
        currentSampleCount++;

    }

    render();

}

function render() {

    renderer.render(scene, camera);

}

function updateArrowPosition() {
    const phi = THREE.MathUtils.degToRad(90 - guiControls.arrowPolar); // Convert polar angle to radians
    const theta = THREE.MathUtils.degToRad(guiControls.arrowAzimuth);

    arrow.position.x = guiControls.arrowRadius * Math.sin(phi) * Math.cos(theta);
    arrow.position.y = guiControls.arrowRadius * Math.cos(phi);
    arrow.position.z = guiControls.arrowRadius * Math.sin(phi) * Math.sin(theta);

    // Update the arrow's direction to always point to the origin
    const direction = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), arrow.position).normalize();
    arrow.setDirection(direction);

}

function transferToRightHandCoordinate(vector) {
    const vectorClone = vector.clone();
    vectorClone.y = vector.z;
    vectorClone.z = vector.y;
    return vectorClone;
}

function transferToStandardCoordinate(vector) {
    const vectorClone = vector.clone();
    vectorClone.y = vector.z;
    vectorClone.z = vector.y;
    return vectorClone;
}

function startSampling() {
    isSamplingActive = true;
    currentSampleCount = 0;
    // clean up previous sampling
    for (let i = 0; i < wiArrows.length; i++) {
        scene.remove(wiArrows[i]);
    }
    wis = [];
    performSampling();
}

function stopSampling() {
    isSamplingActive = false;
}


function performSampling() {
    const wo = transferToStandardCoordinate(arrow.position).normalize();
    console.log('wo in standard coordinate: ', wo);
    let wi,
        u = new THREE.Vector2(GetRandomSample(), GetRandomSample());

    switch (guiControls.sampleMethod) {
        case 'Diffuse':
            wi = SampleDiffuse(u);
            console.log('wi in standard coordinate: ', wi);
            wi = transferToRightHandCoordinate(wi);
            console.log('wi in right hand coordinate: ', wi);
            break;
        case 'Conductor':
            wi = SampleConductor(wo, u, 0.2, 0.2);
            console.log('wi in standard coordinate: ', wi);
            wi = transferToRightHandCoordinate(wi);
            console.log('wi in right hand coordinate: ', wi);
            break;
        case 'Dielectric':
            wi = SampleDielectric(wo, u, 0.2, 0.2, 1., 1.5);
            console.log('wi in standard coordinate: ', wi);
            wi = transferToRightHandCoordinate(wi);
            console.log('wi in right hand coordinate: ', wi);
            break;

        default:
            alert('Unknown sample method: ' + guiControls.sampleMethod)
            return;
    }

    if (wi && wi.length() !== 0) {
        wis.push(wi);
        updateWiArrow(wi);
    }

    currentSampleCount++;
    if (currentSampleCount === guiControls.sampleCount) {
        isSamplingActive = false;
    }
}


function updateWiArrow(wi) {


    const arrowDir = wi.clone().normalize();
    const arrowColor = 0x00ff00;
    const arrowLength = 5;
    const arrow = new THREE.ArrowHelper(arrowDir, new THREE.Vector3(0, 0, 0), arrowLength, arrowColor);

    scene.add(arrow);
    wiArrows.push(arrow);

}






