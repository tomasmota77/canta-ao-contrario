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
- `fonts/`: Rubik (letra da interface) e Funnel Display/Sans (só no vídeo partilhado), alojadas localmente (OFL).
- `icons/`, `manifest.webmanifest`, `privacy.html` (7 línguas).
- `app/`: projeto Capacitor (Android e iOS). `npm run sync` copia o site para `app/www`.
- `store/`: textos da loja, capturas (geradas com Playwright), vídeos de demonstração, imagem de destaque.

## Fluxo do jogo

- Sozinho: 1 gravar → 2 ouvir ao contrário → 3 imitar → 4 nota (0–100) + partilhar.
- Adivinha (2–8 jogadores, 1–3 rondas cada): 1 grava em segredo → 2 passa o telemóvel → 3 ouve ao contrário →
  4 imita → 5 "O que era?" → 6 revelar (rufar de tambores) → Acertou/Falhou → … → 7 vencedor.
- Jogadores com avatar de bicho (emoji), guardados em `localStorage` `cac-roster`.

## Sistema de design (não quebrar)

- 60/30/10: fundo neutro `--bg` e cartões `--card` (claro e escuro automáticos), tinta `--ink`,
  e a cor da fase (`--phase`) só no botão central, no brilho por trás e no anel de som.
  Fases em `:root[data-phase]`: `rec` laranja, `listen` azul, `result` tinta, `dark` verde.
- Uma família (Rubik), 4 tamanhos (`--fs-cap`, `--fs-body`, `--fs-title`, `--fs-display`) relativos ao
  tamanho de letra do sistema (Dynamic Type), 2 pesos (600 e 800). Grelha de 8 pontos.
- Texto branco só sobre `--brand-btn`, `--ok-btn` ou `--rev` (contraste ≥ 4,5:1); texto laranja usa `--brand-text`.
- Um botão principal (`.btn.primary`) por ecrã, em baixo, na zona do polegar (`#cta`).
- Alvos de toque ≥ 44 pontos; alturas com `min-height` para crescerem com a letra.

## Estado atual

Redesenho feito com as skills `mobile-app-ui-design` e `ios-review`. Da revisão iOS ficaram por fazer
(o dono escolheu só contraste e letra): confirmar antes de sair de uma partida, chips e seletor de rondas
com 44 pontos, "Cancelar"/"Agora não" nas folhas de língua e do microfone, mensagem curta para
microfone recusado (diferente na app e no site), nomes com maiúscula automática e sem corretor.

## Como testar

O Chromium e o Playwright já estão instalados. Para testar o microfone usa
`--use-fake-ui-for-media-stream --use-fake-device-for-media-stream`; para forçar a escolha de ficheiro,
define `navigator.mediaDevices` como `undefined` com `addInitScript`. Os botões grandes "respiram"
(animação), por isso clica com `{ force: true }`. Para testar o modo sem internet, serve a pasta em
`http://localhost` (o service worker não funciona em `file://`).

## Publicar

Commits com `user.name="tomasmota77"`. Depois do push, o GitHub Pages atualiza sozinho
(confirma com `gh api repos/tomasmota77/canta-ao-contrario/actions/runs`).
