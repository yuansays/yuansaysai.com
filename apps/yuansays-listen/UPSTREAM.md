# Upstream and local changes

This application is based on [FluentAnyLang](https://github.com/Jim-Elijah/fluent-any-lang)
at commit `f2c81706ab75c5781097ef3d5e93129992f62120`. Its README and
`package.json` declare the MIT license. The original project did not include
a standalone license file in that commit; the standard MIT notice is included
in [LICENSE](LICENSE) here.

Local changes mount the independent app at `/listen/`, adjust navigation and
PWA scope for that path, remove the upstream third-party page-view script,
and add links and copy for yuansays. Practice media is not bundled: learners
import materials they are permitted to use. Audio and recordings stay in the
browser by default; optional scoring requires a separately configured API.
