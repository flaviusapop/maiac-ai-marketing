# Maiac AI Marketing

Maiac branding, marketing and AI enablement website. Dependency-free HTML, CSS and JavaScript with self-hosted photographs, artwork and Hanken Grotesk fonts. GitHub Pages serves the root of main with no build step.

The repository preserves the existing CNAME for maiac.agency. Custom-domain availability depends on its DNS and HTTPS configuration.

## Local preview

Run `python -m http.server 8000` from this repository and open http://localhost:8000/.

## Team scrolling

Normal page scrolling holds the Team section in place while moving through the members horizontally, then continues down after the last member. Scrolling upward reverses the same sequence. The stage and portrait sizes are measured to keep full names, roles and photographs readable. Keyboard arrow keys on the Team region move between measured card positions.

Pinned scrolling also runs with Reduce Motion enabled by explicit project direction. Short windows, unsupported layouts, absent JavaScript and script failures retain an ordinary horizontal row. Pinned mode does not cancel wheel or touch scrolling.

## Contact

Enquiries go through FormSubmit to andreea@maiac.agency. Name, work email and company are required; the message is optional. The subject is New Maiac consultancy enquiry, and the visitor email supplies Reply-To. The receiving inbox requires FormSubmit's one-time confirmation; the project owner has confirmed activation and functionality.

The enhanced form uses explicit provider acceptance before showing success. Errors and timeouts preserve entered details and offer direct email recovery. A server-compatible honeypot and native no-JavaScript validation/POST are retained. No autoresponse or CAPTCHA-disabling setting is added. Browser verification intercepts requests and does not prove individual inbox delivery.

## Other interactions

The bounded, dismissible Maiac introduction runs once per session, with hash/history skip and an intro=replay query option. The persistent blending header, native mobile navigation, four supplied portraits and Valentin's approved crop remain. Footer artwork has three Ma marks below900px and six on desktop.

Loading introduction, pinned Team movement and direct footer interaction are explicit Reduce Motion exceptions. Other effects retain their existing preference handling. No dependency or authored analytics is added.

## Remaining configuration

A real privacy-policy URL and three case-study destinations remain pending. Work entries remain semantic articles. Domain routing and mailbox delivery should be checked when host configuration changes.

## Fonts and assets

Hanken Grotesk400/500 latin and latin-ext files use SIL Open Font License1.1; retain assets/fonts/OFL-LICENSE.txt. Artwork and photographs are supplied Maiac assets. No general MIT license is asserted for the site or brand assets.
