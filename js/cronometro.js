// Cronômetro de preparo (chás e receitas), com um sino suave no fim.

let audio = null;

// Sino sintetizado no próprio celular: sem gravação e sem direitos autorais.
export function tocarSino(volume = 0.35) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const agora = audio.currentTime;
    for (const [freq, ganho, duracao] of [[528, 1, 4], [1056, 0.35, 2.5], [1584, 0.15, 1.6]]) {
      const osc = audio.createOscillator();
      const g = audio.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, agora);
      g.gain.exponentialRampToValueAtTime(volume * ganho, agora + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, agora + duracao);
      osc.connect(g).connect(audio.destination);
      osc.start(agora);
      osc.stop(agora + duracao);
    }
    navigator.vibrate?.([200, 100, 200]);
  } catch { /* sem som disponível */ }
}

function formatar(segundos) {
  const s = Math.max(0, Math.ceil(segundos));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function cronometroHTML(id, opcoes) {
  return `
    <div class="cronometro" data-cronometro="${id}">
      <div class="opcoes" style="grid-template-columns:repeat(${opcoes.length},1fr)" role="group" aria-label="Tempo de preparo">
        ${opcoes.map((o, i) => `<button type="button" data-minutos="${o.minutos}" aria-pressed="${i === 0}">${o.nome}</button>`).join('')}
      </div>
      <p class="tempo" aria-live="polite">${formatar(opcoes[0].minutos * 60)}</p>
      <button type="button" class="botao" data-acao="iniciar">Iniciar</button>
    </div>`;
}

// Liga todos os cronômetros da tela. Devolve uma função que para todos.
export function ligarCronometros(raiz) {
  const paradas = [];
  raiz.querySelectorAll('[data-cronometro]').forEach(caixa => {
    const visor = caixa.querySelector('.tempo');
    const botao = caixa.querySelector('[data-acao]');
    let minutos = Number(caixa.querySelector('[data-minutos]').dataset.minutos);
    let fim = null;
    let restante = minutos * 60;
    let timer = null;

    const parar = () => { clearInterval(timer); timer = null; };
    paradas.push(parar);
    const atualizar = () => {
      restante = (fim - Date.now()) / 1000;
      visor.textContent = formatar(restante);
      if (restante <= 0) {
        parar();
        visor.textContent = 'Pronto';
        botao.textContent = 'Recomeçar';
        tocarSino();
      }
    };

    caixa.querySelectorAll('[data-minutos]').forEach(b => b.addEventListener('click', () => {
      parar();
      minutos = Number(b.dataset.minutos);
      restante = minutos * 60;
      visor.textContent = formatar(restante);
      botao.textContent = 'Iniciar';
      caixa.querySelectorAll('[data-minutos]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    }));

    botao.addEventListener('click', () => {
      if (timer) {                       // pausar
        parar();
        botao.textContent = 'Continuar';
        return;
      }
      if (restante <= 0) restante = minutos * 60;
      tocarSino(0.05); // libera o som no iPhone (precisa de um toque)
      fim = Date.now() + restante * 1000;
      botao.textContent = 'Pausar';
      timer = setInterval(atualizar, 250);
      atualizar();
    });
  });
  return () => paradas.forEach(p => p());
}
