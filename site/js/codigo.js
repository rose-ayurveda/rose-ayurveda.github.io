// Transforma o conteúdo de uma cliente num código compacto que viaja dentro do link,
// depois do "#". Essa parte do link nunca é enviada ao site: fica só entre o WhatsApp
// e o celular da cliente. Nada fica público na internet.
//
// Para o link ficar mais curto, as partes que o app já traz dentro dele (diário, check-in,
// apoio, selos, mensagens, mensagem da semana, alertas — ver area/padroes.js) não viajam
// inteiras: vai só o que for diferente desses padrões.
// Melhor ainda: o link parte do modelo de dosha mais parecido (area/modelos.js, que também
// está dentro do app) e leva só o que a Rose mudou nele.
//   R1. = formato antigo (conteúdo inteiro), ainda aceito
//   R2. = conteúdo + diferenças em relação aos padrões, ainda aceito
//   R3. = só as diferenças em relação ao modelo mais parecido (ou aos padrões)
//
// Link curto (C1.<pacote>.<chave>): o código acima é trancado neste aparelho com uma chave
// nova e só a versão trancada vai para o servidor da Rose, que a apaga em 30 dias.
// A chave fica só no link, depois do "#" — parte que nunca é enviada a servidor nenhum.
import { PADROES, VERSAO_PADROES } from './area/padroes.js';
import { TIPOS, criarModelo } from './area/modelos.js';
import { SERVIDOR } from './servidor.js';

function paraBase64Url(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function deBase64Url(texto) {
  const b64 = texto.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}

async function transformar(bytes, fluxo) {
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(fluxo)).arrayBuffer());
}

// ---------- Diferenças em relação aos padrões ----------

const APAGAR = '$apagar';
const ehObjeto = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// O que em "valor" é diferente de "base" (undefined = igual).
function diferenca(valor, base) {
  if (igual(valor, base)) return undefined;
  if (ehObjeto(valor) && ehObjeto(base)) {
    const saida = {};
    for (const chave of Object.keys(valor)) {
      const d = diferenca(valor[chave], base[chave]);
      if (d !== undefined) saida[chave] = d;
    }
    for (const chave of Object.keys(base)) if (!(chave in valor)) saida[chave] = APAGAR;
    // Itens novos no meio da lista de chaves: guarda a ordem para voltar igualzinho.
    const ordem = [...Object.keys(base).filter(c => c in valor), ...Object.keys(valor).filter(c => !(c in base))];
    if (ordem.join('\n') !== Object.keys(valor).join('\n')) saida.$ordem = Object.keys(valor);
    return saida;
  }
  // Listas do mesmo tamanho: só os itens que mudaram.
  if (Array.isArray(valor) && Array.isArray(base) && valor.length === base.length) {
    const itens = {};
    valor.forEach((item, i) => {
      const d = diferenca(item, base[i]);
      if (d !== undefined) itens[i] = d;
    });
    return { $lista: itens };
  }
  return valor;
}

function aplicarDiferenca(base, d) {
  if (d === undefined) return structuredClone(base);
  if (ehObjeto(d) && d.$lista && Array.isArray(base)) {
    const lista = structuredClone(base);
    for (const [i, item] of Object.entries(d.$lista)) lista[i] = aplicarDiferenca(base[i], item);
    return lista;
  }
  if (ehObjeto(d) && ehObjeto(base)) {
    const saida = structuredClone(base);
    for (const [chave, valor] of Object.entries(d)) {
      if (chave === '$ordem') continue;
      if (valor === APAGAR) delete saida[chave];
      else saida[chave] = aplicarDiferenca(base[chave], valor);
    }
    return d.$ordem ? Object.fromEntries(d.$ordem.map(c => [c, saida[c]])) : saida;
  }
  return d;
}

// Cada parte comum fica no mesmo lugar, como "$p" (igual ao padrão) ou { $p: diferenças }.
function compactar(conteudo) {
  const compacto = { ...conteudo, $pv: VERSAO_PADROES };
  for (const chave of Object.keys(PADROES)) {
    if (!(chave in conteudo)) continue;
    const d = diferenca(conteudo[chave], PADROES[chave]);
    compacto[chave] = d === undefined ? '$p' : { $p: d };
  }
  return compacto;
}

function descompactar(compacto) {
  if (compacto.$pv !== VERSAO_PADROES) throw new Error('app-desatualizado');
  const { $pv, ...conteudo } = compacto;
  for (const chave of Object.keys(PADROES)) {
    const valor = conteudo[chave];
    if (valor === '$p') conteudo[chave] = structuredClone(PADROES[chave]);
    else if (ehObjeto(valor) && '$p' in valor) conteudo[chave] = aplicarDiferenca(PADROES[chave], valor.$p);
  }
  return conteudo;
}

// ---------- Código do link ----------

const baseDe = modelo => (modelo ? criarModelo(modelo) : structuredClone(PADROES));

async function comprimir(objeto) {
  return transformar(new TextEncoder().encode(JSON.stringify(objeto)), new CompressionStream('deflate-raw'));
}

export async function codificar(conteudo) {
  // Experimenta cada modelo como ponto de partida e fica com o que dá o link mais curto.
  let melhor = null;
  for (const modelo of [null, ...TIPOS.map(t => t.valor)]) {
    const envelope = { $pv: VERSAO_PADROES, $m: modelo, $d: diferenca(conteudo, baseDe(modelo)) ?? {} };
    const bytes = await comprimir(envelope);
    if (!melhor || bytes.length < melhor.length) melhor = bytes;
  }
  return `R3.${paraBase64Url(melhor)}`;
}

// ---------- Link curto (pacote trancado) ----------

async function chaveAes(bytes, uso) {
  return crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, [uso]);
}

export async function codigoCurto(conteudo) {
  const codigo = await codificar(conteudo);
  const chave = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const trancado = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await chaveAes(chave, 'encrypt'), new TextEncoder().encode(codigo)));
  const pacote = new Uint8Array(iv.length + trancado.length);
  pacote.set(iv);
  pacote.set(trancado, iv.length);
  const resposta = await fetch(`${SERVIDOR}/guardar`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: paraBase64Url(pacote) });
  if (!resposta.ok) throw new Error('servidor');
  const { id } = await resposta.json();
  return `C1.${id}.${paraBase64Url(chave)}`;
}

async function abrirPacote(codigo) {
  const [, id, chave] = codigo.split('.');
  let resposta;
  try {
    resposta = await fetch(`${SERVIDOR}/pacote/${id}`);
  } catch {
    throw new Error('sem-internet');
  }
  if (resposta.status === 404) throw new Error('link-vencido');
  if (!resposta.ok) throw new Error('sem-internet');
  const pacote = deBase64Url((await resposta.json()).dados);
  const aberto = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: pacote.slice(0, 12) }, await chaveAes(deBase64Url(chave), 'decrypt'), pacote.slice(12));
  return new TextDecoder().decode(aberto);
}

// Acha o código dentro de um texto colado (o link inteiro ou a mensagem do WhatsApp).
export function acharCodigo(texto) {
  const achado = String(texto).match(/C1\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}|R[123]\.[A-Za-z0-9_-]+/);
  return achado ? achado[0] : null;
}

export async function decodificar(texto) {
  let codigo = acharCodigo(String(texto).replace(/\s/g, ''));
  if (codigo?.startsWith('C1.')) codigo = acharCodigo(await abrirPacote(codigo));
  if (!codigo) throw new Error('codigo-invalido');
  const json = await transformar(deBase64Url(codigo.slice(3)), new DecompressionStream('deflate-raw'));
  const lido = JSON.parse(new TextDecoder().decode(json));
  let conteudo = lido;
  if (codigo.startsWith('R2.')) conteudo = descompactar(lido);
  if (codigo.startsWith('R3.')) {
    if (lido.$pv !== VERSAO_PADROES) throw new Error('app-desatualizado');
    conteudo = aplicarDiferenca(baseDe(lido.$m), lido.$d);
  }
  if (!conteudo?.cliente?.id || !conteudo.mapa) throw new Error('conteudo-invalido');
  return conteudo;
}

// Endereço público do app (GitHub Pages). Dentro do app Android o endereço local
// não serve para a cliente, então o link usa sempre o público.
export const ENDERECO_PUBLICO = 'https://rose-ayurveda.github.io/';

export function linkDoConteudo(codigo) {
  const noApp = Boolean(window.Capacitor?.isNativePlatform?.());
  const endereco = noApp ? ENDERECO_PUBLICO : `${location.origin}${location.pathname}`;
  return `${endereco}#/receber/${codigo}`;
}
