# Maiac AI Marketing

Maiac branding, marketing and AI enablement website. Dependency-free HTML, CSS and JavaScript with self-hosted photographs, artwork and Hanken Grotesk fonts. GitHub Pages serves the root of main with no build step.

The repository preserves the existing CNAME for maiac.agency. Custom-domain availability depends on its DNS and HTTPS configuration.

## Local preview

Run `python -m http.server 8000 --bind 127.0.0.1` from this repository. Before sharing a preview running on this computer, publish the selected port through `tailscale serve` and verify the resulting Tailscale URL.

## Pages and updates

The homepage follows the service page's corner treatment: 10px for hero/work imagery and Team portrait frames, and 6px for buttons and menu controls. Underlined form fields, section boundaries and footer remain square. Its hero now uses the pale green painted landscape from the current Figma homepage, with the source's centered 2:1 crop and responsive assets; previous waves artwork is retained as an unused source asset.

The homepage includes the two supplied Latest updates rows from the October 29 Figma design. Both rows are ordinary HTML links, with initial HTML content and readable static fallbacks. The first links to the service page; the second links to the existing consultancy form. Their slight scroll entrance respects reduced motion and remains readable if scroll timelines are unsupported. Update content is maintained in `index.html`; this static repository has no CMS service.

`agentic-website-management/index.html` provides `/agentic-website-management/` without a build step or fallback router. Its relative asset and home links also work beneath the independent GitHub staging project path. The page has its own `assets/css/agentic.css` and service features in `assets/js/agentic.js`: six desktop service panels that release after the last panel, a native horizontal platform track, a three-state testimonial carousel and a fine-pointer portrait interaction. Mobile and no-JavaScript layouts keep the content in normal flow.

Both pages use the approved homepage curtain/accordion footer and its bounded mouse/touch distortion, as requested after the initial stage preview. The service page loads the existing `main.js` once for navigation and footer behavior, with scoped `shared-footer.css`; its feature module does not install duplicate menu or hash handlers. Direct footer interaction retains the existing reduced-motion exception. This owner request supersedes the original Figma note calling for a static service-page footer.

The service page reuses the existing contact provider with optional website details. Its `data-success-replace` attribute hides the input group only after provider acceptance and leaves the confirmation and privacy line visible. The homepage retains its existing reset-and-continue form behavior. Keep CSS and JavaScript URL versions aligned with the SHA-256 prefix of the referenced file whenever they change.

The source `stage` branch preserves production metadata. The independent `maiac-ai-marketing-stage` hosting snapshot adds noindex and blocking robots rules and excludes CNAME and sitemap. Promote source changes from this repository; never merge those hosting safeguards into production.

The final four platform cards (WooCommerce, Shopify, Custom and Something else?) currently retain their verified names. Their descriptions and artwork require an unclipped Figma export; the public viewer and its exports clip these cards. These are outstanding staging inputs. No replacement copy or marks have been invented.

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
