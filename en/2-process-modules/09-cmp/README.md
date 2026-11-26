<!-- source: zh-TW/2-process-modules/09-cmp/README.md | sha: 32d679c2b3c4 -->

# Chapter 9: CMP — Polishing the Wafer Flat

> 📍 **Where the wafer is**
>
> - Previous stop: thin film deposition, the surface is now bumpy because of the patterns underneath
> - **This chapter: CMP, polishing the wafer surface flat**
> - Next stop: cleaning, then the next round of lithography

---

## Why the wafer must be flat

Every time a layer is patterned and a new film is deposited on top, the surface follows the shape of the patterns below. After enough layers, the wafer surface looks like rolling hills.

This causes two problems:

- **Lithography cannot focus**: As Chapter 5 explained, the finer the pattern, the shallower the range of focus in which it images sharply. If the surface is too uneven, the high and low areas cannot both be in focus.
- **Excess material cannot be removed**: For example, copper wiring is made by covering the whole wafer with copper and then removing the copper outside the trenches. See [Chapter 11](../../2-process-modules/11-metallization/README.md).

**Chemical mechanical planarization** (CMP) solves these problems. It is like building a house, where every floor slab has to be leveled before the next floor goes on top. CMP is what made it possible for chips to stack more and more layers of metal wiring.

---

## How CMP works

The main parts of a CMP tool:

- **Polishing pad**: A special pad mounted on a rotating platen.
- **Slurry**: A liquid containing tiny abrasive particles and chemicals.
- **Polishing head**: Presses the wafer face down onto the pad and controls the pressure on different zones.
- **Conditioner**: A disk covered with diamond grit that keeps scraping the pad so it stays rough.

During polishing, the chemicals in the slurry first soften or react with the wafer surface, and then the abrasive particles wear away the softened material. High spots feel more pressure and are polished faster, so the surface becomes flatter and flatter.

<!-- Figure: a CMP tool (rotating platen, pad, polishing head, slurry nozzle, conditioner) -->

> [!NOTE]
> **📖 Term | CMP (Chemical Mechanical Planarization, 化學機械研磨)**
>
> - **Definition**: A process that combines chemical reaction and mechanical polishing to flatten the wafer surface or remove excess material.
> - **On the floor**: "This layer was over-polished at CMP." People often just call it "polish."
> - **Related terms**: slurry, pad, dishing, erosion
> - **Common confusion**: CMP is not just sanding. The chemical action matters just as much, and different materials need different slurry formulas to polish fast and flat.

---

## Where CMP is used

| Type | What it does | Related chapter |
|---|---|---|
| STI CMP | After the isolation trenches are filled with silicon oxide, removes the excess oxide | [Chapter 12](../../3-integration/12-cmos-process-flow/README.md) |
| Dielectric CMP | Flattens the surface of an insulating layer | This chapter |
| Tungsten CMP | Removes the excess tungsten outside the contacts | [Chapter 11](../../2-process-modules/11-metallization/README.md) |
| Copper CMP | Removes the excess copper outside the wires | [Chapter 11](../../2-process-modules/11-metallization/README.md) |

---

## Knowing when to stop

CMP also needs endpoint detection. When polishing moves from one material to another, the friction changes and so does the reflection from the surface, and the tool can use these changes to tell whether it has reached the target. Many processes also deposit a harder **stop layer** underneath, so that polishing naturally slows down when it reaches it.

Pads and slurry are consumables. As a pad wears, its polishing rate slowly changes. Fabs usually adjust the polishing time of the next lot automatically, based on measurements from the previous lots. See [Chapter 18](../../4-yield-and-quality/18-process-control/README.md).

---

## The trouble with polishing: dishing and erosion

CMP does not remove the same amount everywhere. Soft materials polish faster than hard ones, and dense pattern areas polish differently from sparse ones. This leads to two classic problems:

<!-- Figure: cross-sections comparing dishing and erosion -->

> [!NOTE]
> **📖 Term | Dishing and erosion (碟化與侵蝕)**
>
> - **Definition**: Dishing is when the middle of a wide metal line is polished into a dip, like a dish. Erosion is when a whole area of dense lines is polished lower than its surroundings.
> - **On the floor**: "Dishing on the big metal pads is too severe."
> - **Related terms**: pattern density, dummy fill, over-polish
> - **Common confusion**: Dishing happens inside a single wide line, while erosion lowers a whole dense area at once. The causes and fixes are different.

---

## Dummy fill: patterns that exist only to polish flat

To make CMP polish evenly, empty areas of the chip with few patterns are automatically filled with **dummy patterns that carry no current** (dummy fill), so that the pattern density is as even as possible across the chip. Chip designs must also follow pattern density rules.

> [!TIP]
> **🔧 Know-how | Chips are full of patterns that do nothing electrically**
>
> - **Situation**: Look at a chip under a microscope and you will see many small squares that are not connected to any circuit.
> - **Practice**: At the end of the design flow, software automatically adds dummy patterns to empty areas so that the pattern density of every region stays within the allowed range.
> - **Why**: The CMP polishing rate depends on pattern density. If the density is uneven, one side ends up higher than the other.
> - **If you skip it**: The surface is not flat, which causes lithography defocus, uneven wire thickness, and even leftover metal that shorts wires together.
> - **Related chapters**: [Chapter 5: Lithography](../../2-process-modules/05-lithography/README.md)

> [!TIP]
> **🔧 Know-how | Clean immediately after CMP**
>
> - **Situation**: The wafer has just been polished, and its surface is covered in slurry and abrasive particles.
> - **Practice**: CMP tools usually have built-in cleaning modules. Right after polishing, the wafer is brushed, rinsed and dried, and leaves the tool clean. This is called "dry-in, dry-out."
> - **Why**: Once slurry dries on the wafer, the particles stick firmly and are very hard to wash off.
> - **If you skip it**: Leftover particles become defects that disturb the following films and lithography and cause yield loss.
> - **Related chapters**: [Chapter 10: Cleaning and Contamination Control](../../2-process-modules/10-cleaning/README.md)

---

## Common problems

| Problem | Possible cause | Result |
|---|---|---|
| Over-polish or under-polish | Change in polishing rate, wrong endpoint call | Film thickness out of spec |
| Dishing and erosion | Uneven pattern density, over-polishing | Thinner wires, higher resistance |
| Scratches | Large particles in the slurry, pad problems | Open or short circuits |
| Metal residue | Metal not completely polished away | Shorts between neighboring wires |
| Corrosion | Copper surface exposed to chemicals for too long | Damaged wires |

---

## Key takeaways

1. As layers pile up, the surface becomes uneven. CMP lets lithography stay in focus and removes excess metal.
2. CMP uses chemical action to soften the surface and abrasive particles to wear it away.
3. Changes in friction or reflection signal the endpoint, and stop layers help polishing stop in the right place.
4. Dishing and erosion are the classic CMP problems, and dummy fill makes pattern density more even.
5. Dried slurry is very hard to remove, so wafers are cleaned immediately after CMP.

---

## Further reading

- Peter Van Zant, *Microchip Fabrication*, chapters on planarization
- Hong Xiao, *Introduction to Semiconductor Manufacturing Technology*, chapter on CMP

---

[← Chapter 8: Ion Implantation and Thermal Processing](../../2-process-modules/08-ion-implantation/README.md) | [Contents](../../README.md) | [Chapter 10: Cleaning and Contamination Control →](../../2-process-modules/10-cleaning/README.md)
