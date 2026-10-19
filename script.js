// Lista usada caso ainda não consiga falar com o servidor
const PALAVRAS_PADRAO = [
  "compartilhe antes que apaguem", "a mídia não mostra isso", "o governo esconde",
  "cura milagrosa", "urgente, compartilhe", "você não vai acreditar",
  "chocante", "bomba", "os cientistas escondem", "isso não é fake news",
  "a vacina mata", "fim do mundo", "exclusivo e chocante", "ninguém está falando disso",
  "compartilhe com todos", "antes que apaguem", "a verdade que escondem de você",
  "100% verdadeiro", "não é fake", "print da conversa"
];

let PALAVRAS = PALAVRAS_PADRAO.slice();
let IGNORADAS = [];
let ultimaAnalise = null;

async function carregarPalavras() {
  try {
    const r = await fetch('/api/keywords');
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data.palavras) && data.palavras.length) PALAVRAS = data.palavras;
      if (Array.isArray(data.ignoradas)) IGNORADAS = data.ignoradas;
    }
  } catch (e) { /* segue usando a lista padrão, sem problema */ }
}
carregarPalavras();

function analisar() {
  const texto = document.getElementById('texto').value.toLowerCase().trim();
  if (!texto) return;

  const encontradas = PALAVRAS
    .filter((p) => texto.includes(p.toLowerCase()))
    .filter((p) => !IGNORADAS.includes(p.toLowerCase()));

  let perc = Math.min(95, encontradas.length * 22 + (encontradas.length > 0 ? 15 : 5));
  if (encontradas.length === 0) perc = 8;

  const resultado = document.getElementById('resultado');
  const fill = document.getElementById('resultFill');
  const percTexto = document.getElementById('percTexto');
  const palavrasEl = document.getElementById('palavrasEncontradas');

  resultado.style.display = 'block';
  fill.style.width = perc + '%';
  fill.style.background = perc > 60 ? '#ff5c5c' : perc > 30 ? '#ffc94d' : '#5cffa0';
  percTexto.textContent = perc + '% de chance de ser fake news';
  palavrasEl.textContent = encontradas.length
    ? 'Sinais de alerta que encontramos: ' + encontradas.join(', ')
    : 'Não encontramos nenhum sinal de alerta nesse texto.';

  document.getElementById('feedbackMsg').textContent = '';
  document.getElementById('btn-acertou').disabled = false;
  document.getElementById('btn-errou').disabled = false;
  ultimaAnalise = { texto, perc, encontradas };
}

async function enviarFeedback(correto) {
  const msg = document.getElementById('feedbackMsg');
  if (!ultimaAnalise) return;

  document.getElementById('btn-acertou').disabled = true;
  document.getElementById('btn-errou').disabled = true;

  try {
    const r = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...ultimaAnalise, correto }),
    });
    msg.textContent = r.ok
      ? 'Valeu! Isso ajuda a gente a ficar mais esperto da próxima vez.'
      : 'Não deu pra salvar seu feedback agora, mas obrigado por avisar!';
  } catch (e) {
    msg.textContent = 'Não deu pra salvar seu feedback agora, mas obrigado por avisar!';
  }

  // atualiza a análise na tela (sem recarregar a página) com a lista mais
  // recente de palavras-chave, caso algum voluntário tenha acabado de mexer nela
  await carregarPalavras();
  analisar();
  document.getElementById('btn-acertou').disabled = true;
  document.getElementById('btn-errou').disabled = true;
}
