// ========== ANIMATIONS & BACKGROUND EFFECTS ==========

// Initialize Three.js background (optional enhancement)
let scene, camera, renderer, particles;

function initThreeBackground() {
  if (!document.getElementById('bg-canvas')) {
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    document.body.appendChild(canvas);
  }
  
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas'), alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  // Create particle system for background
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 1500;
  const posArray = new Float32Array(particlesCount * 3);
  
  for (let i = 0; i < particlesCount * 3; i += 3) {
    posArray[i] = (Math.random() - 0.5) * 200;
    posArray[i + 1] = (Math.random() - 0.5) * 100;
    posArray[i + 2] = (Math.random() - 0.5) * 50 - 25;
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.2,
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
  });
  
  particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);
  
  camera.position.z = 30;
  
  function animate() {
    requestAnimationFrame(animate);
    particles.rotation.y += 0.0005;
    particles.rotation.x += 0.0003;
    renderer.render(scene, camera);
  }
  
  animate();
  
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// Initialize molecular particles (CSS-based, lighter weight)
function initMolecularBackground() {
  createMolecularParticles();
}

// Animate progress bar
function updateProgressBar(progressElement, targetWidth, duration = 1000) {
  if (!progressElement) return;
  const startWidth = parseFloat(progressElement.style.width) || 0;
  const difference = targetWidth - startWidth;
  const startTime = performance.now();
  
  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const newWidth = startWidth + (difference * progress);
    progressElement.style.width = `${newWidth}%`;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  requestAnimationFrame(animate);
}

// Pulse animation for recording button
function addRecordingAnimation(element) {
  if (!element) return;
  element.classList.add('recording-active');
}

function removeRecordingAnimation(element) {
  if (!element) return;
  element.classList.remove('recording-active');
}

// Wave animation for voice recording
let waveInterval = null;

function startWaveAnimation() {
  const waveContainer = document.getElementById('waveformAnim');
  if (waveContainer) {
    waveContainer.style.display = 'flex';
  }
}

function stopWaveAnimation() {
  const waveContainer = document.getElementById('waveformAnim');
  if (waveContainer) {
    waveContainer.style.display = 'none';
  }
}