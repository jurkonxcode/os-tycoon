# OS Tycoon: Technology Empire

A browser-based simulation game where you build a technology company from
scratch starting January 1, 1995. Design CPUs, manage R&D, build products,
and compete with rival tech firms through decades of industry change.

## Status

**Phase 1 — Core Foundation** ✅

- Running game clock (Pause / Normal / Fast / Very Fast)
- Centralized game state with serializable snapshot
- Economy core with daily ledger
- Company system (employees, salaries, reputation)
- Save / Load / Reset via LocalStorage
- Responsive dashboard + sidebar + topbar
- Placeholder views for later phases

## Play

Open `https://<your-username>.github.io/os-tycoon/` after enabling
GitHub Pages on the `main` branch (root folder).

## Architecture

Layered + event-driven. Four layers:

1. **UI** — pure DOM, reads state, emits intent events.
2. **Systems** — business logic, no DOM, communicate via `EventBus`.
3. **State** — single serializable `GameState` managed by `StateManager`.
4. **Data** — static config in `src/data/` and `src/config/`.

Key rules:

- One simulation tick = one game day.
- Fixed-timestep accumulator prevents double-processing.
- No free money per frame — all cash changes go through `EconomySystem` ledger.
- Research Points and Cash are separate, non-fungible resources.
- Every balancing number lives in `src/config/balanceConfig.js`.

## Starting Conditions

| Resource            | Value                  |
|---------------------|------------------------|
| Cash                | $50,000                |
| Research Points     | 100                    |
| Engineers           | 2                      |
| Researchers         | 1                      |
| Start Date          | January 1, 1995        |
| Initial Focus       | CPU Design & Development |

## Historical Data Disclaimer

Any real-world technology, company, or event referenced in later phases
uses historical sources. Entries not fully verified are marked as
`confidence: "approx"` or `confidence: "fictional"` in their data files.
This is a game; deviations from real history are intentional and part of
the simulation.

## Deployment

- Static site — no build step.
- ES Modules served over HTTPS (GitHub Pages default).
- No backend, no Node.js, no external framework required.

## Roadmap

- ✅ Phase 1 — Core Foundation
- ⏳ Phase 2 — CPU Design MVP
- ⏳ Phase 3 — Research & Technology Tree
- ⏳ Phase 4 — Product Economy
- ⏳ Phase 5 — Competitors
- ⏳ Phase 6 — Operating Systems
- ⏳ Phase 7 — GPU, Laptops & Expansion
- ⏳ Phase 8 — Smartphones, Cloud & AI
- ⏳ Phase 9 — Polish & Release

## License

See `LICENSE`.
