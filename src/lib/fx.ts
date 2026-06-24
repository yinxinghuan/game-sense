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
