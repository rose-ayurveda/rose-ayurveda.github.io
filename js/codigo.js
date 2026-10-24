// Transforma o conteúdo de uma cliente num código compacto que viaja dentro do link,
// depois do "#". Essa parte do link nunca é enviada ao site: fica só entre o WhatsApp
// e o celular da cliente. Nada fica público na internet.

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

export async function codificar(conteudo) {
  const json = new TextEncoder().encode(JSON.stringify(conteudo));
  return `R1.${paraBase64Url(await transformar(json, new CompressionStream('deflate-raw')))}`;
}

export async function decodificar(codigo) {
  const limpo = String(codigo).trim().replace(/^.*#\/receber\//, '').replace(/\s/g, '');
  if (!limpo.startsWith('R1.')) throw new Error('codigo-invalido');
  const json = await transformar(deBase64Url(limpo.slice(3)), new DecompressionStream('deflate-raw'));
  const conteudo = JSON.parse(new TextDecoder().decode(json));
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
