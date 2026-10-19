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

## Menu interaction

The native navigation dialog uses a short, reversible reveal: 180ms on entry and 140ms on exit. Reduced motion skips the reveal. Close and Escape return focus to the actual opener; section links focus their destination, and consultancy actions focus Name.

Scroll locking preserves the document's scroll range and the page/footer stacking order. Keep the full and compact header coordinates, native dialog containment and immediate navigation behavior when maintaining this interaction.

## Footer interaction

The repeated Ma artwork fills the footer across window sizes and responds directly to mouse, pen and single-finger movement, then settles. There is no autoplay. By project direction, this direct interaction remains active when reduced motion is requested; smooth scrolling, work-image zoom and decorative transitions still honor that preference. On touch devices, a single-finger drag or native finger scrolling drives the artwork. Scrolling, link taps and pinch zoom keep their browser behavior; multi-finger gestures suspend deformation. Short windows use a normal-flow footer.

Below900px, four Ma marks replace the eight-mark desktop arrangement. Touch input has a short bounded smoothing bridge and a softer settling response; browser-toolbar height changes retain the current deformation when the artwork geometry is unchanged.

The contour data is derived from the supplied Ma SVG and adds no runtime dependency.

## Contact and outstanding configuration

The contact form is deliberately disconnected. It validates fields locally but does not deliver messages until a genuine handler is set in `data-endpoint` on the form in `index.html`. The real handler must validate input and enforce the website honeypot server-side. No provider has been chosen.

A real privacy policy URL and three case-study destinations are also pending. Work entries remain semantic articles. No analytics is installed. This is a review preview, not a claim of operational form delivery or completed launch configuration.

## Fonts and assets

Hanken Grotesk 400/500 latin and latin-ext files are distributed under SIL Open Font License 1.1; retain `assets/fonts/OFL-LICENSE.txt`. Artwork and photographs are supplied Maiac project assets. No general MIT license is asserted for the site or brand assets.
