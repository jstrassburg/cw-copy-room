# CW Copy Room

An offline-first browser trainer for recognizing International Morse code by sound. Practice individual characters, common amateur-radio CW terms, and realistic QSO transmissions.

## Requirements

- Node.js 22.12 or newer (Node 20.19+ also works)
- Corepack (included with standard Node.js distributions)

The project uses Yarn Berry and pins its Yarn version in `package.json`.

## Run locally

```sh
corepack enable
yarn install
yarn dev
```

Open the local address printed by Vite. The application does not need a backend and makes no network requests while you practice.

## Production build

```sh
yarn build
yarn preview
```

The static build is written to `dist/`. Use `yarn preview` or another local static server; opening `dist/index.html` directly with a `file://` URL is not supported consistently by browsers.

## Checks

```sh
yarn test
yarn lint
yarn build
```

## Practice behavior

- Character and term exercises use typed answers.
- In typed drills, press Enter to check an answer; press Enter again to advance and immediately play the next item.
- Exchange exercises play one transmission from a multi-turn QSO and use reveal-and-self-grade.
- Missed material can be retried during the current session.
- Refreshing starts a new session. Audio settings are retained locally.
- Default timing is 18 WPM character speed with 12 WPM Farnsworth effective speed at 700 Hz.

Audio is synthesized in real time with the Web Audio API; there are no stored audio files.

## Content sources

The bundled library was reviewed on September 28, 2026 using:

- [ITU-R M.1677-1 — International Morse code](https://www.itu.int/rec/R-REC-M.1677-1-200910-I/)
- [ARRL Operating Aids](https://www.arrl.org/operating-aids)
- [ARRL Ham Radio Glossary](https://www.arrl.org/ham-radio-glossary)
- [ARRL Standard for Morse Timing Using the Farnsworth Technique](https://www.arrl.org/files/file/Technology/x9004008.pdf)
- [ARRL NTS MPG — Sending on CW](https://www.arrl.org/files/file/Public%20Service/MPG304A.pdf)

The QSO examples in `INSTRUCTIONS.md` are the primary source for exchange wording.
