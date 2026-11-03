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
- `fonts/`: Poppins alojada localmente (OFL).
- `icons/`, `manifest.webmanifest`, `privacy.html` (7 línguas).
- `app/`: projeto Capacitor (Android e iOS). `npm run sync` copia o site para `app/www`.
- `store/`: textos da loja, capturas (geradas com Playwright), vídeos de demonstração, imagem de destaque.

## Fluxo do jogo

- Sozinho: 1 gravar → 2 ouvir ao contrário → 3 imitar → 4 nota (0–100) + partilhar.
- Adivinha (2–8 jogadores, 1–3 rondas cada): 1 grava em segredo → 2 passa o telemóvel → 3 ouve ao contrário →
  4 imita → 5 "O que era?" → 6 revelar (rufar de tambores) → Acertou/Falhou → … → 7 vencedor.
- Jogadores (nome e foto opcional) guardados em `localStorage` `cac-roster`.

## Sistema de design (não quebrar)

Inspirado em apps como as que o dono mostrou (corrida com vermelho+lavanda, rankings com pódio).
- Fundo branco `--bg`, superfícies cinzento-claro `--surface`, tinta `--ink`/`--ink-2`; modo escuro automático.
- Vermelho `--red` (#E3134A) para gravar e ações principais; lavanda `--lav` (#6A5AE8) para o som ao contrário
  e destaques; cartão de destaque com `--hero-grad` (gradiente lavanda) e louros brancos.
- Poppins, pesos 500 e 600, 4 tamanhos (`--fs-cap`, `--fs-body`, `--fs-title`, `--fs-display`) relativos à letra do sistema.
- Botões lisos (sem 3D): `.btn.primary` vermelho, `.btn.neutral` cinzento; chips com contorno, escolhido a cheio.
- **Sem emojis.** Jogadores com foto (selfie, guardada só no telemóvel) ou iniciais em cores suaves (`AV_COLORS`).
- Fim do modo Adivinha: pódio 2-1-3 e tabela Posição/Jogador/Pontos. Resultado Sozinho: estatísticas + gráfico.
- Um botão principal por ecrã, em baixo (`#cta`). Alvos de toque ≥ 44 pontos. Contraste de texto ≥ 4,5:1.

## Estado atual

Redesenho (3.ª versão) feito com as skills `mobile-app-ui-design` e `ios-review` e as referências do dono. Da revisão iOS ficaram por fazer
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
