// Imperative juice helpers — append throwaway DOM nodes, animate, self-remove.
const COLORS = ['#e63946', '#ffd60a', '#2c6df4', '#3fb950', '#ff6b9d', '#f97316'];

export function burst(x: number, y: number, count = 14, colors = COLORS) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'burst';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.background = colors[i % colors.length];
    p.style.boxShadow = `0 0 8px ${colors[i % colors.length]}`;
    document.body.appendChild(p);
    const ang = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const dist = 50 + Math.random() * 70;
    const dx = Math.cos(ang) * dist;
    const dy = Math.sin(ang) * dist;
    p.animate(
      [
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 },
      ],
      { duration: 600 + Math.random() * 300, easing: 'cubic-bezier(.2,.7,.3,1)' },
    ).onfinish = () => p.remove();
  }
}

const CONFETTI_COLORS = ['#e63946', '#ffd60a', '#2c6df4', '#3fb950', '#ff6b9d', '#f97316', '#ffffff'];
const INK = '#111111';

/** Full-screen comic confetti RAIN: bold ink-outlined pieces fall from the top across
 *  the whole width, with varied shapes, colors, sizes and fall speeds + sway + spin. */
export function confetti(n = 80) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('div');
    p.className = 'confetti';
    const c = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const shape = i % 4; // 0 ribbon, 1 square, 2 circle, 3 outlined star
    const size = 11 + Math.random() * 16;
    p.style.left = Math.random() * W + 'px';
    p.style.top = -40 - Math.random() * 220 + 'px'; // start above the screen, staggered

    if (shape === 3) {
      p.textContent = '★';
      p.style.color = c;
      p.style.fontSize = size + 8 + 'px';
      p.style.lineHeight = '1';
      (p.style as any).webkitTextStroke = '2.5px ' + INK;
    } else {
      p.style.background = c;
      p.style.border = '2.5px solid ' + INK; // bold comic outline
      p.style.width = size + 'px';
      p.style.height = (shape === 0 ? size * 0.5 : size) + 'px'; // ribbon vs square
      if (shape === 2) p.style.borderRadius = '50%';
    }
    document.body.appendChild(p);

    const drift = (Math.random() - 0.5) * 160; // horizontal sway
    const fall = H + 140;
    const dur = 1700 + Math.random() * 2600; // varied fall speeds (slow → fast)
    const delay = Math.random() * 300;
    const rot = Math.random() * 1080 - 540;
    p.animate(
      [
        { transform: 'translate(0,0) rotate(0deg)' },
        { transform: `translate(${drift * 0.5}px, ${fall * 0.45}px) rotate(${rot * 0.5}deg)`, offset: 0.5 },
        { transform: `translate(${drift}px, ${fall}px) rotate(${rot}deg)` },
      ],
      { duration: dur, delay, easing: 'linear', fill: 'forwards' },
    ).onfinish = () => p.remove();
  }
}

export function floatScore(text: string, color = '#ffe83b') {
  const el = document.createElement('div');
  el.className = 'floatScore';
  el.textContent = text;
  el.style.color = color;
  el.style.textShadow = `0 0 12px ${color}`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

/** Briefly add a class to an element (for one-shot animations). */
export function pulse(el: HTMLElement | null, cls: string, ms = 360) {
  if (!el) return;
  el.classList.remove(cls);
  // force reflow so re-adding restarts the animation
  void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), ms);
}
