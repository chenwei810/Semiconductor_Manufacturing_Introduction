<!-- source: zh-TW/2-process-modules/10-cleaning/README.md | sha: 0514a63256b7 -->

# Chapter 10: Cleaning and Contamination Control — The Invisible Enemy

> 📍 **Where the wafer is**
>
> - Previous stop: almost any process step
> - **This chapter: cleaning, removing contamination from the wafer surface**
> - Next stop: the next process step

---

## The invisible enemy

At the nanometer scale, a particle invisible to the eye or a trace of metal atoms is enough to kill a transistor. That is why cleaning is one of the most frequent steps in the whole process: the wafer is cleaned after almost every step and before every important one.

Cleaning may look unremarkable, but it directly decides yield.

---

## Kinds of contamination

| Type | Common sources | Effect |
|---|---|---|
| Particles | Tools, environment, people | Pattern defects that cause shorts or opens |
| Metal contamination | Chemicals, tool parts, the human body | Leakage, changed transistor behavior |
| Organics | Photoresist residue, skin oils | Poor film adhesion |
| Native oxide | Grows naturally once a silicon surface meets air | Affects contact resistance and film quality |

Metal contamination is especially troublesome. For example, sodium ions from sweat that get into the gate oxide move around inside it and make the transistor's Vt drift. This is one of the reasons cleanrooms are so strict about cleanroom suits.

---

## How wafers are cleaned

The classic cleaning method is the **RCA clean**. It was developed in the 1960s, and it is still the basis of many cleaning recipes today:

| Name | Main ingredients | Purpose |
|---|---|---|
| SC1 | Ammonium hydroxide, hydrogen peroxide, water | Removes particles and organics |
| SC2 | Hydrochloric acid, hydrogen peroxide, water | Removes metal contamination |
| DHF | Dilute hydrofluoric acid | Removes thin oxide |
| SPM | Sulfuric acid, hydrogen peroxide | Removes organics and photoresist |

> [!NOTE]
> **📖 Term | RCA clean (RCA 清洗)**
>
> - **Definition**: The standard wafer cleaning sequence built around SC1 and SC2.
> - **On the floor**: "Run an RCA clean before the furnace."
> - **Related terms**: SC1, SC2, DHF, pre-furnace clean
> - **Common confusion**: RCA is the name of the laboratory that first published the method, not a chemical.

There are two main types of cleaning tools:

- **Batch wet benches**: A whole batch of wafers is dipped in turn into a row of chemical tanks and rinse tanks, like a car wash line.
- **Single-wafer cleaners**: Process one wafer at a time, spraying chemicals while the wafer spins. They offer more precise control and avoid cross-contamination between wafers, and advanced processes use them more and more.

<!-- Figure: a batch wet bench compared with single-wafer spin cleaning -->

The water used for cleaning is **ultrapure water**, with almost no ions, particles or bacteria, far purer than drinking water. A fab uses huge amounts of it every day.

---

## Q-time: a clean surface has an expiration date

A freshly cleaned wafer surface is extremely clean, but that state does not last long. The surface slowly grows a native oxide and picks up contaminants from the air. So after cleaning, the wafer must move on to the next step within a set time.

> [!NOTE]
> **📖 Term | Q-time (Queue time, 等待時間限制)**
>
> - **Definition**: The maximum time a wafer may wait between two process steps.
> - **On the floor**: "This lot's Q-time is almost up, run it first." "Q-time expired, it needs a re-clean."
> - **Related terms**: hold, rework, dispatching
> - **Common confusion**: Q-time is not how long the process itself takes. It is how long the wafer may wait between two steps. It is not limited to cleaning either; for example, there is also a Q-time limit between copper CMP and the cap layer deposition that follows.

The factory system automatically tracks the Q-time of every lot. Lots close to their limit get priority in dispatching; lots that exceed the limit are automatically held, and an engineer decides whether to re-clean them or handle them another way.

---

## Cross-contamination: some things must never mix

Copper diffuses through silicon extremely fast. Even a little copper reaching the area where the transistors are causes leakage or outright failure. That is why the tools, wafer carriers, and even tweezers and gloves used for copper processes are kept strictly separate from the front end.

> [!TIP]
> **🔧 Know-how | Anything that has touched copper can never go back to the front end**
>
> - **Situation**: The wafer enters the metal wiring process and starts touching copper.
> - **Practice**: The fab assigns tools and wafer carriers to contamination classes, often marked by color or labels. The system also checks whether the class of the carrier matches the class of the tool, and blocks the wafer from entering the tool if it does not.
> - **Why**: Once a trace of copper is carried into a front-end tool, it contaminates every wafer that passes through that tool afterward.
> - **If you skip it**: Copper contamination spreads across a large number of wafers, transistors leak, yield drops sharply, and the source is very hard to trace.
> - **Related chapters**: [Chapter 11: Metallization](../../2-process-modules/11-metallization/README.md), [Chapter 24: How Systems Run the Fab](../../6-beyond-the-fab/24-fab-systems/README.md)

> [!TIP]
> **🔧 Know-how | The back of the wafer must be clean too**
>
> - **Situation**: A particle sticks to the back of a wafer.
> - **Practice**: Cleaning and inspection cannot focus only on the front. Particles and contamination on the back must be controlled as well.
> - **Why**: During exposure, the wafer lies flat on the tool. A particle on the back lifts part of the wafer and causes defocus. The particle may also stay on the tool and pass to the next wafer.
> - **If you skip it**: Defocus defects keep appearing in the same spot, and one tool may contaminate many lots.
> - **Related chapters**: [Chapter 5: Lithography](../../2-process-modules/05-lithography/README.md)

---

## Common problems

| Problem | Possible cause | Result |
|---|---|---|
| More particles after cleaning than before | Dirty chemical tank, failed filter | More defects |
| Watermarks | Incomplete drying | Residue on the surface |
| Metal contamination | Impure chemicals, corroded parts | Leakage, lower yield |
| Too much film removed | Wrong hydrofluoric acid concentration or time | Film too thin |
| Pattern collapse | Surface tension of the liquid pulls over tall, thin structures during drying | Damaged structures |

---

## Key takeaways

1. Cleaning happens before and after almost every process step and directly decides yield.
2. Contamination includes particles, metals, organics and native oxide, each with different effects.
3. The RCA clean is the classic cleaning method and is still the basis of many recipes.
4. A clean surface does not stay clean forever, so Q-time controls how long wafers may wait between steps.
5. Contaminants such as copper must be strictly separated to avoid cross-contamination.

---

## Further reading

- Karen A. Reinhardt and Werner Kern (eds.), *Handbook of Silicon Wafer Cleaning Technology*
- Peter Van Zant, *Microchip Fabrication*, chapters on contamination control

---

[← Chapter 9: CMP](../../2-process-modules/09-cmp/README.md) | [Contents](../../README.md) | [Chapter 11: Metallization →](../../2-process-modules/11-metallization/README.md)
