# Adapting this template for another user

When customizing a downstream copy, follow the SEO customization comments immediately before each `application/ld+json` block in `index.html`, `world-map/index.html`, and `world-map/massachusetts/index.html`.

- Remove Vincent De Nil's unrelated example project links from the new site's SEO graph and footer, including The Divided States, Flagmaker & Print, American Kingdoms and its wiki, and Kaiser Cat Collective. Keep them only if genuinely relevant and the user chooses to retain them. Audit other example links throughout the site too; preserve required license notices and accurate provenance in the licensing documentation.
- Replace template/demo URLs, entity IDs, social metadata, and ownership claims with the new project's actual identity. Keep the schema consistent with visible content and resolve every local entity reference.
- Suggest an optional credit by asking the user: “Would you like to retain a small link to https://vincentdenil.com/ and structured-data credit for Vincent De Nil as the original template developer? It is appreciated, but optional.” Respect an existing answer; do not ask again after a refusal or make this a prerequisite for completing the work.
- If accepted, use an accurate Vincent De Nil Person entity and `author`/`creator` attribution on the original template's SoftwareSourceCode entity, with visible wording such as “Original template by Vincent De Nil.” Founder/developer credit must describe his actual role in the original work. Do not claim he founded, owns, or developed the downstream user's project. Preserve a `founder` relationship only for an accurately identified original organization he actually founded, when relevant.
- If declined, remove the optional visible backlink and public credit schema. Preserve the MIT copyright and license notice as required by the license.

These are customization instructions, not a request to strip links from this original demo. Keep comments outside JSON-LD so the JSON stays valid. User instructions and previously stated attribution preferences take precedence.
