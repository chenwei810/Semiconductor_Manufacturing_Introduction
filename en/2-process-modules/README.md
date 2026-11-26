<!-- source: zh-TW/2-process-modules/README.md | sha: 3443d44d5b46 -->

# Part 2: Process Modules

A fab runs hundreds to more than a thousand process steps, but most of them are combinations of a few basic process modules. This part first spends a chapter on the seven modules that run each part of the process in a fab. It then introduces each module in turn: what it does, which tools it uses, which numbers matter, and what typically goes wrong.

In real production, the wafer cycles through these modules again and again: deposit a film, pattern it with lithography, etch or implant, clean, measure, and then build the next layer. After the chapter on how the modules divide the work, the book starts with lithography, because it is the heart of the loop.

| Chapter | What you will read |
|---|---|
| [Chapter 4: The Seven Fab Modules](04-fab-modules/README.md) | What PH, DF, TF, ET, IMP, CMP and WET each do, and how a route moves between them |
| [Chapter 5: Lithography](05-lithography/README.md) | Masks, photoresist and scanners: printing the circuit onto the wafer |
| [Chapter 6: Thin Films](06-thin-films/README.md) | Thermal oxidation, CVD, PVD, ALD and epitaxy |
| [Chapter 7: Etching](07-etching/README.md) | Dry and wet etching, plasma, selectivity and endpoint detection |
| [Chapter 8: Ion Implantation and Thermal Processing](08-ion-implantation/README.md) | Dose, energy, annealing and thermal budget |
| [Chapter 9: CMP](09-cmp/README.md) | Polishing the wafer flat: slurry, dishing, erosion and dummy fill |
| [Chapter 10: Cleaning and Contamination Control](10-cleaning/README.md) | RCA cleaning, Q-time and cross-contamination |
| [Chapter 11: Metallization](11-metallization/README.md) | Contacts, copper damascene and low-k dielectrics |

---

[← Part 1: Fundamentals](../1-fundamentals/README.md) | [Contents](../README.md) | [Part 3: Process Integration →](../3-integration/README.md)
