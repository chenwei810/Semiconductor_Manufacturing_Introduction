<!-- source: zh-TW/1-fundamentals/02-transistor-basics/README.md | sha: 8b432ac52143 -->

# Chapter 2: From Physics to Transistors — Meet What We Are Building

> 📍 **Where the wafer is**
>
> - Previous stop: getting to know the fab, the place where everything happens
> - **This chapter: the thing the fab builds, the transistor**
> - Next stop: prepare the raw material and make a blank wafer

---

## First, meet what we are building

The circuits on a chip come down to just two things: **transistors** and **the metal wires that connect them**. Every process described in the following chapters exists to build one of these two things.

This chapter skips the deep physics and covers only what manufacturing needs: what a transistor looks like and why it is built that way. Once you understand what is being built, the purpose of each process step becomes much easier to see.

---

## Semiconductors: conductors you can control

Metals conduct electricity easily, and glass hardly conducts at all. **Semiconductors** sit in between. Their most important property is that **their conductivity can be controlled**, for example by adding small amounts of other elements or by applying a voltage.

Silicon is the main semiconductor material because:

- It is extremely abundant on Earth. Sand is mostly silicon oxide.
- A stable layer of silicon dioxide can be grown on its surface. This is a high-quality insulator and very useful in manufacturing.

---

## Doping: N-type and P-type

Pure silicon conducts poorly. A silicon atom has four electrons in its outer shell, tightly bonded to the neighboring silicon atoms. Adding a small amount of another element changes that:

- Adding **phosphorus** or **arsenic** (five outer electrons) leaves one extra electron that can move freely. This is called **N-type**.
- Adding **boron** (three outer electrons) leaves one electron missing. The empty spot is called a **hole**, and this kind of silicon is called **P-type**.

Even one impurity atom for every few million silicon atoms changes the conductivity dramatically.

> [!NOTE]
> **📖 Term | Doping (摻雜)**
>
> - **Definition**: Deliberately adding small amounts of specific elements to a semiconductor to change how it conducts.
> - **On the floor**: "The doping concentration in this region is on the high side." "This layer is N-type doped."
> - **Related terms**: N-type, P-type, ion implantation, anneal
> - **Common confusion**: Doping is deliberate and precisely controlled. Unwanted impurities, such as metals, getting into the wafer are contamination. See [Chapter 10](../../2-process-modules/10-cleaning/README.md).

Where a P-type region meets an N-type region, a **PN junction** forms. A PN junction lets current flow easily in one direction but hardly at all in the other. This is how a diode works, and it is also an essential part of a transistor.

---

## The MOSFET: the switch inside a chip

The main transistor in modern chips is the **MOSFET**. You can think of it as a water gate:

- **Source**: where the current comes in, like the water supply
- **Drain**: where the current goes out, like the outlet
- **Gate**: the gate that opens and closes the flow
- **Gate oxide**: an extremely thin insulating layer between the gate and the silicon
- **Channel**: the region under the gate, between the source and the drain

When a high enough voltage is applied to the gate, the channel opens like a gate and lets current through. Remove the voltage and the gate closes, stopping the current. The minimum voltage needed to open the gate is called the **threshold voltage** (Vt).

On and off correspond to the 1s and 0s of the digital world. Billions of these switches working together can compute and store data.

<!-- Figure: MOSFET cross-section showing the source, drain, gate, gate oxide and channel (labeled with numbers) -->

> [!NOTE]
> **📖 Term | MOSFET (Metal-Oxide-Semiconductor Field-Effect Transistor, 金屬氧化物半導體場效電晶體)**
>
> - **Definition**: A transistor whose channel is turned on or off by the gate voltage. It is the most basic device in modern chips.
> - **On the floor**: Usually shortened to MOS, as in "The Vt of this NMOS is on the high side."
> - **Related terms**: NMOS, PMOS, CMOS, threshold voltage
> - **Common confusion**: "Metal" and "oxide" in the name come from the early structure. Gates later moved to polysilicon and have now moved back to metal, and the insulator is no longer just silicon oxide, but the name has stuck.

---

## NMOS, PMOS and CMOS

There are two kinds of MOSFET:

- **NMOS**: Conducts with electrons and turns on when the gate voltage is high.
- **PMOS**: Conducts with holes and turns on when the gate voltage is low.

Using NMOS and PMOS in pairs is called **CMOS** (complementary metal-oxide-semiconductor). When a CMOS circuit is not switching, one transistor in each pair is always off, so it uses almost no power. This is why CMOS became the mainstream technology for modern chips.

For manufacturing, CMOS means two kinds of transistors must be built on the same wafer: NMOS in P-type regions (P-wells) and PMOS in N-type regions (N-wells). This requires several rounds of lithography and ion implantation to treat each region separately. See [Chapter 8](../../2-process-modules/08-ion-implantation/README.md) and [Chapter 12](../../3-integration/12-cmos-process-flow/README.md).

---

## From transistors to a chip

A few transistors make a logic gate, many logic gates make computing circuits, and several layers of metal wiring connect them all into a chip.

So the work of a fab falls into two big stages: first build the transistors at the surface of the silicon, then build the metal wiring above them layer by layer. These are the FEOL and BEOL mentioned in Chapter 0.

---

## Scaling: making it smaller and smaller

For decades, the number of transistors on a chip roughly doubled every two years. This trend is known as **Moore's law**. Smaller transistors can be faster and use less power, more of them fit in the same area, and each transistor costs less.

But once transistors shrink past a certain point, problems appear. The gate finds it harder and harder to fully control the channel, and current keeps leaking through even when the transistor is off, like a faucet that will not shut tight. To solve this, the transistor structure moved from planar to three-dimensional. See [Chapter 13](../../3-integration/13-advanced-transistors/README.md).

> [!TIP]
> **🔧 Know-how | One process can make both fast and power-saving transistors**
>
> - **Situation**: A phone chip needs fast computing but also has to save as much power as possible on standby.
> - **Practice**: A process usually offers several transistor types with different Vt. Low-Vt transistors switch fast but leak more; high-Vt transistors switch slower but save a lot of power. Designers mix them on the same chip.
> - **Why**: Different circuits have different needs. Compute cores need speed, while standby circuits need low power.
> - **If you skip it**: You would have to choose between "fast but power-hungry everywhere" and "low-power but slow everywhere." The trade-off is that each extra Vt type adds a few lithography and implant steps, which adds cost.
> - **Related chapters**: [Chapter 8: Ion Implantation and Thermal Processing](../../2-process-modules/08-ion-implantation/README.md)

> [!TIP]
> **🔧 Know-how | A small process shift means a small electrical shift**
>
> - **Situation**: The gate line width comes out slightly smaller than the target.
> - **Practice**: After every wafer finishes the front end, its transistors' electrical parameters are measured, such as Vt, drive current and leakage current.
> - **Why**: Any small change in line width, oxide thickness or doping concentration changes the electrical behavior of the transistor. Electrical parameters are the most direct report card of the process.
> - **If you skip it**: The process slowly drifts without anyone noticing, and in the end the chips fail to meet their speed or power specs, or problems show up only at the customer.
> - **Related chapters**: [Chapter 20: Wafer Test](../../5-backend/20-wafer-test/README.md)

---

## Key takeaways

1. A chip is made of transistors and metal wiring, and every process exists to build these two things.
2. A semiconductor's conductivity can be controlled, and doping turns silicon into N-type or P-type.
3. A MOSFET is a switch controlled by the gate voltage, and the threshold voltage (Vt) is one of its most important parameters.
4. CMOS uses NMOS and PMOS in pairs and saves a lot of power, but manufacturing must treat the two kinds of regions separately.
5. As transistors shrink, leakage and other problems pushed the structure from planar to three-dimensional.

---

## Further reading

- S. M. Sze and M. K. Lee, *Semiconductor Devices: Physics and Technology*
- Michael Quirk and Julian Serda, *Semiconductor Manufacturing Technology*, chapters on semiconductor materials and devices

---

[← Chapter 1: How a Fab Works](../../0-before-you-start/01-how-a-fab-works/README.md) | [Contents](../../README.md) | [Chapter 3: From Sand to Wafer →](../../1-fundamentals/03-sand-to-wafer/README.md)
