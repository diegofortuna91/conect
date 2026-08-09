# Service Conect+ — publicar no GitHub Pages e instalar no iPhone

Este pacote deixa o aplicativo no ar num endereço `https`, que é o que o iPhone exige
para liberar **GPS, câmera e o salvamento das auditorias no aparelho**.

Abrir o arquivo direto do e-mail ou do app Arquivos não serve para o teste real: o iOS
roda num visualizador restrito, sem GPS, sem câmera e sem guardar nada.

---

## O que tem nesta pasta

| Arquivo | Para que serve |
|---|---|
| `index.html` | Aplicativo de **campo** — é o que vai para o celular/PDA |
| `painel.html` | **Painel** de indicadores — usado no computador |
| `manifest.webmanifest` / `painel.webmanifest` | Fazem o app instalar na tela de início com nome e ícone |
| `sw.js` | Guarda o app no aparelho para funcionar **sem sinal** |
| `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | Ícone da Service |

Não renomeie nem separe os arquivos: todos precisam ficar na mesma pasta.

---

## Passo 1 — criar a conta e o repositório

1. Entre em <https://github.com> e crie uma conta (pode ser pessoal, é gratuita).
2. Clique no **+** no canto superior direito → **New repository**.
3. Em *Repository name* escreva `conect` (ou o nome que preferir).
4. Marque **Public**. Um repositório privado não publica página no plano gratuito.
5. Clique em **Create repository**.

## Passo 2 — enviar os arquivos

1. Na tela do repositório, clique em **uploading an existing file**
   (ou **Add file → Upload files**).
2. Arraste **todos os arquivos desta pasta** de uma vez.
3. Clique em **Commit changes**.

## Passo 3 — ligar o GitHub Pages

1. No repositório, vá em **Settings** (engrenagem no topo).
2. No menu da esquerda, clique em **Pages**.
3. Em *Source*, escolha **Deploy from a branch**.
4. Em *Branch*, escolha **main** e a pasta **/ (root)**. Clique em **Save**.
5. Espere de 1 a 3 minutos e recarregue a página. Vai aparecer o endereço:

   `https://SEU-USUARIO.github.io/conect/`

Esse é o endereço do **aplicativo de campo**.
O painel fica em `https://SEU-USUARIO.github.io/conect/painel.html`.

## Passo 4 — instalar no iPhone

1. Abra o endereço no **Safari** (precisa ser o Safari; no Chrome do iPhone
   a instalação na tela de início não aparece).
2. Toque no botão **Compartilhar** (o quadrado com a seta para cima).
3. Role e escolha **Adicionar à Tela de Início**.
4. Confirme em **Adicionar**.

Pronto: o ícone da Service aparece na tela do iPhone e o app abre em tela cheia,
sem a barra do navegador.

## Passo 5 — conferir antes de ir para o campo

Na tela de login, toque em **🔎 Testar recursos do aparelho** e confira:

- **Conexão segura (https)** — precisa estar com ✓
- **Salvar registros no aparelho** — precisa estar com ✓
- **Testar GPS** — deve devolver a posição com precisão de até 50 m ao ar livre
- **Testar câmera** — deve abrir a câmera e devolver a foto

Na primeira vez o iPhone pergunta se autoriza a localização: escolha
**Permitir ao usar o app**.

---

## Usar sem sinal na refinaria

Depois de abrir uma vez com internet, o app fica guardado no aparelho.
Dentro da unidade, sem sinal:

- as auditorias são salvas no celular e ficam marcadas como pendentes;
- o GPS continua funcionando (satélite não depende de internet — só a primeira
  fixação demora mais, de 30 a 90 segundos ao ar livre);
- ao voltar para uma área com sinal ou Wi-Fi, os registros já podem ser exportados
  para o painel.

## Liberar os auditores

1. No painel, vá em **⚙ Efetivo** e importe a planilha de Controle do Efetivo.
2. Ainda no Efetivo, clique em **Exportar usuários** — sai o arquivo
   `usuarios_service_conect.json`.
3. No celular de cada auditor, na tela de login, toque em
   **⚙ Carregar lista de usuários** e escolha esse arquivo.
4. Cada pessoa entra com a **matrícula** e a senha inicial, que é a própria matrícula.

## Publicar uma versão nova

Repita o Passo 2 (Add file → Upload files) substituindo os arquivos alterados.
Peça para os auditores fecharem e abrirem o app duas vezes: na primeira ele baixa
a versão nova em segundo plano, na segunda ela entra no ar.
