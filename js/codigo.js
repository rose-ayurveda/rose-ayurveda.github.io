// Transforma o conteúdo de uma cliente num código compacto que viaja dentro do link,
// depois do "#". Essa parte do link nunca é enviada ao site: fica só entre o WhatsApp
// e o celular da cliente. Nada fica público na internet.
//
// Para o link ficar mais curto, as partes que o app já traz dentro dele (diário, check-in,
// apoio, selos, mensagens, mensagem da semana, alertas — ver area/padroes.js) não viajam
// inteiras: vai só o que for diferente desses padrões.
//   R1. = formato antigo (conteúdo inteiro), ainda aceito
//   R2. = formato curto (conteúdo + diferenças em relação aos padrões)
import { PADROES, VERSAO_PADROES } from './area/padroes.js';

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

export async function codificar(conteudo) {
  const json = new TextEncoder().encode(JSON.stringify(compactar(conteudo)));
  return `R2.${paraBase64Url(await transformar(json, new CompressionStream('deflate-raw')))}`;
}

// Acha o código dentro de um texto colado (o link inteiro ou a mensagem do WhatsApp).
export function acharCodigo(texto) {
  const achado = String(texto).match(/R[12]\.[A-Za-z0-9_-]+/);
  return achado ? achado[0] : null;
}

export async function decodificar(texto) {
  const codigo = acharCodigo(String(texto).replace(/\s/g, ''));
  if (!codigo) throw new Error('codigo-invalido');
  const json = await transformar(deBase64Url(codigo.slice(3)), new DecompressionStream('deflate-raw'));
  const lido = JSON.parse(new TextDecoder().decode(json));
  const conteudo = codigo.startsWith('R2.') ? descompactar(lido) : lido;
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
