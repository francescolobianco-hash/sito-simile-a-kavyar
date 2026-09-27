# Stop Slop

Rules for anyone (human or AI agent) writing copy, docs, code, or UI in this repo.
"Slop" is output that looks plausible but is generic, padded, or unverified.
If a sentence, component, or function could be pasted into any other project unchanged, it probably is slop.

## Prose

### Banned words and phrases

Cut these on sight. There is almost always a plainer word, or no word needed.

- delve, dive into, deep dive, unpack, navigate (figuratively), embark, journey
- tapestry, landscape, realm, ecosystem, testament, beacon, symphony
- seamless, robust, cutting-edge, state-of-the-art, game-changer, revolutionize, elevate, empower, unlock, unleash, supercharge
- leverage (use "use"), utilize (use "use"), facilitate (use "help"/"let")
- "It's important to note that", "It's worth mentioning", "Notably,"
- "In today's fast-paced world", "In the ever-evolving world of…"
- "Whether you're a … or a …"
- "Let's dive in", "Without further ado", "Buckle up"
- "In conclusion", "To sum up", "Ultimately," as a paragraph opener
- "Great question!", "Absolutely!", "Certainly!", "I hope this helps"
- "not just X, but Y" / "It's not X — it's Y" (the fake-contrast reveal)

### Banned structures

- **Rule of three by reflex.** "Fast, reliable, and scalable." List two things if there are two.
- **Em-dash chains.** One per paragraph at most. Prefer a period.
- **Rhetorical question openers.** "Ever wondered how…?" State the point.
- **Summary restating the paragraph above it.** Delete the summary.
- **Hedging stacks.** "might potentially help to possibly improve". Pick one qualifier or none.
- **Emoji bullets and headings** in docs and UI copy. No 🚀 ✨ 💡 ✅.
- **Bold on every other phrase.** Bold only what a skimmer must not miss.
- **Headings for three-line sections.** Use a paragraph.

### What to do instead

- Lead with the fact, the number, or the action. Context after, if needed.
- Use concrete nouns: "photographers submit up to 10 images per call" beats "creatives can showcase their work".
- Write the way you would explain it to a colleague at the next desk.
- Shorter is better when nothing is lost. Read it once more and cut a sentence.

## Product copy (portfolio / submission platform)

This site connects photographers, models, stylists, and MUAs with magazines that publish their work. Copy should sound like it was written by people in that industry.

- Name real things: "submission", "credits", "tear sheet", "editorial", "open call", "deadline", "fee", "acceptance rate".
- Show numbers when we have them (deadline dates, fees, response time). Don't invent them.
- No placeholder testimonials, fake user counts, or made-up publication logos. Leave a visible `TODO` instead.
- Error and empty states say what happened and what to do next: "No open calls match 'bridal'. Clear the filter to see all 42."

## Code

- **No speculative abstractions.** No `BaseService`, `Manager`, `Helper`, or config layer until there is a second caller.
- **No comments that restate the code.** `// increment counter` above `count++` gets deleted. Comment the *why*.
- **No dead scaffolding.** Remove unused imports, commented-out blocks, `console.log`, and empty `try/catch` before committing.
- **No invented APIs.** If you're not sure a function, package, or option exists, check the docs or the source. Don't guess and move on.
- **No silent error swallowing.** `catch (e) {}` is a bug.
- **Match the surrounding code** in naming, structure, and comment density, even if you'd do it differently.
- **Every claim in a PR description is verified.** "Tested locally" means you ran it. Say what you ran.

## UI and design

- No default purple-to-blue gradients, glassmorphism cards, or floating blobs as decoration.
- No stock "diverse team laughing at laptop" imagery. The work on the platform *is* the imagery.
- Photos are the product: let them be large, uncropped where possible, and never covered by text overlays.
- One accent color, used for actions. Everything else is neutral.
- Lorem ipsum never ships. Real or clearly marked placeholder content only.

## Self-check before you commit

1. Search your diff for the banned words above.
2. Delete the first and last sentence of each paragraph you wrote. Did it get worse? If not, keep them deleted.
3. Could this text or component appear unchanged on any other website? Rewrite it so it couldn't.
4. Is every fact, number, and API call something you checked?
