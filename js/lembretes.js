// "Ativar lembretes": cria um arquivo de calendário (.ics) com um evento diário
// para cada lembrete. O próprio celular avisa no horário, mesmo com o app fechado.

function dois(n) { return String(n).padStart(2, '0'); }

// Fuso fixo do calendário a partir do fuso da cliente (ex.: America/Sao_Paulo = -03:00).
function deslocamento(fuso) {
  const nome = new Intl.DateTimeFormat('en-US', { timeZone: fuso, timeZoneName: 'longOffset' })
    .formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value || 'GMT-03:00';
  const m = nome.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  return m ? `${m[1]}${m[2]}${m[3] || '00'}` : '-0300';
}

function escapar(texto) {
  return String(texto).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

// Linhas do calendário têm no máximo 75 bytes; as maiores continuam na linha seguinte.
function dobrar(linha) {
  const bytes = new TextEncoder();
  const partes = [];
  let atual = '';
  for (const ch of linha) {
    if (bytes.encode(atual + ch).length > (partes.length ? 74 : 75)) { partes.push(atual); atual = ''; }
    atual += ch;
  }
  partes.push(atual);
  return partes.join('\r\n ');
}

// Assinatura dos horários: se mudar numa atualização, a cliente reativa os lembretes.
export function assinaturaDosLembretes(conteudo) {
  const proximo = conteudo.cliente.proximoEncontro || '';
  return (conteudo.lembretes || []).map(l => `${l.id}@${l.hora}`).join('|') + `|${proximo}`;
}

export function gerarCalendario(conteudo, hoje) {
  const fuso = conteudo.cliente.fusoHorario || 'America/Sao_Paulo';
  const desloc = deslocamento(fuso);
  const data = hoje.replace(/-/g, '');
  const carimbo = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const cliente = conteudo.cliente.id;
  const linhas = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Rose Ayurveda//Lembretes//PT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'X-WR-CALNAME:Rose Ayurveda',
    'BEGIN:VTIMEZONE', `TZID:${fuso}`, 'BEGIN:STANDARD', 'DTSTART:19700101T000000',
    `TZOFFSETFROM:${desloc}`, `TZOFFSETTO:${desloc}`, 'END:STANDARD', 'END:VTIMEZONE',
  ];

  const evento = ({ uid, inicio, titulo, texto, diario }) => {
    linhas.push('BEGIN:VEVENT', `UID:${uid}@rose-ayurveda`, `DTSTAMP:${carimbo}`,
      `DTSTART;TZID=${fuso}:${inicio}`, 'DURATION:PT10M');
    if (diario) linhas.push('RRULE:FREQ=DAILY');
    linhas.push(`SUMMARY:${escapar(titulo)}`, `DESCRIPTION:${escapar(texto)}`, 'TRANSP:TRANSPARENT',
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:PT0M', `DESCRIPTION:${escapar(texto)}`, 'END:VALARM', 'END:VEVENT');
  };

  for (const l of conteudo.lembretes || []) {
    const [h, m] = l.hora.split(':');
    evento({ uid: `${cliente}-${l.id}`, inicio: `${data}T${h}${m}00`, titulo: `🌿 ${l.titulo}`, texto: l.texto, diario: true });
  }

  // Véspera do próximo encontro, às 19h.
  const encontro = conteudo.cliente.proximoEncontro;
  if (encontro) {
    const [a, mm, d] = encontro.split('-').map(Number);
    const vespera = new Date(Date.UTC(a, mm - 1, d - 1));
    const v = `${vespera.getUTCFullYear()}${dois(vespera.getUTCMonth() + 1)}${dois(vespera.getUTCDate())}`;
    evento({ uid: `${cliente}-encontro-${encontro}`, inicio: `${v}T190000`, titulo: '🌿 Amanhã é o seu encontro com a Rose',
      texto: 'Revise as observações do seu diário antes do encontro de amanhã.' });
  }

  linhas.push('END:VCALENDAR');
  return linhas.map(dobrar).join('\r\n') + '\r\n';
}

export function ehIPhone() {
  return /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

const NOME_ARQUIVO = 'lembretes-rose-ayurveda.ics';

// Entrega o arquivo de lembretes. No iPhone, o app instalado não abre o calendário
// direto: o arquivo vai pela tela "Compartilhar" (Calendário ou Salvar em Arquivos).
// "baixar" = alternativa: o iPhone baixa o arquivo, e ele é aberto pelos Downloads.
export async function abrirCalendario(ics, modo = 'compartilhar') {
  const arquivo = new File([ics], NOME_ARQUIVO, { type: 'text/calendar' });
  if (modo === 'compartilhar' && ehIPhone() && navigator.canShare?.({ files: [arquivo] })) {
    try {
      await navigator.share({ files: [arquivo] });
      return 'compartilhado';
    } catch (erro) {
      if (erro.name === 'AbortError') return 'cancelado';
    }
  }
  baixar(arquivo);
  return 'baixado';
}

function baixar(arquivo) {
  const url = URL.createObjectURL(arquivo);
  const link = Object.assign(document.createElement('a'), { href: url, download: NOME_ARQUIVO });
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
}
