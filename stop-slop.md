# Stop Slop

Regole per chiunque (persona o agente AI) scriva testi, documentazione, codice o interfacce in questo repo.
Lo "slop" è un output che sembra plausibile ma è generico, gonfiato o non verificato.
Se una frase, un componente o una funzione si potrebbe incollare così com'è in qualsiasi altro progetto, probabilmente è slop.

## Testi

### Parole ed espressioni vietate

Tagliale appena le vedi. Quasi sempre esiste una parola più semplice, oppure non serve nessuna parola.

- immergiamoci, addentriamoci, approfondiamo, esploriamo insieme, viaggio (in senso figurato)
- panorama, ecosistema, universo, mondo (come in "nel mondo della fotografia"), testimonianza, faro, sinfonia
- senza soluzione di continuità, fluido, robusto, all'avanguardia, rivoluzionario, innovativo, game-changer
- elevare, potenziare, sbloccare, liberare il potenziale, dare vita a, portare al livello successivo
- sfruttare / avvalersi di / utilizzare (scrivi "usare"), facilitare (scrivi "aiutare" o "permettere")
- "È importante notare che", "Vale la pena sottolineare", "Degno di nota"
- "Nel mondo frenetico di oggi", "Nel panorama in continua evoluzione di…"
- "Che tu sia un … o un …"
- "Senza ulteriori indugi", "Allacciate le cinture", "Partiamo!"
- "In conclusione", "Per riassumere", "In definitiva" all'inizio di un paragrafo
- "Ottima domanda!", "Assolutamente!", "Certamente!", "Spero ti sia utile"
- "non solo X, ma anche Y" / "Non è X: è Y" (il finto colpo di scena)

### Strutture vietate

- **Tre elementi per riflesso.** "Veloce, affidabile e scalabile." Se le cose sono due, elencane due.
- **Catene di trattini lunghi (—).** Al massimo uno per paragrafo. Meglio un punto.
- **Domande retoriche in apertura.** "Ti sei mai chiesto come…?" Vai dritto al punto.
- **Riassunti che ripetono il paragrafo precedente.** Cancella il riassunto.
- **Cautele accumulate.** "potrebbe forse contribuire a migliorare eventualmente". Un solo condizionale, o nessuno.
- **Emoji in elenchi e titoli** di documentazione e interfaccia. Niente 🚀 ✨ 💡 ✅.
- **Grassetto ovunque.** Solo su ciò che chi legge in fretta non deve perdere.
- **Titoli per sezioni di tre righe.** Usa un paragrafo.
- **Anglicismi inutili.** "Fare il submit", "customizzare", "performante": esiste l'italiano. Tieni solo i termini di settore davvero in uso (vedi sotto).

### Cosa fare invece

- Parti dal fatto, dal numero o dall'azione. Il contesto dopo, se serve.
- Usa sostantivi concreti: "i fotografi inviano fino a 10 immagini per call" è meglio di "i creativi possono mettere in mostra il loro lavoro".
- Scrivi come lo spiegheresti a un collega alla scrivania accanto.
- Più corto è meglio, se non si perde nulla. Rileggi una volta e taglia una frase.

## Testi del prodotto (piattaforma di portfolio e invio lavori)

Il sito mette in contatto fotografi, modelle e modelli, stylist e truccatori con le riviste che pubblicano il loro lavoro. I testi devono sembrare scritti da persone del settore.

- Chiama le cose col loro nome: "invio", "crediti", "tear sheet", "editoriale", "open call", "scadenza", "quota", "tasso di accettazione".
- Mostra i numeri quando li abbiamo (date di scadenza, quote, tempi di risposta). Non inventarli.
- Niente testimonianze segnaposto, numeri di utenti inventati o loghi di riviste finti. Lascia un `TODO` visibile.
- Gli stati di errore e vuoti dicono cosa è successo e cosa fare: "Nessuna open call corrisponde a 'sposa'. Rimuovi il filtro per vederle tutte e 42."

## Codice

- **Niente astrazioni preventive.** Nessun `BaseService`, `Manager`, `Helper` o livello di configurazione finché non c'è un secondo chiamante.
- **Niente commenti che ripetono il codice.** `// incrementa il contatore` sopra `count++` va cancellato. Commenta il *perché*.
- **Niente impalcature morte.** Togli import inutilizzati, blocchi commentati, `console.log` e `try/catch` vuoti prima del commit.
- **Niente API inventate.** Se non sei sicuro che una funzione, un pacchetto o un'opzione esista, controlla la documentazione o il sorgente. Non tirare a indovinare.
- **Niente errori ingoiati in silenzio.** `catch (e) {}` è un bug.
- **Adeguati al codice circostante** per nomi, struttura e densità dei commenti, anche se tu faresti diversamente.
- **Ogni affermazione nella descrizione di una PR è verificata.** "Testato in locale" significa che l'hai eseguito. Scrivi cosa hai eseguito.

## Interfaccia e design

- Niente sfumature viola-blu di default, card in stile glassmorphism o macchie fluttuanti come decorazione.
- Niente foto stock di "team eterogeneo che ride davanti al portatile". Le immagini della piattaforma *sono* il lavoro degli utenti.
- Le foto sono il prodotto: grandi, non ritagliate dove possibile, mai coperte da testo in sovrimpressione.
- Un solo colore d'accento, usato per le azioni. Tutto il resto neutro.
- Il lorem ipsum non va mai in produzione. Solo contenuti reali o segnaposto chiaramente indicati.

## Controllo prima del commit

1. Cerca nel tuo diff le parole vietate elencate sopra.
2. Elimina la prima e l'ultima frase di ogni paragrafo che hai scritto. È peggiorato? Se no, lasciale eliminate.
3. Questo testo o componente potrebbe comparire identico su un altro sito? Riscrivilo in modo che non possa.
4. Ogni fatto, numero e chiamata API è qualcosa che hai verificato?
