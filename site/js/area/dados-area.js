// Dados da área da Rose: senha, clientes e o conteúdo de cada uma.
// Ficam só no aparelho da Rose (celular ou computador), com cópia de segurança em arquivo.

const CHAVE = 'rose.area';
const SESSAO = 'rose.areaAberta';

function ler() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) || { clientes: [] };
  } catch {
    return { clientes: [] };
  }
}

function gravar(area) {
  area.atualizadoEm = new Date().toISOString();
  localStorage.setItem(CHAVE, JSON.stringify(area));
}

// ---------- Senha (guardada como "impressão digital", nunca o texto da senha) ----------

async function impressao(senha, sal) {
  const chave = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(sal), iterations: 150_000 }, chave, 256);
  return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function temSenha() {
  return Boolean(ler().senha);
}

export async function criarSenha(senha) {
  const area = ler();
  const sal = crypto.randomUUID();
  area.senha = { sal, hash: await impressao(senha, sal) };
  gravar(area);
  sessionStorage.setItem(SESSAO, '1');
}

export async function conferirSenha(senha) {
  const { senha: guardada } = ler();
  const certa = Boolean(guardada) && (await impressao(senha, guardada.sal)) === guardada.hash;
  if (certa) sessionStorage.setItem(SESSAO, '1');
  return certa;
}

export function areaAberta() {
  return sessionStorage.getItem(SESSAO) === '1';
}

export function fecharArea() {
  sessionStorage.removeItem(SESSAO);
}

// ---------- Clientes ----------

export function clientes() {
  return ler().clientes;
}

export function cliente(id) {
  return ler().clientes.find(c => c.id === id) || null;
}

// Cada cliente guarda: o conteúdo em edição e a última versão enviada.
export function salvarCliente(registro) {
  const area = ler();
  const i = area.clientes.findIndex(c => c.id === registro.id);
  if (i >= 0) area.clientes[i] = registro; else area.clientes.push(registro);
  gravar(area);
}

export function removerCliente(id) {
  const area = ler();
  area.clientes = area.clientes.filter(c => c.id !== id);
  gravar(area);
}

export function idNovo(nome) {
  const base = nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cliente';
  const usados = new Set(ler().clientes.map(c => c.id));
  let id = base;
  for (let n = 2; usados.has(id); n++) id = `${base}-${n}`;
  return id;
}

// ---------- Cópia de segurança da área ----------

export function copiaDaArea() {
  const { senha, ...resto } = ler();
  return { tipo: 'rose-ayurveda-area', versao: 1, criadaEm: new Date().toISOString(), area: resto };
}

// Restaurar mantém a senha deste aparelho e substitui as clientes pelas da cópia.
export function restaurarArea(copia) {
  if (copia?.tipo !== 'rose-ayurveda-area') throw new Error('arquivo-invalido');
  const atual = ler();
  gravar({ ...copia.area, senha: atual.senha });
}
