# Página da loja

Tudo o que é preciso para publicar o **Canta ao Contrário** na Google Play e na App Store.

## O que está nesta pasta

| Ficheiro | O que é |
|---|---|
| `pt.md`, `pt-BR.md`, `en.md`, `es.md`, `fr.md`, `it.md`, `de.md` | Textos da loja em cada língua, já dentro dos limites de caracteres |
| `listing.json` | Os mesmos textos, num só ficheiro |
| `screenshots/google-play/<língua>/` | 6 capturas por língua, 1080×1920 |
| `screenshots/app-store/<língua>/` | 6 capturas por língua, 1290×2796 (iPhone 6,7") |
| `video/` | Vídeo de demonstração vertical (sem som) |
| `../resources/icon.png` | Ícone 1024×1024 para as duas lojas |
| `feature-graphic.png` | Imagem de destaque da Google Play (1024×500) |

## Nome

- **"Canta ao Contrário"** não aparece em nenhuma app das lojas (pesquisa feita a 3 de novembro de 2026).
- **"Sing It Backwards"** já existe na App Store, de outro programador. Por isso, usa
  **"Canta ao Contrário"** como nome em todas as línguas e põe a tradução no subtítulo.
- **"Canta al Revés"** já é usado como subtítulo por outra app espanhola.
- Esta pesquisa não substitui uma verificação de marca registada. Antes de investir dinheiro
  no nome, pesquisa no [EUIPO](https://euipo.europa.eu/eSearch/) e no
  [INPI](https://servicosonline.inpi.pt/pesquisas/).

## Respostas para os formulários

**Segurança dos dados (Google Play) e Privacidade da app (App Store)**
- Recolhe dados? **Não.** O som é processado só no telemóvel e nunca é enviado.
- Partilha dados com terceiros? **Não.**
- Rastreio / anúncios / estatísticas? **Não.**
- Política de privacidade: `https://tomasmota77.github.io/canta-ao-contrario/privacy.html`

**Permissões**
- Microfone: para gravar o jogador. Usado só quando a pessoa toca em gravar.

**Classificação etária (questionário IARC e Apple)**
- Sem violência, linguagem imprópria, jogo a dinheiro, compras nem conteúdo de terceiros.
- Interação entre utilizadores dentro da app: **não** (a partilha é feita pelo menu do sistema).
- Resultado esperado: **PEGI 3 / Para todos** e **4+** na Apple.

**Público-alvo (Google Play)**
- Recomendado: **13 anos ou mais**. Se escolheres crianças, a app passa a ter de cumprir o
  programa "Famílias" da Google, que tem regras extra.

## O que tens de ser tu a fazer

1. Criar a conta de programador Google Play (25 $, uma vez) e a do Apple Developer Program (99 $/ano).
2. Gerar a app assinada (instruções em `../app/README.md`) e guardar bem a chave de assinatura.
3. **Google Play:** teste fechado com pelo menos 12 pessoas durante 14 dias, depois pedir produção.
4. **App Store:** enviar pelo Xcode e preencher a ficha.
5. Gravar um vídeo verdadeiro, com a tua voz e de amigos. É o que mais convence no TikTok e na loja.
