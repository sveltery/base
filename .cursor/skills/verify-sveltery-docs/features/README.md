# Docs preview feature map

Reader-facing paths on the Sveltery Base docs site (`/docs` in `@sveltery/fixtures`). The site is an experimental preview: most pages are prose, and the live Dialog is the only interactive component example. A proof that drives one path is incomplete when this list names others.

| Feature               | File                                           | Open it                       |
| --------------------- | ---------------------------------------------- | ----------------------------- |
| Live Dialog           | [live-dialog.md](live-dialog.md)               | `/docs/components/dialog`     |
| Docs search           | [docs-search.md](docs-search.md)               | `/docs`, then Ctrl+K          |
| Sidebar and skip link | [sidebar-navigation.md](sidebar-navigation.md) | `/docs`                       |
| Mobile browse menu    | [mobile-browse.md](mobile-browse.md)           | `/docs` at viewport width 390 |
| About and credits     | [about-credits.md](about-credits.md)           | `/docs/about`                 |

Launch, doctor, and cleanup are in [../SKILL.md](../SKILL.md). `session.sh drive` covers Live Dialog only. Drive the other rows with the Playwright snippets in their files, against the same already-running origin.
