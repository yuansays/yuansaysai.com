# Open word sources

This site uses two open-source projects for complementary purposes:

- [recite](https://github.com/imjiaoyuan/recite) supplies nine frequency-ordered
  vocabulary lists. Imported from commit
  `8a562ce0493873ec78d9284cd5c3ddf801b26fec`. The list selection is
  covered by recite's MIT license, reproduced in `public/recite-LICENSE`.
- [WordTap](https://github.com/hawkhai/wordtap.cn) supplies an ECDICT-derived
  dictionary for lookup while reading. Imported from commit
  `a6f269fb11957f9a7385c46cd9aa329ada2a23d1`. Its ECDICT MIT notice is
  reproduced in `public/wordtap-ecdict-LICENSE`. Only single English words,
  contractions and hyphenated words with a definition or translation are
  repacked, into small lazy-loaded buckets. This is *not* a second unrelated
  dictionary: recite and WordTap both derive their word data from
  [ECDICT](https://github.com/skywind3000/ECDICT).

No WordTap textbook chapters, exam papers, pronunciation recordings, or review
records are redistributed. WordTap's
[third-party notices](https://github.com/hawkhai/wordtap.cn/blob/main/THIRD_PARTY_NOTICES.md)
say those materials have separate, incompletely recorded rights. No Tatoeba
sentences from recite are included in this import. The reading page accepts
user-provided text and stores it only in the current browser.

The original CET-4 book (ID `1`) is retained so existing local learning
progress is not replaced. The imported recite books use new `recite-*` IDs.

To regenerate from checked-out upstream repositories:

```sh
node scripts/import-open-word-sources.mjs /path/to/recite /path/to/wordtap.cn
```

Review upstream changes and licenses before reimporting; do not automatically
track an unpinned upstream branch in the Cloudflare build.
