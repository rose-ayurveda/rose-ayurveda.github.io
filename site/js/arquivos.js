// Salvar e abrir arquivos no aparelho (cópias de segurança).
import { ehIPhone } from './lembretes.js';

export async function salvarArquivo(texto, nome, tipo = 'application/json') {
  const arquivo = new File([texto], nome, { type: tipo });
  const celular = ehIPhone() || /Android/i.test(navigator.userAgent);
  if (celular && navigator.canShare?.({ files: [arquivo] })) {
    try {
      await navigator.share({ files: [arquivo], title: nome });
      return;
    } catch (erro) {
      if (erro.name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(arquivo);
  const link = Object.assign(document.createElement('a'), { href: url, download: nome });
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// Abre o seletor de arquivos e devolve o conteúdo de texto escolhido.
// O campo fica preso à página enquanto a janela de escolha está aberta: solto, o Chrome
// às vezes o descarta e o arquivo escolhido nunca chega.
export function abrirArquivo(aceitar = '.json,application/json') {
  return new Promise(resolver => {
    const entrada = Object.assign(document.createElement('input'), { type: 'file', accept: aceitar });
    entrada.style.display = 'none';
    document.body.appendChild(entrada);
    entrada.addEventListener('change', async () => {
      const arquivo = entrada.files[0];
      entrada.remove();
      resolver(arquivo ? await arquivo.text() : null);
    });
    entrada.click();
  });
}
