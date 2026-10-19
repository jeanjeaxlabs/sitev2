import { auth, db } from '/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, getDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const painel = document.getElementById('painel-palavras');
const lista = document.getElementById('lista-palavras');
const inputNova = document.getElementById('nova-palavra');
const botaoAdd = document.getElementById('add-palavra');

function podeGerenciar(dados) {
  if (!dados) return false;
  if (dados.role === 'admin') return true;
  return dados.role === 'voluntario' && dados.aprovado === true;
}

const REF_PALAVRAS = doc(db, 'config', 'palavras-chave');

onAuthStateChanged(auth, async (user) => {
  if (!user) { painel.style.display = 'none'; return; }

  const snap = await getDoc(doc(db, 'users', user.uid));
  if (!podeGerenciar(snap.exists() ? snap.data() : null)) {
    painel.style.display = 'none';
    return;
  }

  painel.style.display = 'block';

  onSnapshot(REF_PALAVRAS, (docSnap) => {
    const palavras = docSnap.exists() ? (docSnap.data().palavras || []) : [];
    lista.innerHTML = '';
    palavras.forEach((p) => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = p;
      const btn = document.createElement('button');
      btn.textContent = 'remover';
      btn.onclick = () => updateDoc(REF_PALAVRAS, { palavras: arrayRemove(p) });
      li.appendChild(span);
      li.appendChild(btn);
      lista.appendChild(li);
    });
  });

  botaoAdd.onclick = () => {
    const valor = inputNova.value.trim().toLowerCase();
    if (!valor) return;
    updateDoc(REF_PALAVRAS, { palavras: arrayUnion(valor) });
    inputNova.value = '';
  };
});
