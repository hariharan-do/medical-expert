/**
 * Anti-Gravity 3D Glassmorphism Parallax Controller
 * Throttles mousemove events using requestAnimationFrame (Requirement #4)
 * Applies spring lerp rotation and depth translateZ to elements with [data-parallax] attribute.
 */

export class ParallaxController {
  constructor() {
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.rAFScheduled = false;
    this.enabled = true;
    this.elements = [];

    this.onMouseMove = this.onMouseMove.bind(this);
    this.updateLoop = this.updateLoop.bind(this);

    this.init();
  }

  init() {
    this.refreshElements();

    // Throttled mousemove listener (Requirement #4)
    window.addEventListener('mousemove', this.onMouseMove, { passive: true });

    // Touch support
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        this.onMouseMove(e.touches[0]);
      }
    }, { passive: true });

    this.animFrame = requestAnimationFrame(this.updateLoop);
  }

  refreshElements() {
    this.elements = Array.from(document.querySelectorAll('[data-parallax]'));
  }

  onMouseMove(e) {
    if (!this.enabled) return;

    // Normalize mouse coordinates from -1.0 to +1.0 relative to window center
    const halfWidth = window.innerWidth / 2;
    const halfHeight = window.innerHeight / 2;

    this.targetX = (e.clientX - halfWidth) / halfWidth;
    this.targetY = (e.clientY - halfHeight) / halfHeight;

    // rAF Throttle Lock
    if (!this.rAFScheduled) {
      this.rAFScheduled = true;
    }
  }

  updateLoop() {
    if (this.enabled && this.elements.length > 0) {
      // Spring interpolation (lerp)
      this.currentX += (this.targetX - this.currentX) * 0.08;
      this.currentY += (this.targetY - this.currentY) * 0.08;

      const rotY = this.currentX * 12; // rotateY (degrees)
      const rotX = -this.currentY * 12; // rotateX (degrees)

      for (let i = 0; i < this.elements.length; i++) {
        const el = this.elements[i];
        if (el.offsetParent === null) continue; // Skip hidden elements

        const intensity = parseFloat(el.getAttribute('data-parallax-intensity') || '1.0');
        const depth = parseFloat(el.getAttribute('data-parallax-depth') || '0');

        const finalRotX = rotX * intensity;
        const finalRotY = rotY * intensity;

        // Apply 3D CSS Transform
        el.style.transform = `perspective(1000px) rotateX(${finalRotX.toFixed(2)}deg) rotateY(${finalRotY.toFixed(2)}deg) translateZ(${depth}px)`;
      }
    }

    this.rAFScheduled = false;
    this.animFrame = requestAnimationFrame(this.updateLoop);
  }

  setEnabled(enable) {
    this.enabled = enable;
    if (!enable) {
      // Reset transforms when disabled
      for (const el of this.elements) {
        el.style.transform = 'none';
      }
    }
  }

  destroy() {
    this.enabled = false;
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
    }
    window.removeEventListener('mousemove', this.onMouseMove);
  }
}
