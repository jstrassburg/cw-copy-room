# CW Word Recognition — Design

## 1. Purpose

Build a local-first browser application for learning to recognize International Morse code by sound, with emphasis on the abbreviations, Q-signals, prosigns, and conversational exchanges used in amateur-radio CW QSOs.

The application has three practice modes:

1. **Characters** — one letter, digit, punctuation mark, or prosign at a time.
2. **Terms** — one common CW word, abbreviation, Q-signal, or prosign at a time.
3. **Exchanges** — one transmission from a realistic multi-turn QSO, followed by its CW transcript and plain-English translation.

The app runs entirely in the browser, synthesizes audio at playback time, and makes no network requests during normal use. No backend or database is needed.

## 2. Goals and non-goals

### Goals

- Practice recognition by ear rather than visual dot/dash memorization.
- Generate clean CW audio at a configurable speed and pitch without stored audio files.
- Include realistic, curated CW vocabulary and full QSO examples.
- Track correct and missed material during a session.
- Allow focused retries of everything missed in the current session.
- Work from a local development server and from a static production build without an internet connection.
- Make the audio engine, grading rules, and content data independently testable.

### Non-goals for the first version

- Sending/keying practice or microphone input.
- User accounts, cloud sync, telemetry, or a server API.
- Simulated propagation effects such as QRM, QRN, QSB, drift, or imperfect keying.
- Wordsworth timing, custom character sets, or other advanced timing modes beyond standard and Farnsworth timing.
- Contest scoring, logging, or callsign lookup.
- Installing as a PWA. The production build is already a self-contained static app; a service worker would add cache-version complexity without helping the primary local-use case.

## 3. Product decisions

### 3.1 Exercise interaction

Character and term drills use typed answers because they are short and can be graded predictably. The user may replay the prompt without penalty, type an answer, and submit it. After submission, the correct answer and meaning are shown.

Exchange drills use reveal-and-self-grade:

1. The app plays one transmission selected from a multi-turn QSO example.
2. The user mentally copies it or writes it outside the app.
3. **Reveal answer** displays the CW transcript and its English translation.
4. The user selects **Got it** or **Missed it**.

Requiring an exact typed copy of a sentence-length transmission would partly measure punctuation, spacing, and typing endurance. Self-grading better matches the intended listening exercise while still supporting missed-item tracking.

### 3.2 Session meaning

A session starts when a mode is selected or when **New session** is used. A session contains:

- the selected mode;
- a shuffled queue of eligible items;
- graded attempt counts;
- a set of currently missed item IDs; and
- whether the user is working through the normal queue or a retry queue.

Changing mode starts a new session after confirmation if the current session has graded attempts. Speed and frequency may change during a session and do not reset statistics.

### 3.3 Scoring

- Replays do not affect the score.
- Each submitted character/term answer or exchange self-grade is one graded attempt.
- The success ratio is `correct attempts / graded attempts`.
- An incorrect item is added to the missed set.
- Correctly completing that item later in **Retry missed** removes it from the missed set, while historical attempt totals remain unchanged.
- **Retry missed** uses a shuffled snapshot of the current missed set. Items missed again remain available for another retry round.
- **New session** clears attempts, the queue, and the missed set, then creates a newly shuffled queue for the current mode.

Session state is intentionally kept only in memory. Refreshing the page starts a new session and clears attempts and missed items. Settings remain persisted separately. **New session** provides the same explicit reset without requiring a refresh.

## 4. User experience

### 4.1 Main practice screen

The app is a single responsive screen with four regions:

- **Header:** app title and settings button.
- **Mode selector:** Characters, Terms, Exchanges.
- **Practice card:** play/replay control, answer interaction, feedback, and next-item control.
- **Session summary:** correct, attempts, ratio, missed count, **Retry missed**, and **New session**.

For character and term modes, focus moves to the answer input when playback finishes. `Enter` submits an answer and advances after feedback; `Space` replays when focus is not in a text field. Buttons retain visible labels rather than relying on icons alone.

For exchange mode, the practice card does not show the scenario title or transcript before reveal because a title such as “asking for a repeat” could disclose the answer. After reveal, it shows the CW transcript, its English translation, and optional scenario context such as “Weak signal QSO, part 4 of 7.”

### 4.2 Feedback

- Correct: show the normalized answer, its meaning where applicable, and a positive visual state.
- Incorrect: show the submitted answer, correct display text, optional Morse representation, and meaning.
- Exchange: after reveal, enable the two self-grade buttons.
- No audio should play automatically on page load; the first sound always follows a user gesture, as required by browser audio policies.

### 4.3 Settings

Settings are available from the practice screen:

| Setting | Default | Range | Step |
| --- | ---: | ---: | ---: |
| Character speed | 18 WPM | 5–40 WPM | 1 WPM |
| Effective speed | 12 WPM | 5 WPM–character speed | 1 WPM |
| Tone frequency | 700 Hz | 300–1,000 Hz | 10 Hz |

Character speed controls the dots, dashes, and gaps inside a character. Effective speed controls the overall rate by lengthening gaps between characters and words using Farnsworth timing. When the two speeds match, playback uses standard Morse spacing.

Effective speed cannot exceed character speed. If the user lowers character speed below the current effective speed, effective speed is lowered to match it. Raising character speed leaves effective speed unchanged. Settings are persisted in local storage and apply to the next playback immediately.

A short **Test tone** action plays a sample such as `VVV` so pitch and speed can be checked without affecting the session.

### 4.4 Empty and boundary states

- **Retry missed** is disabled when no items are currently missed.
- At the end of a normal queue, show the session summary and offer a new shuffled round without clearing statistics, retry missed items, or start a new session.
- At the end of a retry round, show how many items remain missed.
- Invalid or unsupported content is rejected during development rather than silently skipped at runtime.

## 5. Content model

Content lives in version-controlled JSON under `src/data/`; it is bundled into the static application. JSON is chosen so content can be reviewed easily while TypeScript validation protects the runtime.

### 5.1 Characters

`characters.json` contains the symbols the other datasets can use:

```json
{
  "id": "letter-a",
  "display": "A",
  "pattern": ".-",
  "kind": "letter",
  "acceptedAnswers": ["A"]
}
```

The initial set includes A–Z, 0–9, question mark, slash, period, comma, and the procedural signals used by the term and exchange datasets. Prosigns have explicit IDs and continuous patterns; they are not incorrectly rendered as two normally spaced letters.

### 5.2 Terms

`terms.json` contains common on-air vocabulary:

```json
{
  "id": "qrs",
  "display": "QRS",
  "tokens": ["Q", "R", "S"],
  "category": "q-signal",
  "meaning": "Send more slowly / shall I send more slowly?",
  "acceptedAnswers": ["QRS"]
}
```

The initial list should cover, at minimum:

- General abbreviations: `CQ`, `DE`, `TNX`, `TKS`, `TU`, `OM`, `YL`, `R`, `FB`, `FER`, `UR`, `RPRT`, `SIG`, `NAME`, `OP`, `QTH`, `HR`, `HW`, `CPY`, `PSE`, `AGN`, `SRI`, `INFO`, `ANT`, `RIG`, `PWR`, `WX`, `TEMP`, `ES`, `HPE`, `CU`, `CUAGN`, `GUD`, `DX`, `VY`, `NW`, `73`, and `88`.
- Common Q-signals: `QRA`, `QRG`, `QRH`, `QRL`, `QRM`, `QRN`, `QRO`, `QRP`, `QRQ`, `QRS`, `QRT`, `QRU`, `QRV`, `QRX`, `QRZ`, `QSA`, `QSB`, `QSK`, `QSL`, `QSO`, `QSP`, `QSX`, `QSY`, `QTC`, `QTH`, and `QTR`.
- Operating/report terms: `RST`, `QSO`, `QSL`, `QRP`, `EFHW`, `DIPOLE`, `YAGI`, and common time-of-day greetings `GM`, `GA`, `GE`, `GN`.
- Prosigns/procedural signals: `K` (go ahead), `<BK>` (break), `<KN>` (named station only), `<AR>` (end of message), `<SK>` (end of contact), and `<BT>`/`=` (separator). Multi-letter entries store the continuous on-air pattern explicitly.

Duplicate display terms such as `QTH` appear only once, with categories represented as a list if needed. Meanings should be concise listening aids, not exhaustive regulatory definitions.

### 5.3 Exchanges

`exchanges.json` preserves each multi-turn QSO from `INSTRUCTIONS.md` as a scenario, but every transmission is an independently selectable drill item:

```json
{
  "id": "casual-qso",
  "title": "Typical casual QSO",
  "tags": ["beginner", "ragchew"],
  "transmissions": [
    {
      "id": "casual-qso-cq",
      "cw": "CQ CQ CQ DE KD9DIH KD9DIH K",
      "translation": "Calling CQ from KD9DIH. Any station may answer."
    }
  ]
}
```

All transmissions from all seven supplied scenarios are included. At load time they are flattened into the exchange-mode item pool while retaining their scenario ID and position for post-answer context. A small additional set should broaden coverage without making the first release unwieldy: QRM/frequency change, QRZ/multiple callers, weather and equipment, a portable/POTA-style contact, and a concise contest-style signal-report exchange. Any invented callsigns must use clearly fictional examples or callsigns already supplied by the project owner.

Each exercise plays only the selected transmission. Moving to the next part of the source QSO is not automatic; exchange items use the same shuffled queue behavior as character and term items.

### 5.4 CW text grammar

The content parser accepts:

- uppercase A–Z and digits 0–9;
- spaces between words;
- supported punctuation (`?`, `/`, `.`, `,`, `=`); and
- explicit prosigns in angle brackets, such as `<BK>`, `<KN>`, and `<SK>`.

Dataset text should use `<BK>`, `<KN>`, `<AR>`, and `<SK>` when the letters are sent run together. The UI renders these in familiar form (for example, an overline or angle brackets) while the audio engine receives one continuous pattern. `=` is treated as the `<BT>` separator pattern. A build-time validation test fails with the item ID and offending token if content is unsupported.

## 6. Audio synthesis

### 6.1 Web Audio approach

Use the browser Web Audio API:

- one `AudioContext`, created or resumed after a user action;
- an `OscillatorNode` producing a sine wave at the selected frequency;
- a `GainNode` connected to the destination;
- scheduled gain changes to key the oscillator on and off; and
- a short attack/release ramp (about 4 ms, capped relative to dot length) to avoid clicks.

The oscillator can remain running while the practice screen is mounted. Silence is represented by zero gain, so playback does not create hundreds of short-lived oscillator nodes. Starting a new playback cancels pending automation, silences the current tone, and schedules a fresh plan. Component teardown stops and disconnects the nodes.

### 6.2 Timing

Standard PARIS timing is the basis for both normal and Farnsworth playback. At character speed `c` WPM, the duration of one character timing unit is:

```text
character unit = 1.2 / c seconds
dot            = 1 character unit
dash           = 3 character units
within char     = 1 character unit
```

When effective speed `s` equals character speed `c`, standard spacing is used:

```text
between chars = 3 character units
between words = 7 character units
```

When `s < c`, dots, dashes, and intra-character gaps remain at character speed. Only inter-character and inter-word gaps are lengthened. The PARIS standard word contains 31 fixed character units and 19 spacing units, so one Farnsworth spacing unit is:

```text
farnsworth unit = ((60 / s) - (31 * character unit)) / 19 seconds
between chars   = 3 Farnsworth units
between words   = 7 Farnsworth units
```

For the defaults of 18 WPM character speed and 12 WPM effective speed, dots are approximately 66.67 ms, character gaps 463.16 ms, and word gaps 1,080.70 ms. A single-character drill is unaffected by effective speed because it contains no inter-character or inter-word gap.

The scheduler first converts content into a pure semantic sequence: tone events carry character units, while silence events also identify whether they are intra-character, inter-character, or inter-word gaps. A second layer applies the character or Farnsworth unit as appropriate and produces absolute Web Audio timestamps. Keeping parsing, timing, and browser audio separate makes exact unit tests possible.

`requestAnimationFrame` or timers may update visual playback progress, but never drive the sound; all sound timing is scheduled against the audio context clock.

### 6.3 Playback controls and safety

- Play, replay, and stop are explicit actions.
- Controls prevent overlapping prompts.
- Frequency is changed before scheduling a new prompt, not mid-prompt.
- The UI exposes a playing state and progress for assistive technology without continuously announcing every symbol.
- If Web Audio is unavailable or cannot start, show a recoverable inline error; do not count the item as an attempt.

## 7. Answer normalization

Typed answers are normalized by:

1. trimming leading/trailing whitespace;
2. converting to uppercase;
3. collapsing internal whitespace; and
4. mapping friendly prosign forms where relevant (for example, `KN`, `<KN>`, and `KN̅`) to the content item's canonical answer.

No fuzzy matching is used. A typo is a miss, which is appropriate for short recognition prompts. Accepted aliases must be explicit in content rather than hidden in grading code.

The answer input is disabled during feedback to ensure one grade per prompt. Empty submissions are ignored and show validation guidance rather than counting as misses.

## 8. Application architecture

### 8.1 Technology

- Yarn Berry with a checked-in Yarn release/configuration and lockfile.
- Vite, React, and TypeScript.
- React state/reducer plus small custom hooks; no global state library.
- Plain CSS or CSS Modules with design tokens; no component framework is required.
- Vitest and React Testing Library for unit/component tests.
- ESLint and Prettier for static checks and formatting.

The project has no runtime dependencies beyond React. Web APIs provide audio and settings persistence.

### 8.2 Suggested source layout

```text
src/
  app/
    App.tsx
    sessionReducer.ts
  audio/
    AudioEngine.ts
    buildPlaybackPlan.ts
    morse.ts
  components/
    PracticeCard.tsx
    SessionSummary.tsx
    SettingsDialog.tsx
    Transcript.tsx
  data/
    characters.json
    terms.json
    exchanges.json
    validateContent.ts
  hooks/
    useAudioEngine.ts
    usePersistentState.ts
  model/
    content.ts
    session.ts
  styles/
    global.css
```

### 8.3 State model

The session reducer owns deterministic transitions such as:

```text
start session -> present item -> play/replay -> submit/reveal
-> grade -> feedback -> next item -> round complete
                         \-> retry missed round
```

Audio state (`idle`, `playing`, `error`) is maintained separately from learning/session state. An audio failure therefore cannot corrupt a score or advance the queue.

Content objects are immutable. Queue state stores IDs rather than copies, and missed IDs use set semantics so repeated failures do not produce duplicate retry items.

### 8.4 Local persistence

Only settings use a namespaced, versioned local-storage record:

- `cw-recognition.settings.v1`

Reads validate shape and bounds. Corrupt or obsolete values fall back to defaults. Storage failures (private mode, quota, disabled storage) degrade to in-memory settings without blocking practice.

Session state is never written to persistent storage. A page load always initializes a fresh, shuffled session with zero attempts and an empty missed set.

No content, answers, or usage data leave the device.

## 9. Visual and accessibility design

The visual style should resemble a calm radio operating desk: dark neutral background, warm amber accent, large status text, and high contrast. It should avoid novelty “terminal” effects that reduce readability.

- Responsive from a 320 px-wide phone through desktop.
- Touch targets at least 44×44 CSS pixels.
- Semantic buttons, labels, fieldsets, and dialog behavior.
- Visible keyboard focus and logical focus movement.
- Color is never the only correct/incorrect signal.
- Respect `prefers-reduced-motion`.
- Transcript content remains selectable and screen-reader accessible.
- Sliders also have numeric inputs or accessible value text for precise adjustment.

## 10. Testing strategy

### Unit tests

- Every supported symbol maps to the intended Morse pattern.
- Playback plans have correct dot/dash and intra-character/character/word gaps.
- Prosigns have no character gap between their component letters.
- Standard and Farnsworth WPM conversions are exact at representative speed pairs, including the 18/12 WPM defaults and the equal-speed boundary.
- Parser rejects unsupported tokens with useful diagnostics.
- Answer normalization and aliases behave as specified.
- Session reducer updates attempts, ratio, missed IDs, retry rounds, and reset behavior correctly.
- Persistence validation accepts valid records and safely rejects malformed records.

### Component tests

- Character and term submit/feedback flow.
- Single-transmission exchange reveal and self-grade flow.
- Replay does not increment attempts.
- Retry-missed and new-session behavior.
- Character/effective speed constraints, settings bounds, and persistence.
- Keyboard interactions and important accessible names.

### Manual browser checks

- Chrome, Firefox, and Safari audio startup/resume behavior.
- No clicks at tone boundaries and no overlapping playback.
- Static production build works with networking disabled after it has been placed on disk/served locally.
- Mobile layout, keyboard-only flow, and screen-reader smoke test.

Audio quality is partly perceptual, so automated timing tests are necessary but not sufficient.

## 11. Delivery and local operation

Expected commands:

```text
yarn install
yarn dev
yarn test
yarn lint
yarn build
yarn preview
```

The README will explain the required Node version, Yarn/Corepack setup, development use, production build, and offline behavior. Vite will use a relative asset base so the generated `dist/` is portable when served from any local path. Because browser module and audio rules vary for `file://`, the documented production path will use `yarn preview` or another simple local static server rather than promise direct double-click operation.

## 12. Content provenance

The implementation should record source URLs and a “reviewed on” date in a small content-sources section or adjacent metadata. Primary references for the initial dataset and timing are:

- [ITU-R M.1677-1: International Morse code](https://www.itu.int/rec/R-REC-M.1677-1-200910-I/) for characters, signals, and spacing.
- [ARRL: A Standard for Morse Timing Using the Farnsworth Technique](https://www.arrl.org/files/file/Technology/x9004008.pdf) for effective-speed spacing calculations.
- [ARRL Operating Aids](https://www.arrl.org/operating-aids) for commonly used amateur-radio Q-signals and RST context.
- [ARRL Ham Radio Glossary](https://www.arrl.org/ham-radio-glossary) for common terms and prosign descriptions.
- [ARRL NTS MPG — Sending on CW](https://www.arrl.org/files/file/Public%20Service/MPG304A.pdf) for explicit prosign notation and the distinction between run-together prosigns and ordinary letter groups.

The examples supplied in `INSTRUCTIONS.md` are the authoritative starting point for exchange wording. Minor notation changes, such as storing `SK` as `<SK>`, preserve the intended sound while making the encoding unambiguous.

## 13. Acceptance criteria

The first version is complete when:

- It can be installed and run with the documented Yarn commands.
- It performs no network requests during practice.
- All three practice modes can complete a full round.
- Audio is synthesized at the requested frequency with character speed from 5–40 WPM and effective speed from 5 WPM through the selected character speed.
- Farnsworth playback preserves character timing while producing the selected slower effective speed; equal character and effective speeds produce standard Morse spacing.
- Supported prosigns are sounded continuously rather than as separately spaced letters.
- Typed drills grade normalized answers and provide useful feedback.
- Exchange drills play one QSO transmission, reveal both its CW and English, and accept self-grading.
- Missed items can be retried and cleared by later success.
- A new session clears session statistics and missed items but retains settings.
- Settings survive reload when local storage is available, while session statistics and missed items reset on reload.
- Content validation, audio-plan tests, reducer tests, and core UI-flow tests pass.
- The production build works locally without a backend or stored audio assets.

## 14. Confirmed product decisions

The following were confirmed during design review:

1. Exchange drills use reveal-and-self-grade rather than exact typed transcription.
2. Session state does not survive a page refresh; only settings are persisted.
3. An exchange drill consists of one transmission/translation pair from a multi-turn QSO, not the entire QSO.
4. Farnsworth timing is available through a separate effective-speed setting, defaulting to 12 WPM with an 18 WPM character speed.
