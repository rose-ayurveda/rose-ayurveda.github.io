// Flor de lótus "Rosa clássico" (opção A escolhida pela Rose).
// A flor tem 11 pétalas; abertas = proporção dos cuidados feitos no dia.
// Ela nunca murcha: pétalas ainda fechadas aparecem apenas em botão claro.

const CORES = {
  externa: '#F3C9CF', meio: '#E89AA8', interna: '#D46A82',
  contorno: '#A84962', centro: '#D9A441',
  fechada: '#FFFDF8', contornoFechada: '#D9C9B6',
  folha: '#8FA876', folhaClara: '#B9CCA2', folhaContorno: '#4F6B3A',
};

// Camadas de fora para dentro: largura, altura e ângulos de cada pétala.
const CAMADAS = [
  { w: 24, h: 62, angulos: [-82, 82, -62, 62], cor: 'externa' },
  { w: 22, h: 74, angulos: [-42, 42, -22, 22], cor: 'externa' },
  { w: 20, h: 86, angulos: [-8, 8], cor: 'meio' },
  { w: 16, h: 92, angulos: [0], cor: 'interna' },
];
export const TOTAL_PETALAS = CAMADAS.reduce((s, c) => s + c.angulos.length, 0);

function petala(w, h, angulo, preenchimento, contorno) {
  return `<path transform="translate(100 112) rotate(${angulo})" d="M0 0 C ${w * 0.95} ${-h * 0.35} ${w * 0.6} ${-h * 0.85} 0 ${-h} C ${-w * 0.6} ${-h * 0.85} ${-w * 0.95} ${-h * 0.35} 0 0Z" fill="${preenchimento}" stroke="${contorno}" stroke-width="1.1"/>`;
}

// feitos/total → quantas pétalas abrir.
export function petalasAbertas(feitos, total) {
  if (!total) return 0;
  if (feitos >= total) return TOTAL_PETALAS;
  return Math.round((feitos / total) * TOTAL_PETALAS);
}

export function lotus(abertas, { tamanho = '100%', rotulo } = {}) {
  let k = 0;
  let desenho = `<ellipse cx="100" cy="118" rx="84" ry="12" fill="${CORES.folha}" stroke="${CORES.folhaContorno}" stroke-width="1"/>`
    + `<ellipse cx="100" cy="117" rx="60" ry="7" fill="${CORES.folhaClara}"/>`;
  for (const camada of CAMADAS) {
    for (const a of camada.angulos) {
      const aberta = k < abertas;
      desenho += petala(camada.w, camada.h, a,
        aberta ? CORES[camada.cor] : CORES.fechada,
        aberta ? CORES.contorno : CORES.contornoFechada);
      k++;
    }
  }
  const completa = abertas >= TOTAL_PETALAS;
  desenho += `<circle cx="100" cy="104" r="${completa ? 7 : 4}" fill="${CORES.centro}"/>`;
  const texto = rotulo || `Flor de lótus com ${abertas} de ${TOTAL_PETALAS} pétalas abertas`;
  return `<svg viewBox="0 0 200 135" width="${tamanho}" role="img" aria-label="${texto}"><title>${texto}</title>${desenho}</svg>`;
}

// Marca do app: a flor de lótus da Rose (a mesma do app P.R.A.N.A., pedido de 15/11/2026).
export function marcaLotus() {
  return '<img class="marca-icone" src="icones/icone-192.png" alt="" aria-hidden="true">';
}
