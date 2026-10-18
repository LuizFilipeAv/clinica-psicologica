// Cérebro orgânico: a mesma geometria aprovada no estudo, adaptada à seção.
(() => {
  const area = document.querySelector('.brain-area');
  const section = document.querySelector('.benefits');
  const container = document.querySelector('#brain-3d');
  if (!area || !section || !container || !window.THREE) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.z = 4.5;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    const brain = new THREE.Group();
    brain.rotation.y = Math.PI / 2;
    scene.add(brain);
    const count = 1000;
    const points = [];
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const champagne = new THREE.Color('#C6A588');
    const ivory = new THREE.Color('#EEE4D8');

    for (let i = 0; i < count; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.asin(Math.random() * 2 - 1);
      const side = Math.random() < 0.5 ? -1 : 1;
      let x, y, z;
      if (i < 900) {
        const nx = Math.cos(v) * Math.sin(u);
        const ny = Math.sin(v);
        const nz = Math.cos(v) * Math.cos(u);
        const groove = 1 - 0.12 * Math.pow(Math.cos(u * 8 + Math.sin(v * 5) * 1.5), 12);
        x = side * (0.09 + Math.abs(nx) * 0.68 * groove);
        y = Math.max(-0.58, ny * 0.88 * groove + 0.16);
        z = nz * 1.42 * groove;
      } else {
        x = Math.cos(v) * Math.sin(u) * 0.47;
        y = Math.sin(v) * 0.29 - 0.63;
        z = Math.cos(v) * Math.cos(u) * 0.40 - 0.78;
      }
      positions.set([x, y, z], i * 3);
      points.push(new THREE.Vector3(x, y, z));
      const color = champagne.clone().lerp(ivory, Math.random());
      colors.set([color.r, color.g, color.b], i * 3);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = textureCanvas.height = 16;
    const context = textureCanvas.getContext('2d');
    const gradient = context.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 16, 16);
    brain.add(new THREE.Points(geometry, new THREE.PointsMaterial({
      size: 0.05, vertexColors: true, map: new THREE.CanvasTexture(textureCanvas),
      transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false
    })));

    const linePositions = [];
    const lineColors = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const a = points[i], b = points[j];
        if (a.distanceTo(b) < 0.32 && !(a.x * b.x < 0 && Math.abs(a.x) + Math.abs(b.x) < 0.3)) {
          linePositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
          lineColors.push(champagne.r, champagne.g, champagne.b, champagne.r, champagne.g, champagne.b);
        }
      }
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
    brain.add(new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending
    })));

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mouse = { x: 0, y: 0 };
    let visible = true;
    let frame = 0;
    const resize = () => {
      const width = container.clientWidth, height = container.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.render(scene, camera);
    };
    const animate = () => {
      frame = 0;
      if (!visible || document.hidden || motion.matches) return;
      const range = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -section.getBoundingClientRect().top / range));
      brain.rotation.x += (mouse.y * 0.35 - brain.rotation.x) * 0.05;
      brain.rotation.y += (Math.PI / 2 + mouse.x * 0.45 + progress * Math.PI - brain.rotation.y) * 0.05;
      brain.position.y = Math.sin(Date.now() * 0.0012) * 0.04;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    const start = () => { if (!frame && visible && !document.hidden && !motion.matches) frame = requestAnimationFrame(animate); };
    window.addEventListener('mousemove', event => {
      mouse.x = event.clientX / window.innerWidth * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', start);
    motion.addEventListener('change', () => { resize(); start(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => { visible = entries[0].isIntersecting; start(); }).observe(section);
    }
    renderer.domElement.addEventListener('webglcontextlost', () => area.classList.remove('brain-ready'));
    resize();
    area.classList.add('brain-ready');
    start();
  } catch (error) {
    // A ilustração original permanece disponível se WebGL não puder iniciar.
    console.warn('Não foi possível iniciar o cérebro 3D.', error);
  }
})();
