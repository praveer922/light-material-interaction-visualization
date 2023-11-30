import * as THREE from 'three'

// **************************************************************
// ****************** Some helpful functions ********************
// **************************************************************

function Clamp(num, min, max) {
    return num <= min
        ? min
        : num >= max
            ? max
            : num
}

export function GetRandomSample() {
    // console.log('random: ', Math.random());
    return Math.random();
}

function CosTheta(w) {
    return w.z;
}

function Cos2Theta(w) {
    return w.z * w.z;
}

function AbsCosTheta(w) {
    return Math.abs(w.z);
}

function Sin2Theta(w) {
    return Math.max(0., 1. - Cos2Theta(w));
}

function SinTheta(w) {
    return Math.sqrt(Sin2Theta(w));
}

function TanTheta(w) {
    return SinTheta(w) / CosTheta(w);
}

function Tan2Theta(w) {
    return Sin2Theta(w) / Cos2Theta(w);
}

function CosPhi(w) {
    let sinTheta = SinTheta(w);
    return (sinTheta == 0) ? 1 : Clamp(w.x / sinTheta, -1, 1);
}

function SinPhi(w) {
    let sinTheta = SinTheta(w);
    return (sinTheta == 0) ? 0 : Clamp(w.y / sinTheta, -1, 1);
}

function Cos2Phi(w) {
    return CosPhi(w) * CosPhi(w);
}

function Sin2Phi(w) {
    return SinPhi(w) * SinPhi(w);
}

export function Reflect(wo, n) {
    let wo_original = wo.clone();
    let wo_negative = wo.clone().negate();
    return wo_negative.add(n.multiplyScalar(2. * wo_original.dot(n)));
}

function Refract(wi, n, eta) {
    let cosThetaI = wi.dot(n);
    let sin2ThetaI = Math.max(0., 1. - cosThetaI * cosThetaI);
    let sin2ThetaT = eta * eta * sin2ThetaI;

    if (sin2ThetaT >= 1) return new THREE.Vector3(0, 0, 0);

    let cosThetaT = Math.sqrt(1. - sin2ThetaT);
    let wi_negative = wi.clone().negate();
    let wt = wi_negative.multiplyScalar(eta).add(n.multiplyScalar(eta * cosThetaI - cosThetaT));
    return wt;
}

export function SameHemisphere(w, wp) {
    return w.z * wp.z > 0;
}

function ConcentricSampleDisk(u) {
    let uOffset = u.multiplyScalar(2.).sub(new THREE.Vector2(1., 1.));

    // console.log('uOffset: ', uOffset);
    // console.log(': ', );

    if (uOffset.x == 0. && uOffset.y == 0.) return new THREE.Vector2(0., 0.);

    let theta, r = 0.0;

    if (Math.abs(uOffset.x) > Math.abs(uOffset.y)) {
        r = uOffset.x;
        theta = Math.PI / 4. * (uOffset.y / uOffset.x);
    } else {
        r = uOffset.y;
        theta = Math.PI / 2. - Math.PI / 4. * (uOffset.x / uOffset.y);
    }
    // console.log('costheta: ', Math.cos(theta));
    let sampled = new THREE.Vector2(Math.cos(theta), Math.sin(theta)).multiplyScalar(r);
    // console.log('sampled: ', sampled);
    return sampled;
}

function CosineSampleHemisphere(u) {
    let d = ConcentricSampleDisk(u);
    let z = Math.sqrt(Math.max(0., 1. - d.x * d.x - d.y * d.y));
    return new THREE.Vector3(d.x, d.y, z);
}

// ***********************************************
// ****************** Diffuse ********************
// ***********************************************

export function SampleDiffuse(u) {
    let wi = CosineSampleHemisphere(u);
    // console.log('wi: ', wi);
    return wi;
}

function ComputeDiffuse(color) {
    return color.divideScalar(Math.PI);
}

// ************** TEST *****************
//console.log(sampleDiffuse(new THREE.Vector2(getRandomSample(), getRandomSample())));
// *************************************

// ********************************************************
// ****************** Sample Conductor ********************
// *******************************************************

function TrowbridgeReitzSample11(cosTheta, U1, U2) {
    let slope_x, slope_y = 0.;
    if (cosTheta > .9999) {
        let r = Math.sqrt(U1 / (1. - U1));
        let phi = 6.28318530718 * U2;
        slope_x = r * Math.cos(phi);
        slope_y = r * Math.sin(phi);
        return slope_x, slope_y;
    }

    let sinTheta = Math.sqrt(Math.max(0., 1. - cosTheta * cosTheta));
    let tanTheta = sinTheta / cosTheta;
    let a = 1. / tanTheta;
    let G1_denominator = 1 / (1 + Math.sqrt(1. + 1. / (a * a)));
    let G1 = 2. * G1_denominator;

    // sample slope_x
    let A = 2. * U1 / G1 - 1;
    let tmp = 1. / (A * A - 1.);
    if (tmp > 1e10) tmp = 1e10;
    let B = tanTheta;
    let D = Math.sqrt(Math.max((B * B * tmp * tmp - (A * A - B * B) * tmp), 0));
    let slope_x_1 = B * tmp - D;
    let slope_x_2 = B * tmp + D;
    slope_x = (A < 0 || slope_x_2 > 1. / tanTheta) ? slope_x_1 : slope_x_2;

    // sample slope_y
    let S;
    if (U2 > 0.5) {
        S = 1.;
        U2 = 2. * (U2 - .5);
    } else {
        S = -1.;
        U2 = 2. * (.5 - U2);
    }
    let z =
        (U2 * (U2 * (U2 * 0.27385 - 0.73369) + 0.46341)) /
        (U2 * (U2 * (U2 * 0.093073 + 0.309420) - 1.000000) + 0.597999);
    slope_y = S * z * Math.sqrt(1. + slope_x * slope_x);

    return new THREE.Vector2(slope_x, slope_y);
}

function TrowbridgeReitzSample(wi, alpha_x, alpha_y, U1, U2) {
    let wiStretched = new THREE.Vector3(alpha_x * wi.x, alpha_y * wi.y, wi.z).normalize();
    // console.log('wiS: ', wi.x);

    let slopeVector = TrowbridgeReitzSample11(CosTheta(wiStretched), U1, U2);
    let slope_x = slopeVector.x;
    let slope_y = slopeVector.y;
    // console.log('slope_x, slope_y: ', slope_x, slope_y);
    // console.log('U1, U2: ', U1, U2);

    let tmp = CosPhi(wiStretched) * slope_x - SinPhi(wiStretched) * slope_y;
    slope_y = SinPhi(wiStretched) * slope_x + CosPhi(wiStretched) * slope_y;
    slope_x = tmp;

    slope_x = alpha_x * slope_x;
    slope_y = alpha_y * slope_y;
    //console.log('slope_x, slope_y: ', slope_x, slope_y);
    let sampled = new THREE.Vector3(-slope_x, -slope_y, 1.).normalize();
    return sampled;
}

export function Sample_wh(wo, u, alphax, alphay) {
    let wh;
    // sample visible area
    let flip = wo.z < 0;
    // console.log('u: ', u.x, u.y);
    let neg_wo = wo.clone().negate();
    wh = TrowbridgeReitzSample(flip ? neg_wo : wo, alphax, alphay, u.x, u.y);
    if (flip) wh.negate();
    //console.log('wh: ', wh);
    return wh;
}

export function SampleConductor(wo, u, alphax, alphay) {
    if (wo.z === 0) return new THREE.Vector3(0., 0., 0.);
    let wh = Sample_wh(wo.clone(), u, alphax, alphay);
    // console.log('wh: ', wh);
    if (wo.dot(wh) < 0) return new THREE.Vector3(0., 0., 0.);
    //console.log("wo: ", wo)
    let wi = Reflect(wo, wh);
    if (!SameHemisphere(wo, wi)) return new THREE.Vector3(0., 0., 0.);
    //console.log("wo, wi: ",wo,wi);
    return wi;
}

// let wo = new THREE.Vector3(0.3, 0.3, 0.3);
// console.log('wi: ', SampleConductor(wo.normalize(), new THREE.Vector2(GetRandomSample(), GetRandomSample()), 0.5, 0.5));

// ******************************************************
// ***************** Sample Dielectric ******************
// ******************************************************

export function SampleDielectric(wo, u, alphax, alphay, etaA, etaB) {
    if (wo.z === 0) return new THREE.Vector3(0., 0., 0.);
    let wh = Sample_wh(wo, u, alphax, alphay);
    if (wo.dot(wh) < 0) return new THREE.Vector3(0., 0., 0.);

    let eta = CosTheta(wo) > 0 ? (etaA / etaB) : (etaB / etaA);
    let wi = Refract(wo, wh, eta);
    if (wi.length() === 0) return new THREE.Vector3(0., 0., 0.);
    console.log("wo, wi: ",wo,wi);
    return wi;
}

//let wo = new THREE.Vector3(0, 1, 0);
//console.log('wi: ', SampleDielectric(wo.normalize(), new THREE.Vector2(GetRandomSample(), GetRandomSample()), 0.5, 0.5, 1., 1.5));