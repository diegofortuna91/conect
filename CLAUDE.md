# Service Conect+

Plataforma de gestão do contrato da SERVICE ENGENHARIA na Refinaria de
Mataripe (Acelen). Tudo são páginas HTML de arquivo único, sem etapa de
build, sem framework, servidas pelo GitHub Pages em
`https://diegofortuna91.github.io/conect/`.

O dono é o Diego Fortuna, coordenação de SMS. Fale em português.

## As páginas

| arquivo | o que é |
|---|---|
| `index.html` | aplicativo de campo do auditor (celular, funciona sem sinal) |
| `painel.html` | painel de indicadores de SMS |
| `frotas.html` | **gerado** — gestão de frotas (Cobli) |
| `sw.js` | service worker: guarda o app inteiro no aparelho |

Firebase compat 10.14.1: Auth (e-mail sintético `{matrícula}@conect.service`)
e Firestore, projeto `service-conect-f075c`. Leaflet 1.9.4 vai **embutido**
no arquivo, nunca de CDN — dentro da refinaria o acesso externo é bloqueado.

## Regras que não se negociam

1. **Não mexa no módulo de SMS.** `index.html` e `painel.html` são outro
   assunto. Frotas é página separada. Se precisar de algo do painel,
   recorte na geração, não edite o painel.
2. **O `frotas.html` não se edita.** Edite `frotas/frotas-fonte.html` e
   rode `python3 frotas/frotas-gerar.py`. O gerador injeta o Leaflet e o
   logotipo recortados do `painel.html`, então a marca tem uma verdade só.
3. **Ao publicar, suba o número do cache no `sw.js`** (`const CACHE =
   'connect-vNN'`). Sem isso o aparelho continua servindo a versão velha
   e parece que a mudança não foi. Já aconteceu.
4. **O proxy da Cobli é somente leitura.** Só aceita GET, e nenhuma rota
   cria, altera ou apaga nada — mesmo que a chave permita.
5. **A chave da Cobli nunca entra no HTML.** Ela mora como secret no
   Cloudflare Worker. O navegador nunca a vê.

## Como publicar

`git push` daqui costuma falhar: o repositório é público mas não há
credencial configurada. Até hoje a publicação foi pelo **upload web do
GitHub**, o que cria commits equivalentes com hashes diferentes — por
isso o clone local vive "à frente" da origin sem nada de fato pendente.
Confira com `git diff --stat main origin/main` (vazio = árvores iguais) e
realinhe com `git reset --hard origin/main`.

**A primeira coisa a resolver no Claude Code é isto**: `gh auth login` na
máquina do Diego, e aí `git push` passa a funcionar.

## Os testes

Servidor estático primeiro:

```bash
cd repo && python3 -m http.server 8899 &
node frotas/teste-frotas.js     # 124 verificações, Playwright
node frotas/teste-proxy.mjs     # 54 verificações, Node puro
```

`teste-proxy.mjs` monta tokens RS256 falsos e um `fetch` de mentira: não
toca na Cobli de verdade. `teste-frotas.js` roda a página em `?sim=1`,
com dados simulados que imitam o formato real da Cobli.

Os testes não são enfeite. Vários defeitos reais foram pegos por eles.

## O módulo de Frotas

- `frotas/frotas-fonte.html` — a fonte da página
- `frotas/frotas-gerar.py` — monta o `repo/frotas.html`
- `frotas/proxy/src/worker.js` — o Cloudflare Worker (29 rotas)
- `frotas/01-MAPA-DA-API-COBLI.md` — o levantamento da API
- `frotas/patches/` — os passos aplicados à fonte, em ordem

Proxy: `https://conect-frota.diegofortuna91.workers.dev`, rota de
diagnóstico `/frota/saude` (não exige login).

### As armadilhas da API da Cobli

A documentação não publica o corpo de várias respostas. O que está aqui
foi medido contra a API, não lido:

**Quatro formatos de data, por endpoint:**

| formato | onde |
|---|---|
| `2026-10-19` | risk-events, distance-driven |
| `2026-10-19T00:00:00-03:00` | motor ocioso, ranking, multas |
| `2026-10-19 00:00:00` | **mídias de câmera** (espaço, sem fuso) |
| epoch em milissegundos | `/herbie-1.1/stats/*` |

**O fim do período em `/public/v1/risk-events` é EXCLUSIVO.** Pedir de
20/10 a 20/10 devolve zero; pedir "até hoje" esconde o dia de hoje
inteiro. O proxy manda o dia seguinte. **O relatório de distância usa o
mesmo formato de data e é inclusivo** — não generalize.

**`pagination.next` vem sempre preenchido**, mesmo quando não há próxima
página. Não dá para usar como condição de parada.

**As mídias de câmera** devolvem `datetime`, `type`, `severity`,
`media_status`, e o gatilho dentro de `details.event_trigger`. Veículo e
motorista vêm como UUID — a tela traduz pelo cadastro. O link do vídeo
está em `data.media_url` e **vale 5 minutos**, então é pedido na hora de
abrir e nunca guardado. Não existe transmissão ao vivo na API pública.

**Alertas** aceitam no máximo 31 dias de janela e exigem `ruleId` ou
`eventId`. **Quilometragem** exige a lista de veículos; o proxy busca
sozinho quando a tela não manda. **Obstrução de câmera** não aceita
janela maior que **7 dias** — a tela olha os últimos sete e diz isso
no quadro.

**Relatórios que não servem:** `/herbie-1.1/stats/reports/out-of-work/`
devolve uma **planilha .xlsx** mesmo com `Accept: application/json`. Por
isso não há rota para "fora do horário": a tela calcula isso dos
trechos. O endpoint de velocidade POR VEÍCULO existe e responde, mas
devolve zero — o limite por veículo não está cadastrado nesta frota.

**O que veio do painel da Cobli** (percorrido em 21/10/2026): o painel
deles usa Google Maps, abre no mapa de ruas e alterna para satélite. Os
indicadores que valeram a viagem e hoje estão no módulo: excesso de
velocidade da via, km por evento, tempo em cada local de interesse,
obstrução de câmera, rodando sem motorista e atividade fora do horário.
Ficou de fora, de propósito: despesas e cartão de combustível (não são
usados) e roteirização de entregas (não é o caso do contrato). Ficou
pendente: **tratativas de ocorrência** — a Cobli tem o fluxo e nenhuma
foi criada; é o que mais combina com a auditoria comportamental do SMS,
e o lugar natural dele é o Firestore, não a Cobli.

### Como a frota está hoje

5 veículos no cadastro, 6 rastreadores (um sem placa, parado em São
Paulo há semanas). **Só 3 têm câmera.** ~230 desvios em 30 dias, a
maioria distração ao volante, com um veículo respondendo por quase um
terço. O rastreador não identifica o motorista (vem nulo nos trajetos),
mas **a câmera identifica** — é por ela que o nome aparece nos desvios
filmados.

## Pendente

- **`MATRICULAS_FROTA` está vazia no Worker.** Qualquer um dos 87
  usuários logados no Conect+ consulta a API da frota se souber o
  endereço do proxy. Falta o Diego passar as matrículas da coordenação.
- **Girar a chave da Cobli.** A atual circulou em conversa.
- **Auditar as regras do Firestore.** Nunca foi feito, e é a única coisa
  que protege os dados do SMS.
- Migrar o repositório para uma organização da Service (hoje é público e
  pessoal).
- Relatório mensal em PDF; integração com o Fluig.

## Como trabalhar aqui

Comentário explica **por que**, não o que a linha faz. Vários comentários
deste código registram uma armadilha que custou caro descobrir — não os
apague por serem "óbvios".

Nomes em português, como o resto do sistema.

Antes de dizer que algo está pronto: rodou os testes, gerou o arquivo,
publicou e **conferiu no ar**?
