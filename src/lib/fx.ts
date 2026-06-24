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

/** Rich confetti celebration: mixed shapes/colors, fast-ejected + slow-floaty mix, gravity arc + spin. */
export function confetti(x: number, y: number, n = 60) {
  for (let i = 0; i < n; i++) {
    const p = document.createElement('div');
    p.className = 'confetti';
    const c = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const shape = i % 5; // 0 ribbon, 1 square, 2 circle, 3 triangle, 4 star
    const size = 7 + Math.random() * 10;
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    if (shape === 3) {
      // triangle via borders
      p.style.width = '0'; p.style.height = '0'; p.style.background = 'transparent';
      p.style.borderLeft = size / 2 + 'px solid transparent';
      p.style.borderRight = size / 2 + 'px solid transparent';
      p.style.borderBottom = size + 'px solid ' + c;
    } else {
      p.style.background = c;
      p.style.width = size + 'px';
      p.style.height = (shape === 0 ? size * 0.42 : size) + 'px';
      if (shape === 2) p.style.borderRadius = '50%';
      if (shape === 4) p.style.clipPath = 'polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)';
      p.style.boxShadow = '0 0 0 1.4px rgba(17,17,17,0.8)';
    }
    document.body.appendChild(p);

    const fast = Math.random() < 0.45;
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * (fast ? 2.1 : 1.2); // mostly up, spread
    const speed = fast ? 230 + Math.random() * 280 : 80 + Math.random() * 120;
    const vx = Math.cos(ang) * speed;
    const peak = -Math.abs(Math.sin(ang)) * speed * 0.55 - 30;
    const fall = 300 + Math.random() * 380;
    const dur = fast ? 1100 + Math.random() * 700 : 1600 + Math.random() * 1200; // floaty = slower
    const rot = Math.random() * 1080 - 540;
    p.animate(
      [
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${vx * 0.4}px, ${peak}px) rotate(${rot * 0.4}deg)`, opacity: 1, offset: 0.3 },
        { transform: `translate(${vx}px, ${fall}px) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: dur, easing: 'cubic-bezier(.2,.55,.5,1)' },
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
