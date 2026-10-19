const { db, admin } = require('./_firebase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'método não permitido' });
  }

  try {
    const { texto, perc, encontradas, correto } = req.body || {};
    if (typeof texto !== 'string' || !texto.trim()) {
      return res.status(400).json({ erro: 'texto inválido' });
    }

    await db.collection('feedback').add({
      texto,
      perc,
      encontradas: encontradas || [],
      correto: !!correto,
      revisado: false,
      criadoEm: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ ok: true });
  } catch (erro) {
    res.status(500).json({ erro: 'não foi possível salvar o feedback agora' });
  }
};
