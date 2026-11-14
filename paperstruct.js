/*
 * Paper-style structural formulas (Sri Lankan A/L paper look).
 * Notation (typed in the Sheet, or written by the AI generator):
 *   HC#C-C(=O)-CH(CH3)-CH2OH        main chain, bonds -  =  #
 *   C(=O)   branch above with a double bond     C(CH3)   branch above, single bond
 *   C(CH3)(CH3)   1st branch above, 2nd below   C(v:OH)   force a branch below
 *   COO^-  NH3^+   charges with ^
 * Usage: paperStructHTML('HC#C-C(=O)-CH(CH3)-CH2OH') -> HTML string
 */
(function () {
  const BOND = { '-': 1, '=': 2, '#': 3 };
  const SUB = '₀₁₂₃₄₅₆₇₈₉';
  const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻' };
  const esc = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // CH3 -> CH₃ (digits after a letter or ")"), ^2+ / ^- -> superscripts
  function label(t) {
    let s = String(t).trim();
    s = s.replace(/\^\{?([0-9]*[+-])\}?/g, (m, a) => a.split('').map(c => SUP[c] || c).join(''));
    s = s.replace(/([A-Za-z\)])(\d+)/g, (m, a, d) => a + d.split('').map(c => SUB[+c]).join(''));
    return esc(s);
  }
  function parse(src) {
    const s = String(src).trim();
    const items = [];
    let i = 0;
    while (i < s.length) {
      // atom text: up to "(" or a bond char (a "-" right after "^" is a charge)
      let text = '';
      while (i < s.length && s[i] !== '(' && !(BOND[s[i]] && s[i - 1] !== '^')) text += s[i++];
      const atom = { type: 'atom', text: text.trim(), up: null, down: null };
      while (s[i] === '(') {
        let depth = 0, j = i, inner = '';
        for (; j < s.length; j++) { if (s[j] === '(') depth++; else if (s[j] === ')') { depth--; if (depth === 0) break; } if (j > i) inner += s[j]; }
        i = j + 1;
        let dir = '';
        let b = inner.trim();
        const m = b.match(/^(v|\^|down|up)\s*:\s*/i);
        if (m) { dir = /^(v|down)/i.test(m[1]) ? 'down' : 'up'; b = b.slice(m[0].length); }
        let order = 1;
        if (BOND[b[0]]) { order = BOND[b[0]]; b = b.slice(1); }
        const br = { order, text: b.trim() };
        if (dir === 'down' || (!dir && atom.up)) { if (!atom.down) atom.down = br; else atom.text += '(' + br.text + ')'; }
        else if (!atom.up) atom.up = br; else atom.text += '(' + br.text + ')';
      }
      items.push(atom);
      if (i < s.length && BOND[s[i]]) { items.push({ type: 'bond', order: BOND[s[i]] }); i++; }
    }
    return items.filter(x => x.type === 'bond' || x.text || x.up || x.down);
  }
  const vbond = (n) => `<span class="ps-vb">${'<i></i>'.repeat(n)}</span>`;
  const hbond = (n) => `<span class="ps-hb">${'<i></i>'.repeat(n)}</span>`;
  // Split "HC" -> H | C | "", "CH2OH" -> "" | C | H2OH so branch bonds sit exactly over the backbone atom
  function splitAtom(t) {
    const m = String(t).match(/^(H*)(Cl|Br|Si|[A-Z])([\s\S]*)$/);
    return m ? [m[1], m[2], m[3]] : ['', t, ''];
  }
  const cell = (cls, html) => `<span class="${cls}">${html || ''}</span>`;
  window.paperStructHTML = function (src) {
    const items = parse(src);
    const hasUp = items.some(x => x.up), hasDown = items.some(x => x.down);
    const cols = items.map(x => {
      if (x.type === 'bond') {
        return `<span class="ps-col ps-bcol">${hasUp ? cell('ps-l') + cell('ps-v') : ''}${cell('ps-a', hbond(x.order))}${hasDown ? cell('ps-v') + cell('ps-l') : ''}</span>`;
      }
      const [pre, atom, post] = splitAtom(x.text);
      // 3 columns: prefix | backbone atom | suffix. Branches live only in the middle column.
      const row = (a, b, c, cls) => cell(cls, a) + cell(cls + ' ps-mid', b) + cell(cls, c);
      let h = '';
      if (hasUp) h += row('', x.up ? `<b>${label(x.up.text)}</b>` : '', '', 'ps-l ps-lu') + row('', x.up ? vbond(x.up.order) : '', '', 'ps-v');
      h += row(label(pre), label(atom), label(post), 'ps-a');
      if (hasDown) h += row('', x.down ? vbond(x.down.order) : '', '', 'ps-v') + row('', x.down ? `<b>${label(x.down.text)}</b>` : '', '', 'ps-l ps-ld');
      return `<span class="ps-col ps-acol">${h}</span>`;
    }).join('');
    return `<span class="ps" title="${esc(src)}">${cols}</span>`;
  };
  // Plain one-line text for Telegram etc.: HC≡C–C(=O)–CH(CH₃)–CH₂OH
  window.paperStructText = function (src) {
    const sym = { 1: '–', 2: '=', 3: '≡' };
    return parse(src).map(x => x.type === 'bond' ? sym[x.order] : x.text + (x.up ? '(' + (x.up.order > 1 ? sym[x.up.order] : '') + x.up.text + ')' : '') + (x.down ? '(' + (x.down.order > 1 ? sym[x.down.order] : '') + x.down.text + ')' : '')).join('')
      .replace(/\^\{?([0-9]*[+-])\}?/g, (m, a) => a.split('').map(c => SUP[c] || c).join(''))
      .replace(/([A-Za-z\)])(\d+)/g, (m, a, d) => a + d.split('').map(c => SUB[+c]).join(''));
  };
})();
