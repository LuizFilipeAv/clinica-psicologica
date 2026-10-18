import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const section = document.querySelector('#scene');
const art = document.querySelector('#art');
const status = document.querySelector('#status');
const progressLabel = document.querySelector('#progress');
const benefits = [...document.querySelectorAll('.copy li')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let model;
let scheduled = false;

try {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  art.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
  camera.position.set(0, 0, 5);
  scene.add(new THREE.HemisphereLight(0xffe7cf, 0x443122, 2.1));
  const key = new THREE.DirectionalLight(0xffe2bc, 3);
  key.position.set(3, 5, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 2);
  rim.position.set(-4, 1, -3);
  scene.add(rim);

  function render() {
    scheduled = false;
    const range = section.offsetHeight - innerHeight;
    const p = reduced.matches ? 1 : Math.max(0, Math.min(1, -section.getBoundingClientRect().top / Math.max(1, range)));
    if (model) model.rotation.y = p * Math.PI;
    benefits.forEach((item, index) => item.classList.toggle('revealed', reduced.matches || p >= (index + 1) / (benefits.length + 1)));
    progressLabel.textContent = reduced.matches ? 'Benefícios da terapia' : `Giro: ${Math.round(p * 180)}°`;
    renderer.render(scene, camera);
  }
  function requestRender() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(render); }
  }
  function resize() {
    const width = art.clientWidth, height = art.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = 5.5 / Math.min(1, camera.aspect);
    camera.updateProjectionMatrix();
    requestRender();
  }
  new GLTFLoader().load('./cerebro.glb', gltf => {
    const object = gltf.scene;
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    object.position.sub(center);
    model = new THREE.Group();
    model.add(object);
    model.scale.setScalar(2.5 / Math.max(size.x, size.y, size.z));
    scene.add(model);
    document.documentElement.classList.add('motion-ready');
    status.textContent = 'Prévia experimental em 3D · role para revelar os benefícios.';
    requestRender();
  }, undefined, () => {
    status.textContent = 'Não foi possível carregar o modelo. Abra esta prévia por um servidor local.';
  });
  addEventListener('scroll', requestRender, { passive: true });
  addEventListener('resize', resize);
  reduced.addEventListener('change', requestRender);
  resize();
} catch (error) {
  status.textContent = 'Não foi possível iniciar o 3D neste navegador. Os benefícios continuam disponíveis abaixo.';
  console.error(error);
}
