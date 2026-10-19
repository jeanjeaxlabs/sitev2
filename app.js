import { auth, db } from '/firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.querySelectorAll('.kebab').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelector('.mobile-menu').classList.toggle('aberto');
  });
});

function linkContaHTML(dados) {
  let destino = '/account/';
  if (dados && dados.role === 'admin') destino = '/admin/';
  else if (dados && dados.role === 'voluntario' && dados.aprovado) destino = '/moderar/';
  return `<a href="${destino}">MINHA CONTA</a><a href="#" data-sair>SAIR</a>`;
}

onAuthStateChanged(auth, async (user) => {
  let html = '<a href="/login/">ENTRAR</a>';

  if (user) {
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      html = linkContaHTML(snap.exists() ? snap.data() : null);
    } catch (erro) {
      html = '<a href="/login/">ENTRAR</a>';
    }
  }

  document.querySelectorAll('.nav-account').forEach((el) => (el.innerHTML = html));
  document.querySelectorAll('[data-sair]').forEach((el) => {
    el.addEventListener('click', async (e) => {
      e.preventDefault();
      await signOut(auth);
      location.href = '/index.html';
    });
  });
});
