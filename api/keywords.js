const { db } = require('./_firebase');

const PALAVRAS_PADRAO = [
  "compartilhe antes que apaguem", "a mídia não mostra isso", "o governo esconde",
  "cura milagrosa", "urgente, compartilhe", "você não vai acreditar",
  "chocante", "bomba", "os cientistas escondem", "isso não é fake news",
  "a vacina mata", "fim do mundo", "exclusivo e chocante", "ninguém está falando disso",
  "compartilhe com todos", "antes que apaguem", "a verdade que escondem de você",
  "100% verdadeiro", "não é fake", "print da conversa"
];

module.exports = async (req, res) => {
  try {
    const refPalavras = db.collection('config').doc('palavras-chave');
    const refIgnoradas = db.collection('config').doc('palavras-ignoradas');

    const [docPalavras, docIgnoradas] = await Promise.all([refPalavras.get(), refIgnoradas.get()]);

    let palavras = PALAVRAS_PADRAO;
    if (!docPalavras.exists) {
      await refPalavras.set({ palavras: PALAVRAS_PADRAO });
    } else {
      palavras = docPalavras.data().palavras || PALAVRAS_PADRAO;
    }

    const ignoradas = docIgnoradas.exists ? (docIgnoradas.data().palavras || []) : [];

    res.status(200).json({ palavras, ignoradas });
  } catch (erro) {
    // se o Firebase falhar, o site continua funcionando com a lista padrão
    res.status(200).json({ palavras: PALAVRAS_PADRAO, ignoradas: [] });
  }
};
