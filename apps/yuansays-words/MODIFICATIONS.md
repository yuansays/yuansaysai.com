# yuansays words

This is a modified distribution of [TypeWords](https://github.com/zyronon/TypeWords), based on commit `5738371980f441d05ef0cb6221f33a81729566b8`.

Modified by Yuan on 2026-09-28. This application remains licensed under GNU GPL version 3; see LICENSE. Upstream copyright and license notices are preserved.

Changes: yuansays words branding; local word-learning scope; deployment at `/words/`; application-specific local storage; local dictionary lookup; validated backup imports; disabled cloud sync and remote analytics; scoped offline cache; integration with the host site's static build and Worker.

The bundled CET-4 data is the unmodified `public/dicts/en/word/CET4_T.json` distributed in the upstream repository at the above revision. The upstream list declares 2607 words. No additional production-site dictionaries, article texts, recordings, or sponsor images are included. This notice records provenance; it does not assert any additional rights beyond the upstream distribution.

Corresponding source and build instructions: https://github.com/yuansays/yuansaysai.com/tree/main/apps/yuansays-words . The application About page links the exact source commit used for each deployed version. The parent `scripts/build-words.mjs`, Worker integration, and lockfiles are part of the corresponding build source.
