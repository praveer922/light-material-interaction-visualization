import * as THREE from 'three';

import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GUI} from "dat.gui";
import {GetRandomSample, SampleConductor, SampleDiffuse} from "./sample";
import {update} from "three/addons/libs/tween.module";

let group, camera, scene, renderer, arrow, hemisphere;

const guiControls = {
    sphereColor: 0xffff00, // Initial color of the sphere
    arrowRadius: 20,      // Initial radius of the arrow's position
    arrowAzimuth: 0,      // Initial azimuthal angle (in degrees)
    arrowPolar: 45,        // Initial polar angle (in degrees)
    segments: 8,         // Number of segments of the sphere
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
    gui.addColor(guiControls, 'sphereColor').onChange((color) => {
        sphere.material.color.set(color);
    });
    gui.add(guiControls, 'segments', [4, 8, 16, 32]).onChange(updateHemiSphere);
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

    const dir = new THREE.Vector3(1, 0, 0); // Direction of the arrow
    const phi = THREE.MathUtils.degToRad(90 - guiControls.arrowPolar); // Convert polar angle to radians
    const theta = THREE.MathUtils.degToRad(guiControls.arrowAzimuth);  // Convert azimuthal angle to radians
    const arrowPosition = new THREE.Vector3(
        guiControls.arrowRadius * Math.sin(phi) * Math.cos(theta),
        guiControls.arrowRadius * Math.cos(phi),
        guiControls.arrowRadius * Math.sin(phi) * Math.sin(theta)
    );
    const length = 5;
    const hex = 0xff0000; // Color of the arrow
    arrow = new THREE.ArrowHelper(dir, arrowPosition, length, hex);
    updateArrowPosition();
    scene.add(arrow);

    hemisphere = buildHemisphere(15, guiControls.segments);
    scene.add(hemisphere);
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

function buildHemisphere(radius, segments) {
    const group = new THREE.Group();
    const azimuthalStep = Math.PI * 2 / segments;
    const polarStep = Math.PI / 2 / segments;

    for (let phi = 0; phi < Math.PI * 2; phi += azimuthalStep) {
        for (let theta = 0; theta < Math.PI / 2; theta += polarStep) {
            const x = radius * Math.sin(theta) * Math.cos(phi);
            const z = radius * Math.sin(theta) * Math.sin(phi);
            const y = radius * Math.cos(theta);

            // 创建长方体
            const length = radius; // 长方体的长度
            const boxGeometry = new THREE.BoxGeometry(0.1, 0.1, length); // 长方体的尺寸
            const boxMaterial = new THREE.MeshBasicMaterial({color: 0x808080}); // 长方体的颜色
            const cube = new THREE.Mesh(boxGeometry, boxMaterial);

            cube.position.set(x / 2, y / 2, z / 2);

            cube.lookAt(new THREE.Vector3(x, y, z));

            group.add(cube);
        }
    }

    return group;
}

function updateHemiSphere() {
    if (hemisphere) {
        scene.remove(hemisphere);
    }
    hemisphere = buildHemisphere(15, guiControls.segments);
    scene.add(hemisphere);
}

function updateDiffuse(segments, sampleCount = 10000) {
    const azimuthalSegments = segments;
    const polarSegments = segments;
    let distribution = Array.from(Array(azimuthalSegments), () => new Array(polarSegments).fill(0));

    const azimuthalFactor = azimuthalSegments / (2 * Math.PI);
    const polarFactor = polarSegments / Math.PI;

    for (let i = 0; i < sampleCount; i++) {
        let u = new THREE.Vector2(Math.random(), Math.random());
        let wi = SampleDiffuse(u);

        let azimuthalAngle = Math.atan2(wi.y, wi.x);
        let polarAngle = Math.acos(wi.z / wi.length());

        let azimuthalIndex = Math.floor((azimuthalAngle + Math.PI) * azimuthalFactor) % azimuthalSegments;
        let polarIndex = Math.floor(polarAngle * polarFactor);

        distribution[azimuthalIndex][polarIndex]++;
    }

    for (let i = 0; i < azimuthalSegments; i++) {
        for (let j = 0; j < polarSegments; j++) {
            distribution[i][j] /= sampleCount;
        }
    }

    return distribution;
}

function updateConductor(wo, segments, sampleCount = 10000) {
    const azimuthalSegments = segments;
    const polarSegments = segments;
    let distribution = Array.from(Array(azimuthalSegments), () => new Array(polarSegments).fill(0));

    const azimuthalFactor = azimuthalSegments / (2 * Math.PI);
    const polarFactor = polarSegments / Math.PI;

    for (let i = 0; i < sampleCount; i++) {
        let u = new THREE.Vector2(Math.random(), Math.random());
        let wi = SampleConductor(wo, u, 0.5, 0.5);

        let azimuthalAngle = Math.atan2(wi.y, wi.x);
        let polarAngle = Math.acos(wi.z / wi.length());

        let azimuthalIndex = Math.floor((azimuthalAngle + Math.PI) * azimuthalFactor) % azimuthalSegments;
        let polarIndex = Math.floor(polarAngle * polarFactor);

        distribution[azimuthalIndex][polarIndex]++;
    }

    for (let i = 0; i < azimuthalSegments; i++) {
        for (let j = 0; j < polarSegments; j++) {
            distribution[i][j] /= sampleCount;
        }
    }

    return distribution;
}

function updateDielectric(wo, segments, sampleCount = 10000) {
    const azimuthalSegments = segments;
    const polarSegments = segments;
    let distribution = Array.from(Array(azimuthalSegments), () => new Array(polarSegments).fill(0));

    const azimuthalFactor = azimuthalSegments / (2 * Math.PI);
    const polarFactor = polarSegments / Math.PI;

    for (let i = 0; i < sampleCount; i++) {
        let u = new THREE.Vector2(Math.random(), Math.random());
        let wi = SampleConductor(wo, u, 0.5, 0.5, 1., 1.5);

        let azimuthalAngle = Math.atan2(wi.y, wi.x);
        let polarAngle = Math.acos(wi.z / wi.length());

        let azimuthalIndex = Math.floor((azimuthalAngle + Math.PI) * azimuthalFactor) % azimuthalSegments;
        let polarIndex = Math.floor(polarAngle * polarFactor);

        distribution[azimuthalIndex][polarIndex]++;
    }

    for (let i = 0; i < azimuthalSegments; i++) {
        for (let j = 0; j < polarSegments; j++) {
            distribution[i][j] /= sampleCount;
        }
    }

    return distribution;
}


