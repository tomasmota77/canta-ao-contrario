# App Android e iPhone

Esta pasta transforma o jogo numa app nativa com o [Capacitor](https://capacitorjs.com).
O jogo continua a ser o mesmo da pasta de cima. A app junta-lhe:

- **microfone nativo**: o Android e o iPhone pedem a permissão como numa app normal;
- **vibração** com o motor do telemóvel (`@capacitor/haptics`);
- **partilha de vídeo** pelo menu do sistema (`@capacitor/share` e `@capacitor/filesystem`);
- botão **voltar** do Android, ecrã de arranque, ícones e ecrã sempre na vertical.

## Preparar (uma vez)

Precisas do [Node.js](https://nodejs.org) 20 ou mais recente.

```bash
cd app
npm install
```

Sempre que mudares o jogo, copia-o para as apps com:

```bash
npm run sync
```

## Android

1. Instala o [Android Studio](https://developer.android.com/studio).
2. Abre o projeto Android:
   ```bash
   npm run android
   ```
3. Para testar, liga o telemóvel por USB e carrega em ▶ (Run).
4. Para publicar: **Build → Generate Signed App Bundle / APK → Android App Bundle**.
   Cria uma chave de assinatura e **guarda-a bem**: sem ela não consegues atualizar a app.
5. Envia o ficheiro `.aab` na [Google Play Console](https://play.google.com/console).

Contas pessoais novas na Play Store têm de fazer um teste fechado com pelo menos
12 pessoas durante 14 dias antes de publicar para toda a gente.

## iPhone

É preciso um Mac com o Xcode, ou um serviço de compilação na nuvem
(por exemplo Codemagic ou Ionic Appflow).

1. No Mac: `npm install`, depois `npm run ios`.
2. No Xcode, em **Signing & Capabilities**, escolhe a tua equipa (Apple Developer Program, 99 $/ano).
3. Para testar, escolhe o teu iPhone e carrega em ▶.
4. Para publicar: **Product → Archive → Distribute App → App Store Connect**.

### Texto do pedido de microfone noutras línguas

O texto está em inglês em `ios/App/App/Info.plist`. Para o traduzir, no Xcode adiciona
as línguas em **Project → Info → Localizations** e cria um ficheiro `InfoPlist.strings`
com a chave `NSMicrophoneUsageDescription` para cada língua, por exemplo:

```
/* pt */  "NSMicrophoneUsageDescription" = "O jogo grava-te a cantar para o pôr ao contrário. O som fica no teu telemóvel.";
/* pt-BR */ "NSMicrophoneUsageDescription" = "O jogo grava você cantando para tocar ao contrário. O áudio fica no seu celular.";
/* es */  "NSMicrophoneUsageDescription" = "El juego te graba cantando para ponerlo al revés. El audio se queda en tu móvil.";
/* fr */  "NSMicrophoneUsageDescription" = "Le jeu t'enregistre pour le passer à l'envers. Le son reste sur ton téléphone.";
/* it */  "NSMicrophoneUsageDescription" = "Il gioco ti registra mentre canti per riprodurlo al contrario. L'audio resta sul telefono.";
/* de */  "NSMicrophoneUsageDescription" = "Das Spiel nimmt dich auf, um es rückwärts abzuspielen. Der Ton bleibt auf deinem Handy.";
```

## Ícones e ecrã de arranque

Os originais estão em `../resources` (`icon.png` 1024×1024 e `splash.png` 2732×2732).
Se os mudares, gera de novo todos os tamanhos com:

```bash
npm run assets
```

## Identificador da app

`io.github.tomasmota77.contrario` (em `capacitor.config.json`). Escolhe o definitivo
**antes** de publicar, porque depois não pode ser mudado.
