<!-- source: zh-TW/5-backend/21-packaging/README.md | sha: de2e3720b3f7 -->

# Chapter 21: Packaging — Making the Chip Usable

> 📍 **Where the wafer is**
>
> - Previous stop: wafer test, we now know which dies are good
> - **This chapter: packaging, turning dies into chips that can be mounted on a circuit board**
> - Next stop: final test

---

## Why chips need packages

A die freshly cut from the wafer is tiny and fragile, and its pads are far too small to solder directly onto a circuit board. A **package** is like a house for the die, and it has four main jobs:

- **Protection**: Keeping out moisture, dust and mechanical force.
- **Connection**: Turning the tiny pads on the die into pins or solder balls that a circuit board can be soldered to.
- **Heat dissipation**: Carrying away the heat the chip produces while it runs.
- **Support**: Providing enough mechanical strength for handling and assembly.

---

## The traditional packaging flow

**Backgrind → Dicing → Die attach → Wire bonding → Molding → Marking → Ball mount or lead plating → Singulation → Inspection**

1. **Backgrinding**: Grind the wafer thinner from the back so it fits into thin packages.
2. **Dicing**: Mount the wafer on tape and cut along the scribe lines with a diamond blade or a laser. Another method, called stealth dicing, uses a laser to create a modified layer inside the wafer, then stretches the tape so the dies separate along that layer.
3. **Die attach**: Following the wafer map, pick only the good dies and attach them to a lead frame or substrate.
4. **Wire bonding**: Connect the pads on the die to the lead frame or substrate with gold or copper wires thinner than a human hair.
5. **Molding**: Encapsulate the die and wires in a material such as epoxy resin.
6. **Marking**: Laser-mark the product name and lot number on the surface.
7. **Ball mount or lead plating**: Attach solder balls to the bottom, or plate the surface of the leads.
8. **Singulation**: Cut the packages on a strip of substrate into individual chips.

<!-- Figure: cross-section of a wire-bonded package (die, metal wires, lead frame or substrate, mold compound) -->

> [!NOTE]
> **📖 Term | Wire bonding (打線接合)**
>
> - **Definition**: A technique that connects the pads of a die to the package contacts with extremely fine metal wires. It is the most traditional and most common way to connect a die to its package.
> - **On the floor**: "This lot failed the wire pull test."
> - **Related terms**: bond pad, lead frame, flip chip
> - **Common confusion**: Wire bonding is an old technology, but it is still used in more packages than any other method, because it is cheap and mature.

---

## Flip chip: turning the die over

**Flip chip** works quite differently. Raised metal bumps are first formed on the pads of the die. The die is then flipped over, face down, and the bumps are soldered directly to the substrate. Finally, the gap between the die and the substrate is filled with a resin called **underfill**, which spreads out stress and protects the bumps.

Compared with wire bonding, flip chip has shorter connections, can place contacts across the whole surface of the die, and has better electrical and thermal performance. That is why most processors and graphics chips use flip chip.

<!-- Figure: cross-section of a flip-chip package (flipped die, bumps, underfill, substrate, solder balls) -->

> [!NOTE]
> **📖 Term | Flip chip (覆晶)**
>
> - **Definition**: A packaging method in which the die faces down and connects directly to the substrate through bumps.
> - **On the floor**: "This is a flip-chip package. Check the underfill for voids."
> - **Related terms**: bump, underfill, substrate, BGA
> - **Common confusion**: Bumps and solder balls are not the same. Bumps connect the die to the substrate, while solder balls sit on the bottom of the package and connect the package to the circuit board.

---

## Common package types

| Type | Characteristics | Typical use |
|---|---|---|
| Lead frame packages | Low cost, with leads around the sides or around the bottom edge | Microcontrollers, power management chips |
| BGA (ball grid array) | The whole bottom is covered with solder balls, giving many contacts | Processors, graphics chips |
| Wafer-level packaging | Packaging is done directly on the wafer, and the package is about the size of the die | Small chips in phones |

> [!TIP]
> **🔧 Know-how | Chips can "get damp" too**
>
> - **Situation**: Packaged chips stored in ordinary air slowly absorb moisture into the package material.
> - **Practice**: Chips are classified by how sensitive they are to moisture and shipped vacuum-sealed in moisture barrier bags with desiccant. If they are not used within a set time after the bag is opened, they must be baked dry before soldering.
> - **Why**: During soldering to the circuit board, the temperature rises sharply, and the moisture inside the package turns to steam and expands instantly.
> - **If you skip it**: The package delaminates internally or even cracks open. This is vividly called the "popcorn effect."
> - **Related chapters**: [Chapter 23: Final Test and Reliability](../../5-backend/23-final-test-and-reliability/README.md)

> [!TIP]
> **🔧 Know-how | Thinned wafers are extremely fragile**
>
> - **Situation**: After backgrinding, a wafer may be only about a hundred micrometers thick or even thinner, and it bends like paper.
> - **Practice**: Before grinding, the front is covered with protective tape or bonded to a carrier wafer, and later handling uses dedicated mechanisms to support the wafer.
> - **Why**: Thin wafers crack and warp easily, and internal stress makes them bend out of shape.
> - **If you skip it**: Wafers break, or develop microcracks invisible to the eye that cause chips to fail after some time in use.
> - **Related chapters**: [Chapter 22: Advanced Packaging](../../5-backend/22-advanced-packaging/README.md)

---

## Common problems

| Problem | Possible cause | Result |
|---|---|---|
| Chipping | Worn dicing blade, wrong dicing parameters | Damaged die edges that may grow into cracks |
| Non-stick on wire bond | Contaminated pads, probe marks too deep | Open circuits |
| Wire sweep | Mold compound flow pushes the thin wires sideways | Shorts between neighboring wires |
| Delamination | Poor adhesion between materials, moisture absorption | Reliability problems |
| Voids | Mold compound or underfill does not fill completely | Poorer heat dissipation, reliability problems |

---

## Key takeaways

1. A package protects the die, connects it to the outside world, dissipates heat and provides support.
2. The traditional flow includes grinding, dicing, die attach, wire bonding, molding, marking, ball mount and singulation.
3. Flip chip turns the die over and connects it to the substrate through bumps, with better electrical and thermal performance.
4. Packages absorb moisture, so moisture protection and baking matter before soldering.
5. Thinned wafers are extremely fragile and need special support and handling.

---

## Further reading

- Rao R. Tummala, *Fundamentals of Microsystems Packaging*
- Peter Van Zant, *Microchip Fabrication*, chapters on packaging

---

[← Chapter 20: Wafer Test](../../5-backend/20-wafer-test/README.md) | [Contents](../../README.md) | [Chapter 22: Advanced Packaging →](../../5-backend/22-advanced-packaging/README.md)
