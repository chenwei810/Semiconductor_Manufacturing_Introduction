<!-- source: zh-TW/2-process-modules/06-thin-films/README.md | sha: 6f8377a04a44 -->

# Chapter 6: Thin Films — Building Up Layer by Layer

> 📍 **Where the wafer is**
>
> - Previous stop: cleaning, the wafer surface is now clean
> - **This chapter: thin film deposition, adding a new layer of material to the wafer surface**
> - Next stop: lithography, defining a pattern on this layer

---

## Why thin films are needed

A chip is a stack of many layers of different materials. Each layer is a **thin film**, anywhere from a few atoms to a few micrometers thick. Each film has a job:

- **Insulation**: For example, silicon oxide and silicon nitride separate wires and devices
- **Conduction**: For example, metals and polysilicon carry signals
- **Process support**: For example, hard masks and etch stop layers help later steps come out more precisely

You can think of thin films as the layers of a cake, except that every layer has to be accurate to the nanometer or even to the atom.

There are several ways to deposit a film, and each suits different materials and situations.

---

## Thermal oxidation: letting silicon grow its own oxide

The wafer is placed in a high-temperature **furnace**, and oxygen or steam flows in. The silicon surface reacts with the oxygen and grows a layer of silicon dioxide.

- **Dry oxidation**: Uses oxygen. It grows slowly, but the quality is excellent.
- **Wet oxidation**: Uses steam. It grows fast and suits places that need a thicker oxide.

What makes thermal oxidation special is that the oxide grows by "consuming" part of the silicon, so the interface between the oxide and the silicon is especially good. Furnaces are batch tools that can process more than a hundred wafers at once.

---

## CVD: growing films from gases

**Chemical vapor deposition** (CVD) is the most widely used film method. Several gases flow into a chamber and react on the wafer surface, leaving behind a solid film, while the gaseous by-products are pumped away. It is a bit like frost forming on a window in winter, where a gas turns into a solid on a surface. The difference is that CVD relies on a chemical reaction, not just simple condensation.

Depending on how the reaction energy is supplied, there are two common kinds of CVD:

- **LPCVD** (low-pressure CVD): Uses high temperature for energy. The films are uniform and high quality, but the temperature is high.
- **PECVD** (plasma-enhanced CVD): Uses a plasma for energy, so deposition can happen at lower temperatures. It suits wafers that already have metal on them, because the metal cannot survive high temperatures.

> [!NOTE]
> **📖 Term | CVD (Chemical Vapor Deposition, 化學氣相沉積)**
>
> - **Definition**: A method in which gases react on the wafer surface to form a solid film.
> - **On the floor**: "This nitride is a CVD film." People in fabs often say a film is "grown," even when it is deposited.
> - **Related terms**: LPCVD, PECVD, ALD, epitaxy
> - **Common confusion**: CVD is the name of a whole family of methods. In principle, ALD and epitaxy are special forms of CVD, but in a fab they are usually treated as separate processes.

---

## PVD: knocking atoms loose

The most common form of **physical vapor deposition** (PVD) is **sputtering**. In a vacuum chamber, charged argon ions strike a block of material called the **target**. Atoms knocked off the target fly onto the wafer and build up a film. It is like hitting a pile of billiard balls with a cue ball: the balls that fly off land on the wafer.

PVD is mainly used for metals such as aluminum, titanium and titanium nitride, and for the barrier and seed layers in copper processes. See [Chapter 11](../../2-process-modules/11-metallization/README.md).

---

## ALD: one layer of atoms at a time

**Atomic layer deposition** (ALD) introduces two reactive gases in turn. The first gas covers the surface with one layer and then stops by itself. After the chamber is purged, the second gas flows in and reacts with it. Each cycle grows a film only about one atom thick.

It is like laying tiles: one layer at a time, stopping naturally when the layer is complete. ALD films are extremely uniform, even on the sidewalls and bottoms of deep holes, but the process is slow. It is used only where extremely thin and precise films are needed, such as the gate insulator of advanced transistors.

---

## Epitaxy: growing a crystal that continues the lattice

**Epitaxy** is a special kind of CVD in which the new film continues the atomic arrangement of the wafer underneath, so the film is also a single crystal. Besides making epitaxial wafers, epitaxy is used in advanced transistors, for example for alternating stacks of silicon and silicon germanium. See [Chapter 13](../../3-integration/13-advanced-transistors/README.md).

| Method | Principle | Typical use | Characteristics |
|---|---|---|---|
| Thermal oxidation | Silicon reacts with oxygen | High-quality oxide | Excellent quality, needs high temperature |
| CVD | Gases react on the surface | Silicon oxide, silicon nitride, polysilicon, tungsten | The most widely used |
| PVD | Atoms knocked off a target | Metals, barrier layers | Good for metals, hard to cover deep holes |
| ALD | One atomic layer at a time | Ultra-thin films, gate insulators | The most uniform, but slow |
| Epitaxy | Growth that continues the crystal lattice | Epitaxial silicon, silicon germanium | Can grow single crystals |

<!-- Figure: the four deposition methods side by side (thermal oxidation, CVD, PVD, ALD) -->

---

## What to measure in a thin film

- **Thickness**: Is the film as thick as the target?
- **Uniformity**: Is the thickness the same at different places on a wafer and from wafer to wafer?
- **Step coverage**: Can the film cover an uneven surface evenly?
- **Stress**: The internal pull inside the film. Too much of it bows the wafer or makes the film peel.
- **Particles**: Were particles added during deposition?

> [!NOTE]
> **📖 Term | Step coverage (階梯覆蓋)**
>
> - **Definition**: On a surface with trenches or holes, whether the film is equally thick at the top, on the sidewalls and at the bottom.
> - **On the floor**: "The coverage in this hole is poor. The bottom is too thin."
> - **Related terms**: conformality, aspect ratio, void
> - **Common confusion**: Even coverage is not always good. When filling a narrow trench, if the sidewalls thicken at the same rate, the opening may close first and leave a void inside. For gap fill, you actually want the film to grow from the bottom up.

> [!TIP]
> **🔧 Know-how | After cleaning, get into the furnace quickly**
>
> - **Situation**: The wafer has finished its pre-furnace clean and is waiting to go into the oxidation furnace.
> - **Practice**: The wait between the two steps has an upper limit (Q-time). If the limit is exceeded, the wafer must be cleaned again.
> - **Why**: A freshly cleaned silicon surface is very "fresh." Left too long, it grows a layer of native oxide again and picks up contaminants from the air.
> - **If you skip it**: The grown oxide is lower in quality, which hurts the transistors' electrical performance and reliability.
> - **Related chapters**: [Chapter 10: Cleaning and Contamination Control](../../2-process-modules/10-cleaning/README.md)

> [!TIP]
> **🔧 Know-how | One furnace run decides the fate of a hundred wafers**
>
> - **Situation**: A furnace processes several lots at once, and a run takes hours.
> - **Practice**: Before loading, the system checks that all the wafers in the run are at the same step and use the same recipe. A few monitor wafers are also placed in the furnace and measured afterward to confirm the results of the run.
> - **Why**: Once a batch tool starts, it cannot be corrected partway through, and film deposition usually cannot be redone.
> - **If you skip it**: A single wrong setting affects several lots in the same run at once.
> - **Related chapters**: [Chapter 24: How Systems Run the Fab](../../6-beyond-the-fab/24-fab-systems/README.md)

---

## Common problems

| Problem | Possible cause | Result |
|---|---|---|
| Film too thick or too thin | Drift in temperature, time or gas flow | Affects electrical behavior and later etching |
| Poor uniformity | Uneven gas flow or temperature in the chamber | Dies behave differently across the wafer |
| Particles | Deposits flaking off the chamber walls | Defects, lower yield |
| Film peeling or cracking | Too much stress, poor adhesion | Structural damage |
| Voids | The opening closes before the gap is filled | Open circuits or reliability problems |

---

## Key takeaways

1. A chip is made of many thin films that provide insulation, conduction and process support.
2. Thermal oxidation grows high-quality oxide directly from silicon, and CVD deposits many materials through gas reactions.
3. PVD is mainly used for metals, and ALD deposits one atomic layer at a time, the most uniform but the slowest method.
4. Epitaxy grows single-crystal films that continue the crystal lattice underneath.
5. Thickness, uniformity, step coverage and stress are the main measures of a good film.

---

## Further reading

- Peter Van Zant, *Microchip Fabrication*, chapters on oxidation and deposition
- Hong Xiao, *Introduction to Semiconductor Manufacturing Technology*, chapters on CVD and PVD

---

[← Chapter 5: Lithography](../../2-process-modules/05-lithography/README.md) | [Contents](../../README.md) | [Chapter 7: Etching →](../../2-process-modules/07-etching/README.md)
