# Maiac AI Marketing

Public preview of the Maiac branding, marketing and AI enablement landing page.

Website: https://flaviusapop.github.io/maiac-ai-marketing/

Dependency-free HTML, CSS and JavaScript with self-hosted photographs, artwork and Hanken Grotesk fonts. GitHub Pages serves the root of the main branch; no build step is needed.

## Local preview

Run from this repository folder:

```sh
python -m http.server 8000
```

Then open http://localhost:8000/.

## Contact and outstanding configuration

The contact form is deliberately disconnected. It validates fields locally but does not deliver messages until a genuine handler is set in `data-endpoint` on the form in `index.html`. The real handler must validate input and enforce the website honeypot server-side. No provider has been chosen.

A real privacy policy URL and three case-study destinations are also pending. Work entries remain semantic articles. No analytics is installed. This is a review preview, not a claim of operational form delivery or completed launch configuration.

## Fonts and assets

Hanken Grotesk 400/500 latin and latin-ext files are distributed under SIL Open Font License 1.1; retain `assets/fonts/OFL-LICENSE.txt`. Artwork and photographs are supplied Maiac project assets. No general MIT license is asserted for the site or brand assets.
