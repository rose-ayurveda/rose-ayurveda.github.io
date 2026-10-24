// Minhas conquistas: selos ganhos e os próximos a conquistar.
import { esc, avisoLegal, icones } from '../ui.js';
import { selo } from '../selos.js';
import { situacaoDosSelos } from '../quadro.js';
import { partes } from '../datas.js';

function dataCurta(chave) {
  const p = partes(chave);
  return `${String(p.dia).padStart(2, '0')}/${String(p.mes).padStart(2, '0')}`;
}

export function telaConquistas(conteudo) {
  const selos = situacaoDosSelos(conteudo);
  const ganhos = selos.filter(s => s.ganhoEm).sort((a, b) => a.ganhoEm.localeCompare(b.ganhoEm));
  const proximos = selos.filter(s => !s.ganhoEm).sort((a, b) => (b.atual / b.meta) - (a.atual / a.meta));

  return `
    <a href="#/quadro" class="voltar">${icones.voltar}<span>Quadro do dia</span></a>
    <h1>Minhas conquistas</h1>
    <p class="texto-longo">Selos que celebram a sua constância. Eles nunca se perdem.</p>

    <h2>Conquistados</h2>
    ${ganhos.length ? `<div class="grade-selos">${ganhos.map(s => `
      <div class="selo-cartao">${selo(s.simbolo, true)}<strong>${esc(s.nome)}</strong><span class="rotulo">${esc(s.texto)}</span><span class="rotulo">em ${dataCurta(s.ganhoEm)}</span></div>`).join('')}</div>`
      : '<p class="rotulo">O primeiro selo vem com a primeira manhã completa.</p>'}

    <h2>Próximos</h2>
    ${proximos.map(s => `
      <div class="cartao proximo-selo">
        ${selo(s.simbolo, false, 48)}
        <div style="flex:1">
          <strong>${esc(s.nome)}</strong>
          <p class="rotulo" style="margin:0 0 6px">${esc(s.texto)}</p>
          <div class="trilho-selo" role="progressbar" aria-valuemin="0" aria-valuemax="${s.meta}" aria-valuenow="${s.atual}" aria-label="${s.atual} de ${s.meta}">
            <span style="width:${(s.atual / s.meta) * 100}%"></span>
          </div>
          <span class="rotulo">${s.atual} de ${s.meta}</span>
        </div>
      </div>`).join('')}
    ${avisoLegal()}
  `;
}
