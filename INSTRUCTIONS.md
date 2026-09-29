# Overview

Your goal is to produce a web application that can be run locally to practice Amateur Radio CW Morse Code. This app isn't to practice keying the letters and numbers and special characters, however. The app is used to practice hearing shorthand words commonly used during Amateur Radio CW QSOs (CQ, DE, TNX, TU, OM, RST, QRZ, QSL, etc...). 

## Technical

- A simple web app that can be run locally, not connected to any network.
- Choose React and Yarn Berry w/Vite for the frontend.
- If you think you need a backend, use Python FastAPI and use `uv` for deps. I don't think you'll need a backend for this.
- Choose a technique of playing sound that doesn't involve storing wav/mp3 or other audio file formats. The app should be able to take a string, 'NAME' and produce the Morse code tones.

## Features

- Research and build a list of common shorthand words used in CW QSOs [I have some ideas later, but expand on those]. Store that list as a simple file in the app (text, json, yaml, whatever). No db.
- Also compile a list of common exchanges. Store the same way.
- User can choose between hearing and guessing single characters, single words, or entire exchanges.
- The app will keep track of the missed characters/words/exchanges and the user will have the ability to retry just the missed ones in the session.
- There will be an option to start a new session - this will clear out the success ratio, and missed term storage.

## Settings

- Ability to change the words-per-minute of the exchange (default 18 WPM, choose a reasonable range).
- Ability to change the frequency of the code (default 700 Hz, choose a reasonable range).

## Example Exchanges

Use these as examples (starting point) to build the exchange and single-word lists. They contain the call and the answer and the English translation. When working with full exchanges, when showing the "answer" also show the translation.

### Exchange 1 — very typical casual QSO

CW
CQ CQ CQ DE KD9DIH KD9DIH K
Answer
Calling CQ from KD9DIH. Any station may answer.
CW
KD9DIH DE W8ABC W8ABC K
Answer
KD9DIH, this is W8ABC. Go ahead.
CW
W8ABC DE KD9DIH = GE TNX FER CALL = UR RST 579 579 = QTH WI WI = HW CPY? W8ABC DE KD9DIH KN
Answer
Good evening. Thanks for the call. Your RST is 579. My QTH is Wisconsin. How are you copying me? W8ABC, back to you only.
CW
KD9DIH DE W8ABC = GE OM TNX RPRT = UR RST 589 589 = QTH OH OH = NAME BOB BOB = KD9DIH DE W8ABC KN
Answer
Good evening. Thanks for the report. Your RST is 589. My QTH is Ohio. My name is Bob. Back to you.
CW
W8ABC DE KD9DIH = R FB BOB TNX = 73 ES HPE CUAGN = W8ABC DE KD9DIH KN
Answer
Roger, fine business Bob, thanks. Best regards and hope to see you again. Back to you.
CW
KD9DIH DE W8ABC = TU FER QSO = 73 JIM = KD9DIH DE W8ABC SK
Answer
Thank you for the QSO. Best regards, Jim. End of contact.

### Exchange 2 — rig, antenna, and power

CW
CQ CQ CQ DE KD9DIH KD9DIH K
Answer
General CQ.
CW
KD9DIH DE K4RLC K
Answer
K4RLC answering you.
CW
K4RLC DE KD9DIH = GM TNX CALL = UR RST 599 599 = NAME JIM = QTH WI = RIG FT710 PWR 50W = ANT EFHW = HW? K4RLC DE KD9DIH KN
Answer
Good morning. Thanks for the call. You are 599. Name is Jim, QTH Wisconsin. Rig is an FT-710, running 50 watts, antenna is an end-fed half-wave. How copy?
CW
KD9DIH DE K4RLC = R FB JIM = UR 589 589 = NAME TOM = QTH TN = RIG K3 PWR 100W = ANT DIPOLE UP 40 FT = FB SIG = KD9DIH DE K4RLC KN
Answer
Roger, fine business Jim. You are 589. Name Tom, QTH Tennessee. Rig is a K3 at 100 watts. Antenna is a dipole 40 feet up. Fine signal.
CW
K4RLC DE KD9DIH = FB TOM TNX INFO = NICE SIG HR = TNX QSO 73 K4RLC DE KD9DIH SK
Answer
Fine business Tom, thanks for the information. Nice signal here. Thanks for the QSO and 73. End contact.

### Exchange 3 — weak signal, fading, and asking for a repeat

CW
CQ CQ CQ DE KD9DIH KD9DIH K
Answer
Calling CQ.
CW
KD9DIH DE W3MTR W3MTR K
Answer
W3MTR answering.
CW
W3MTR DE KD9DIH = TNX CALL = UR RST 449 449 = SIG QSB = NAME JIM = QTH WI = HW? W3MTR DE KD9DIH KN
Answer
Thanks for the call. You are 449. Your signal is fading. Name Jim, QTH Wisconsin. How copy?
CW
KD9DIH DE W3MTR = R R = UR 559 559 = SRI QSB HR ALSO = NAME ? NAME ? PSE AGN BK
Answer
Roger. You are 559. Sorry, there is fading here too. Please repeat your name. Break.
CW
BK NAME JIM JIM = JIM BK
Answer
Break. Name is Jim, Jim. Break.
This is a good one to practice because BK is commonly used for a rapid exchange without repeating both callsigns every time. ARRL's operating guide specifically describes this use. ARRL
CW
BK R R JIM TNX = NAME HR DAVE DAVE = QTH PA = BK
Answer
Roger, got it, Jim. Thanks. My name is Dave, QTH Pennsylvania. Break.
CW
BK R DAVE TNX = QSB BAD NW = TNX QSO 73 ES GUD DX = W3MTR DE KD9DIH SK
Answer
Roger Dave, thanks. Fading is bad now. Thanks for the QSO, 73, and good DX. End contact.

### Exchange 4 — "please slow down"

CW
CQ CQ CQ DE KD9DIH KD9DIH K
Answer
Calling CQ.
CW
KD9DIH DE N2XYZ N2XYZ K
Answer
N2XYZ responds.
CW
N2XYZ DE KD9DIH = GE TNX CALL = PSE QRS QRS = NEW CW OP HR = N2XYZ DE KD9DIH KN
Answer
Good evening, thanks for the call. Please send slower. I'm a new CW operator here. Back to you.
QRS means send slower. ARRL
CW
KD9DIH DE N2XYZ = R R QRS = NO PROB OM = UR RST 579 = NAME MIKE = QTH NY = HW? KD9DIH DE N2XYZ KN
Answer
Roger, slowing down. No problem. You are 579. Name Mike, QTH New York. How copy?
CW
N2XYZ DE KD9DIH = R FB MIKE = UR RST 589 = TNX FER QRS = NAME JIM QTH WI = N2XYZ DE KD9DIH KN
Answer
Roger, fine business Mike. You are 589. Thanks for slowing down. Name Jim, QTH Wisconsin.
CW
KD9DIH DE N2XYZ = FB JIM = KEEP CW = CUAGN 73 KD9DIH DE N2XYZ SK
Answer
Fine business Jim. Keep at CW. See you again, 73. End contact.

### Exchange 5 — short "rubber stamp" DX contact

CW
CQ CQ DX DE DL7ABC DL7ABC K
Answer
DL7ABC in Germany is calling CQ DX.
CW
DL7ABC DE KD9DIH KD9DIH K
Answer
KD9DIH answering.
CW
KD9DIH DE DL7ABC = GM UR 559 559 = QTH BERLIN = OP HANS = KD9DIH DE DL7ABC KN
Answer
Good morning. You are 559. QTH Berlin. Operator Hans. Back to you.
CW
DL7ABC DE KD9DIH = R TNX HANS = UR 579 579 = QTH WI = OP JIM = TNX QSO 73 DL7ABC DE KD9DIH KN
Answer
Roger, thanks Hans. You are 579. QTH Wisconsin. Operator Jim. Thanks for the QSO, 73.
CW
KD9DIH DE DL7ABC = TU 73 SK
Answer
Thank you, 73, end contact.

### Exchange 6 — QRN and asking for missed information

CW
W1MOR DE KD9DIH = GE = UR RST 559 = QRN HR = NAME JIM = QTH WI = HW? W1MOR DE KD9DIH KN
Answer
Good evening. You're 559. I have static here. Name Jim, QTH Wisconsin. How copy?
CW
KD9DIH DE W1MOR = R JIM = UR 579 = NAME AL = QTH VT = WX COLD TEMP 35F = KD9DIH DE W1MOR KN
Answer
Roger Jim. You're 579. Name Al, QTH Vermont. Weather is cold, temperature 35°F.
CW
W1MOR DE KD9DIH = SRI QRN = QTH? QTH? PSE AGN BK
Answer
Sorry, static interference. Please repeat your QTH. Break.
CW
BK QTH VT VT = VERMONT BK
Answer
QTH Vermont, Vermont. Break.
CW
BK R R VT = TNX AL = WX HR CLR ES 50F = TNX QSO 73 W1MOR DE KD9DIH SK
Answer
Roger, Vermont copied. Thanks Al. Weather here is clear and 50°F. Thanks for the QSO, 73, end contact.

### Exchange 7 — QRP contact

CW
CQ CQ CQ DE KD9DIH/QRP KD9DIH/QRP K
Answer
KD9DIH calling CQ while operating QRP.
CW
KD9DIH/QRP DE K8CW K
Answer
K8CW answers.
CW
K8CW DE KD9DIH/QRP = TNX CALL = UR 579 = PWR HR 5W 5W = RIG FT710 = ANT DIPOLE = HW? K8CW DE KD9DIH/QRP KN
Answer
Thanks for the call. You are 579. I'm running 5 watts, using an FT-710 and dipole. How copy?
CW
KD9DIH/QRP DE K8CW = FB JIM = UR 559 559 = GUD SIG FER 5W = PWR HR 100W = ANT YAGI = KD9DIH/QRP DE K8CW KN
Answer
Fine business Jim. You are 559. Good signal for 5 watts. I'm running 100 watts into a Yagi.
CW
K8CW DE KD9DIH/QRP = R TNX FB RPRT = 73 ES GUD DX = K8CW DE KD9DIH/QRP SK
Answer
Roger, thanks for the good report. 73 and good DX. End contact.