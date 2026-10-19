# Combate à Desinformação

Site com detector de fake news por palavras-chave, sistema de contas
(usuário / voluntário / administrador), envio de fotos e vídeos para
análise manual, e um painel onde voluntários "grifam" palavras em textos
reais para ensinar o detector.

## Eu não consigo conectar direto no GitHub/Vercel/Firebase

Não tenho acesso à sua conta em nenhum desses serviços — só consigo deixar
todo o código pronto. Os passos abaixo levam uns 10-15 minutos.

---

## Passo 1 — Firebase (contas, banco de dados e arquivos)

1. Crie um projeto em console.firebase.google.com.
2. Ative 3 coisas no menu lateral:
   - **Authentication** → aba "Sign-in method" → ative **E-mail/senha**.
   - **Firestore Database** → criar banco (modo produção).
   - **Storage** → ativar (é aqui que ficam as fotos/vídeos enviados).
3. Em **Configurações do projeto → Seus apps**, clique no ícone Web (`</>`)
   para criar um app e copiar o objeto `firebaseConfig`. Cole esses valores
   no arquivo `firebase-config.js` do projeto (são dados públicos, não
   precisa esconder).
4. Em **Firestore Database → Regras**, cole o conteúdo do arquivo
   `firestore.rules` deste projeto.
5. Em **Storage → Regras**, cole o conteúdo do arquivo `storage.rules`.
6. Para gerar a chave usada pelas funções do servidor (`api/`), vá em
   **Configurações do projeto → Contas de serviço → Gerar nova chave
   privada**. Guarde esse arquivo `.json`, ele será usado no Passo 3.

### Como criar o primeiro administrador

Não existe nenhum botão no site para virar administrador — é assim de
propósito, por segurança. Depois de criar sua conta normalmente pelo site
(em "Criar conta"), vá até o **Firestore Database** no console do Firebase,
abra a coleção `users`, encontre o documento com o seu e-mail e mude o
campo `role` de `usuario` para `admin`. A partir daí, você já pode entrar
no site e usar o painel `/admin/` para aprovar voluntários, criar outras
contas (inclusive outros admins) e editar textos do site.

---

## Passo 2 — GitHub

Dentro da pasta do projeto (depois de descompactar o zip):
```
git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin LINK_DO_SEU_REPOSITORIO
git push -u origin main
```

---

## Passo 3 — Vercel

1. Em vercel.com → **Add New → Project** → conecte com o GitHub e escolha
   o repositório.
2. Configurações da tela de importação:
   - **Framework Preset:** `Other` (não é React/Next/Vue, é HTML puro + duas funções pequenas de backend).
   - **Build Command:** deixe em branco.
   - **Output Directory:** deixe em branco (padrão).
   - **Install Command:** padrão (`npm install`).
3. Em **Environment Variables**, adicione (usando o `.json` do Passo 1.6):

   | Nome | Valor |
   |---|---|
   | `FIREBASE_PROJECT_ID` | `project_id` do arquivo |
   | `FIREBASE_CLIENT_EMAIL` | `client_email` do arquivo |
   | `FIREBASE_PRIVATE_KEY` | `private_key` do arquivo (cole inteiro) |

4. Clique em **Deploy**. Depois disso, todo `git push` atualiza o site
   sozinho.

---

## Como o site funciona por dentro

- **Detector (`/detector/`)** — compara o texto colado com a lista de
  palavras-chave guardada no Firestore (`config/palavras-chave`). Ao votar
  "acertou"/"errou", o resultado é recalculado na hora, sem recarregar a
  página. Voluntários e admins logados veem ali mesmo um painel para
  adicionar ou remover palavras diretamente.
- **Moderação (`/moderar/`)** — só para voluntários aprovados e admins.
  Mostra os textos que receberam voto "errou" ainda não revisados; a
  pessoa clica nas palavras para marcar sinais de fake news ou sinais de
  verdade, e ao salvar isso atualiza a lista de palavras automaticamente.
  Também mostra as fotos/vídeos enviados pelos usuários, esperando uma
  resposta escrita.
- **Conta (`/account/`)** — qualquer pessoa logada pode enviar uma foto ou
  vídeo para análise manual. A resposta do voluntário aparece ali assim
  que for enviada.
- **Login/Cadastro (`/login/`)** — ao criar conta, a pessoa escolhe entre
  "Usuário" (liberado na hora) ou "Voluntário" (precisa ser aprovado por
  um admin em `/admin/` antes de acessar a moderação).
- **Admin (`/admin/`)** — aprova voluntários, muda o tipo de qualquer
  conta, cria novas contas de qualquer tipo (usando a função
  `api/create-user.js`, que verifica se quem está pedindo é realmente
  admin antes de criar), e edita os textos da página inicial e da página
  "O que é Fake News".

## Testar no seu computador (opcional)

Instale a CLI da Vercel (`npm i -g vercel`) e rode `vercel dev` dentro da
pasta do projeto.
