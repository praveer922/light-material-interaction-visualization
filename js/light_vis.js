import * as THREE from 'three';

import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GUI} from "dat.gui";

let group, camera, scene, renderer, arrow;

const guiControls = {
    sphereColor: 0xffff00, // Initial color of the sphere
    arrowRadius: 20,      // Initial radius of the arrow's position
    arrowAzimuth: 0,      // Initial azimuthal angle (in degrees)
    arrowPolar: 45        // Initial polar angle (in degrees)
};

init();
animate();

function init() {

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth * 0.5, window.innerHeight * 0.5);
    const sceneElement = document.querySelector('.scene');
    sceneElement.appendChild(renderer.domElement);

    const gui = new GUI();
    const controlPanelElement = document.querySelector('.control.panel');
    controlPanelElement.appendChild(gui.domElement);
    gui.addColor(guiControls, 'sphereColor').onChange((color) => {
        sphere.material.color.set(color);
    });
    gui.add(guiControls, 'arrowRadius', 5, 50).onChange(updateArrowPosition);
    gui.add(guiControls, 'arrowAzimuth', 0, 360).onChange(updateArrowPosition);
    gui.add(guiControls, 'arrowPolar', 0, 180).onChange(updateArrowPosition);

    // camera

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(15, 20, 30);
    scene.add(camera);

    // controls

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 20;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2;

    // ambient light

    scene.add(new THREE.AmbientLight(0x666666));

    // point light

    const light = new THREE.PointLight(0xffffff, 3, 0, 0);
    camera.add(light);

    // helper

    scene.add(new THREE.AxesHelper(20));

    scene.add(new THREE.GridHelper(100, 10, 0x888888, 0x444444))

    const geometry = new THREE.SphereGeometry(15, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({color: 0xffff00, wireframe: true});
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    const dir = new THREE.Vector3(1, 0, 0); // Direction of the arrow
    const origin = new THREE.Vector3(0, 0, 0);
    const length = 5;
    const hex = 0xff0000; // Color of the arrow
    arrow = new THREE.ArrowHelper(dir, origin, length, hex);
    updateArrowPosition();
    scene.add(arrow);
}

function animate() {

    requestAnimationFrame(animate);

    render();

}

function render() {

    renderer.render(scene, camera);

}

function updateArrowPosition() {
    const phi = THREE.MathUtils.degToRad(90 - guiControls.arrowPolar); // Convert polar angle to radians
    const theta = THREE.MathUtils.degToRad(guiControls.arrowAzimuth);  // Convert azimuthal angle to radians

    arrow.position.x = guiControls.arrowRadius * Math.sin(phi) * Math.cos(theta);
    arrow.position.y = guiControls.arrowRadius * Math.cos(phi);
    arrow.position.z = guiControls.arrowRadius * Math.sin(phi) * Math.sin(theta);

    // Update the arrow's direction to always point to the origin
    const direction = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), arrow.position).normalize();
    arrow.setDirection(direction);
}
