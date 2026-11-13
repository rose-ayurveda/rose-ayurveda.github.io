// Datas no fuso da cliente. Um "dia" é guardado como texto "AAAA-MM-DD".

export function chaveDoDia(fuso = 'America/Sao_Paulo', data = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: fuso, year: 'numeric', month: '2-digit', day: '2-digit' }).format(data);
}

export function somarDias(chave, n) {
  const [a, m, d] = chave.split('-').map(Number);
  const data = new Date(Date.UTC(a, m - 1, d + n));
  return data.toISOString().slice(0, 10);
}

export function horaAgora(fuso = 'America/Sao_Paulo') {
  return Number(new Intl.DateTimeFormat('en-GB', { timeZone: fuso, hour: '2-digit', hourCycle: 'h23' }).format(new Date()));
}

// O dia anterior pode ser marcado até o meio-dia seguinte.
export function podeMarcarOntem(fuso) {
  return horaAgora(fuso) < 12;
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const SEMANA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

export function partes(chave) {
  const [a, m, d] = chave.split('-').map(Number);
  return { ano: a, mes: m, dia: d, semana: new Date(Date.UTC(a, m - 1, d)).getUTCDay() };
}

export function dataPorExtenso(chave) {
  const p = partes(chave);
  return `${SEMANA[p.semana]}, ${p.dia} de ${MESES[p.mes - 1]}`;
}

export function nomeDoMes(ano, mes) {
  const nome = MESES[mes - 1];
  return `${nome[0].toUpperCase()}${nome.slice(1)} de ${ano}`;
}

export function diasNoMes(ano, mes) {
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate();
}
