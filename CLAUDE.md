# Canta ao Contrário

Jogo de festa para telemóvel: grava-se uma frase, ouve-se ao contrário, imita-se, e a imitação
é invertida para ver se a frase original reaparece. Site: https://tomasmota77.github.io/canta-ao-contrario/
(GitHub Pages, ramo `main`, raiz do repositório). O dono fala português de Portugal: responde em PT-PT.

## Estrutura

- `index.html`: todo o HTML e CSS (ecrãs: início `#home`, preparação de jogadores `#setup`, jogo `#app`,
  e folhas `#sheet` ajuda, `#micsheet` microfone, `#langsheet` língua, `#micintro`, `#sharesheet`).
- `js/app.js`: lógica (fases, gravação, reprodução, sons sintetizados, confettis, vídeo para partilhar,
  escolha de microfone, suporte Capacitor via `window.Capacitor.Plugins`).
- `js/i18n.js`: textos em 7 línguas (`pt`, `pt-BR`, `en`, `es`, `fr`, `it`, `de`), frases do modo Sozinho.
  Qualquer texto novo tem de existir nas 7.
- `js/score.js`: pontuação (bandas mel + DTW), `window.CAC_similarity`.
- `sw.js`: modo sem internet. **Aumenta `VERSION` sempre que publicares.**
- `fonts/`: Funnel Display e Funnel Sans alojadas localmente (OFL).
- `icons/`, `manifest.webmanifest`, `privacy.html` (7 línguas).
- `app/`: projeto Capacitor (Android e iOS). `npm run sync` copia o site para `app/www`.
- `store/`: textos da loja, capturas (geradas com Playwright), vídeos de demonstração, imagem de destaque.

## Fluxo do jogo

- Sozinho: 1 gravar → 2 ouvir ao contrário → 3 imitar → 4 nota (0–100) + partilhar.
- Adivinha (2–8 jogadores, 1–3 rondas cada): 1 grava em segredo → 2 passa o telemóvel → 3 ouve ao contrário →
  4 imita → 5 "O que era?" → 6 revelar (rufar de tambores) → Acertou/Falhou → … → 7 vencedor.
- Cores por fase em `:root[data-phase]`: `rec` laranja #FF5B2E, `listen` azul #2E2BF5,
  `result` amarelo #FFE14A, `dark` #170A05.

## Estado atual e próximo passo

O dono acha que o design ainda parece "feito por IA" e quer um **redesenho completo da interface**
usando a skill `mobile-app-ui-design` (e boas práticas das Human Interface Guidelines da Apple e do
Material Design). Mantém o funcionamento, os 7 idiomas, a acessibilidade e o modo sem internet.

## Como testar

O Chromium e o Playwright já estão instalados. Para testar o microfone usa
`--use-fake-ui-for-media-stream --use-fake-device-for-media-stream`; para forçar a escolha de ficheiro,
define `navigator.mediaDevices` como `undefined` com `addInitScript`. Os botões grandes "respiram"
(animação), por isso clica com `{ force: true }`. Para testar o modo sem internet, serve a pasta em
`http://localhost` (o service worker não funciona em `file://`).

## Publicar

Commits com `user.name="tomasmota77"`. Depois do push, o GitHub Pages atualiza sozinho
(confirma com `gh api repos/tomasmota77/canta-ao-contrario/actions/runs`).
