# Nerves: how a feeling travels through your body

It opens on a calm loading page (soft colour glows, the title and a spinner), then the page opens from the centre.
Then, type a situation ("I lost my dog", "My crush hugged me"…) and watch:

- the **aura** around the body change colour and rhythm with each emotion,
- **little dots** travel along the nerves (one by one, or many at once), with ripples where they arrive,
- the body **glows from the inside** where you feel the emotion (heart, stomach, head…),
- the **steps** of the journey explained in the drawer of the floating card (drag it by its top bar): senses → thalamus → amygdala / cortex → hormones → heart, lungs, stomach, muscles, face.

Light mode by default, dark mode with the switch at the top right. Fast rhythms pulse more softly
so the light never flashes in your eyes (and everything slows down if your device asks for reduced motion).

Feelings it recognises: sadness, anger, disbelief, fear, joy, love, disgust, surprise, stress, embarrassment, calm,
focus (reading, studying), pain (it finds where it hurts: leg, hand, head, stomach, tooth, back), tiredness, jealousy, pride and boredom.

## How to open it

It is a simple website with no installation. Download the folder and double-click `index.html`.

## Where to change things

| I want to change… | File |
|---|---|
| Colours, speed, rhythm of each emotion, texts, trigger words | `js/emotions.js` |
| Position of the body parts, shape of the silhouette | `js/body.js` |
| Fonts, light / dark colours, page layout | `css/style.css` |
| Title, home page text, example buttons | `index.html` |
| How long the loading page stays | `MIN_SECONDS` in `js/intro.js` |
| Number of nerve strands in the arms, legs, spine | `BUNDLES` in `js/body.js` |

## Put it online for free (GitHub Pages)

On GitHub, go to **Settings → Pages**, choose the branch, folder `/ (root)`, and click **Save**.
After a minute you get a public link to the site.

*A simplified model for learning. It is not medical advice.*
