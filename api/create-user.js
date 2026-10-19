const { db, admin } = require('./_firebase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'método não permitido' });
  }

  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ erro: 'não autenticado' });

    const decodificado = await admin.auth().verifyIdToken(token);
    const docChamador = await db.collection('users').doc(decodificado.uid).get();
    const chamador = docChamador.exists ? docChamador.data() : null;

    if (!chamador || chamador.role !== 'admin') {
      return res.status(403).json({ erro: 'só administradores podem criar contas por aqui' });
    }

    const { email, senha, role } = req.body || {};
    if (!email || !senha || !['usuario', 'voluntario', 'admin'].includes(role)) {
      return res.status(400).json({ erro: 'preencha email, senha e um tipo de conta válido' });
    }

    const novoUsuario = await admin.auth().createUser({ email, password: senha });
    await db.collection('users').doc(novoUsuario.uid).set({
      email,
      role,
      aprovado: true,
      criadoEm: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ ok: true });
  } catch (erro) {
    res.status(500).json({ erro: erro.message || 'não foi possível criar a conta' });
  }
};
