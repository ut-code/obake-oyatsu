export const cookieSvg = `<svg viewBox="0 0 96 96"><ellipse cx="48" cy="70" rx="28" ry="7" fill="#fff8e8"/><circle cx="48" cy="48" r="23" fill="#d9a05b"/><circle cx="48" cy="48" r="23" fill="none" stroke="#c58a46" stroke-width="2"/><g fill="#8a5a2b"><circle cx="40" cy="40" r="2.6"/><circle cx="55" cy="42" r="2.6"/><circle cx="45" cy="55" r="2.6"/><circle cx="58" cy="56" r="2.2"/><circle cx="50" cy="33" r="2"/></g></svg>`;
export const puddingSvg = `<svg viewBox="0 0 96 96"><ellipse cx="48" cy="66" rx="28" ry="8" fill="#fff8e8"/><path d="M34 38 L62 38 L68 66 L28 66 Z" fill="#ffc94d"/><path d="M34 38 Q48 30 62 38 L63 44 Q48 40 33 44 Z" fill="#c9772b"/><circle cx="48" cy="29" r="5" fill="#f0607a"/><path d="M48 24 q2 -6 6 -7" stroke="#6a8a3a" stroke-width="1.5" fill="none"/><circle cx="42" cy="52" r="2" fill="#3a2d5c"/><circle cx="54" cy="52" r="2" fill="#3a2d5c"/><path d="M45 56 q3 3 6 0" stroke="#3a2d5c" stroke-width="1.6" fill="none"/></svg>`;
export const cottonSvg = `<svg viewBox="0 0 96 96"><rect x="46" y="50" width="4" height="28" rx="2" fill="#fff8e8"/><g fill="#ffb3cf"><circle cx="40" cy="38" r="11"/><circle cx="56" cy="38" r="11"/><circle cx="48" cy="28" r="11"/><circle cx="48" cy="46" r="11"/></g><g fill="#ffd2e2"><circle cx="44" cy="32" r="5"/></g><circle cx="44" cy="40" r="1.8" fill="#3a2d5c"/><circle cx="52" cy="40" r="1.8" fill="#3a2d5c"/></svg>`;
export const houseSvg = `<svg viewBox="0 0 96 96"><path d="M26 46 L48 26 L70 46" fill="none" stroke="#f0607a" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/><rect x="31" y="44" width="34" height="26" fill="#fff8e8" stroke="#3a2d5c" stroke-width="3"/><rect x="43" y="54" width="10" height="16" fill="#8a5a2b"/><rect x="55" y="50" width="6" height="6" fill="#ffd66b"/></svg>`;

export const EMPTY_SLOT =
  '<div class="absolute inset-3 grid place-items-center rounded-full border-2 border-dashed border-plus text-[40px] font-medium text-plus-text">+</div>';

export function ghostSvg(id: number, hunger: number, full: number) {
  const ratio = Math.min(1, hunger / full);
  const done = ratio >= 1;
  const body =
    "M14 50 Q14 14 50 14 Q86 14 86 50 L86 88 L77 80 L68 88 L59 80 L50 88 L41 80 L32 88 L23 80 L14 88 Z";
  const clipId = `c${id}`;
  // 満腹度ぶんだけ体を下から明るくして、あとどれくらいで成仏するかを見た目で伝える
  const fillTop = 88 - ratio * 76;
  const eyes = done
    ? '<path d="M33 50 q5 -6 10 0 M57 50 q5 -6 10 0" stroke="#3a2d5c" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M44 60 q6 6 12 0" stroke="#3a2d5c" stroke-width="3" fill="none" stroke-linecap="round"/>'
    : '<circle cx="38" cy="50" r="4.5" fill="#3a2d5c"/><circle cx="62" cy="50" r="4.5" fill="#3a2d5c"/><path d="M45 60 q5 4 10 0" stroke="#3a2d5c" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  return `<svg viewBox="0 0 100 100">
    <defs><clipPath id="${clipId}"><path d="${body}"/></clipPath></defs>
    ${
      done
        ? `<path d="${body}" fill="#ffd0e0" filter="drop-shadow(0 0 12px #ffe7a8)"/>`
        : `<path d="${body}" fill="#9a90d0"/>
    <g clip-path="url(#${clipId})"><rect x="0" y="${fillTop}" width="100" height="100" fill="#efeaff"/></g>
    <path d="M14 82 L23 74 L32 82 L41 74 L50 82 L59 74 L68 82 L77 74 L86 82" stroke="#e86b8a" stroke-width="2" fill="none" opacity="${ratio > 0.1 ? 1 : 0}"/>`
    }
    <ellipse cx="28" cy="60" rx="6" ry="3.5" fill="#ff9db5" opacity=".8"/><ellipse cx="72" cy="60" rx="6" ry="3.5" fill="#ff9db5" opacity=".8"/>
    ${eyes}
  </svg>`;
}
