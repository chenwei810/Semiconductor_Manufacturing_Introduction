<!-- source: zh-TW/5-backend/22-advanced-packaging/README.md | sha: 04642116174a -->

# Chapter 22: Advanced Packaging — Integrating Multiple Chips into One

> 📍 **Where the wafer is**
>
> - Previous stop: wafer test, the good dies have been identified
> - **This chapter: advanced packaging, integrating several chips into one system**
> - Next stop: final test

---

## Why advanced packaging is needed

In the past, chip performance improved mainly by shrinking transistors. But that road is getting harder and more expensive, and it runs into several limits:

- **A die cannot grow without limit**: The size of a die is limited by the area a scanner can expose at once, about 26 mm × 33 mm.
- **Large dies have low yield**: As Chapter 17 explained, the bigger the die, the more likely it is to be hit by a defect.
- **Different functions suit different processes**: Compute cores benefit from the most advanced process, analog and I/O circuits are fine on mature processes, and memory needs its own dedicated process.
- **Bandwidth demand has exploded**: AI computing needs to move huge amounts of data between processors and memory.

So the industry started splitting one large chip into several smaller chips, making each with the process that suits it best, and then integrating them tightly with advanced packaging so they work like a single chip. Packaging is no longer just "protection"; it has become key to performance.

---

## 2.5D: side by side on an interposer

**2.5D packaging** places several chips side by side on an **interposer**. The interposer is usually a piece of silicon with very fine, dense wiring that lets the chips communicate with each other quickly and in large volumes. The interposer then connects to the package substrate below through TSVs.

The classic example places a processor and several stacks of HBM memory side by side on the same interposer. The interposer can even be made larger than a single exposure field by stitching several exposures together.

<!-- Figure: cross-section of a 2.5D package (processor and HBM side by side on an interposer, with the substrate below) -->

> [!NOTE]
> **📖 Term | Interposer (中介層)**
>
> - **Definition**: An adapter layer placed between the chips and the package substrate, with fine, dense wiring that lets several chips connect at high speed.
> - **On the floor**: "The interposer for this product is bigger than one exposure field, so it has to be stitched."
> - **Related terms**: 2.5D, TSV, micro bump, HBM
> - **Common confusion**: An interposer is not always silicon. Some use organic materials, and some only embed small silicon bridges between the chips. Each option trades off cost and performance.

---

## Fan-out packaging

**Fan-out packaging** does not use a traditional substrate. The dies are first arranged on a carrier and encapsulated in mold compound to form a "reconstituted wafer." A **redistribution layer** (RDL) is then built on top, spreading the contacts "out" from the die to an area larger than the die itself. These packages are thin and small, and they are common in thin, light products such as phones.

---

## 3D stacking: building upward

**3D stacking** places chips directly on top of other chips and connects them vertically through TSVs. HBM is one example. The way chips are connected to each other keeps evolving:

| Connection method | Contact pitch | Typical use |
|---|---|---|
| Flip-chip bumps | A hundred micrometers or more | Ordinary processor packages |
| Micro bumps | Tens of micrometers | 2.5D packages, HBM stacks |
| Hybrid bonding | Below ten micrometers | High-density 3D chip stacking |

The smaller the contact pitch, the more connections fit in the same area, and the more data can move between the chips.

> [!NOTE]
> **📖 Term | Hybrid bonding (混合鍵合)**
>
> - **Definition**: A technique that bonds the copper contacts on two chip surfaces directly, without bumps, while the surrounding insulating layers also bond to each other.
> - **On the floor**: "Since we moved to hybrid bonding, the connection density has gone way up."
> - **Related terms**: 3D stacking, micro bump, CMP, wafer bonding
> - **Common confusion**: The "hybrid" in hybrid bonding means that two kinds of material, metal and insulator, bond at the same time. It does not mean mixing two packaging methods.

---

## Chiplets

Splitting a large chip into several smaller chips with independent functions and packaging them together is called a **chiplet** design. The industry is also promoting standard interfaces for connecting chips to each other, with the goal of letting chiplets from different sources be combined like building blocks.

As advanced packaging makes heavy use of lithography, electroplating, CMP and other processes that used to belong in the fab, the boundary between front-end manufacturing and back-end packaging is becoming more and more blurred.

> [!TIP]
> **🔧 Know-how | One bad chip can sink the whole package**
>
> - **Situation**: An advanced package contains eight chips.
> - **Practice**: Every chip is fully tested before packaging to make sure it is a known good die (KGD), and the packaging process includes as many inspection points as possible.
> - **Why**: Yields multiply. Even if every chip has 99% yield, the chance that all eight are good is only about 92%.
> - **If you skip it**: If even one chip is bad, the whole expensive package, along with all the other good chips in it, is scrapped.
> - **Related chapters**: [Chapter 20: Wafer Test](../../5-backend/20-wafer-test/README.md)

> [!TIP]
> **🔧 Know-how | Hybrid bonding needs front-end levels of cleanliness and flatness**
>
> - **Situation**: Two chips are to be bonded directly with hybrid bonding.
> - **Practice**: The bonding surfaces go through extremely precise CMP, and the cleaning and environment before bonding must meet fab standards.
> - **Why**: With no bumps to absorb anything between the two surfaces, a single particle props up a gap, and even slight unevenness causes poor bonding.
> - **If you skip it**: One particle can cause a large number of surrounding contacts to fail at the same time.
> - **Related chapters**: [Chapter 9: CMP](../../2-process-modules/09-cmp/README.md), [Chapter 10: Cleaning and Contamination Control](../../2-process-modules/10-cleaning/README.md)

---

## Challenges of advanced packaging

| Challenge | Description |
|---|---|
| Heat | With chips packed closely together or stacked, heat is harder to get out |
| Warpage | Different materials expand differently when heated, and the larger the package, the more it bends |
| Test | Once chips are stacked, the chips in the middle are hard to test individually |
| Multiplied yield | If any single chip or connection fails, the whole package is affected |

---

## Key takeaways

1. Scaling keeps getting harder, and advanced packaging has become a new way to improve performance.
2. 2.5D packaging places several chips side by side on an interposer, often a processor plus HBM.
3. Fan-out packaging uses redistribution layers to spread contacts outward and suits thin, light products.
4. 3D stacking is moving from micro bumps to hybrid bonding, with ever-higher connection density.
5. Yields multiply, so every chip must be a known good die.

---

## Further reading

- John H. Lau, *Semiconductor Advanced Packaging*
- Papers from IEEE ECTC (Electronic Components and Technology Conference)

---

[← Chapter 21: Packaging](../../5-backend/21-packaging/README.md) | [Contents](../../README.md) | [Chapter 23: Final Test and Reliability →](../../5-backend/23-final-test-and-reliability/README.md)
