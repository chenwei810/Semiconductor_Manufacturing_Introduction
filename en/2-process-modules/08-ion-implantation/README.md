<!-- source: zh-TW/2-process-modules/08-ion-implantation/README.md | sha: 1d3bbe8ecb69 -->

# Chapter 8: Ion Implantation and Thermal Processing — Changing How Silicon Conducts

> 📍 **Where the wafer is**
>
> - Previous stop: lithography, photoresist now blocks the areas that must not be implanted
> - **This chapter: ion implantation and annealing, adding impurities to chosen areas to change their electrical behavior**
> - Next stop: strip the resist and clean

---

## Why implant

Chapter 2 explained that silicon needs small amounts of impurities to become N-type or P-type. A transistor needs many different doped regions, such as the N-well, the P-well, the source and the drain, and the **position, concentration and depth** of each region must be controlled precisely.

The early method was to place wafers in a hot gas containing the impurity and let it slowly diffuse into the silicon, but that was hard to control precisely. Modern processes use **ion implantation** instead: impurity atoms are turned into ions, accelerated, and shot directly into the silicon. It is like a gun that lets you set exactly how many bullets to fire and how fast, so the impurities land at the chosen place and depth.

---

## How an implanter works

**Ion source → Mass analysis → Acceleration → Scanning → Wafer**

1. **Ion source**: Turns a gas containing boron, phosphorus or arsenic into charged ions.
2. **Mass analysis**: The ions pass through a magnetic field. Ions of different masses bend by different amounts, so only the wanted species gets through.
3. **Acceleration**: An electric field accelerates the ions to the required energy.
4. **Scanning**: The ion beam is swept evenly across the whole wafer.

Wherever photoresist covers the wafer, it stops the ions, so only the areas opened in the resist get implanted. That is why a lithography step comes before implantation.

<!-- Figure: an ion implanter (ion source, mass-analyzing magnet, acceleration section, scanning, wafer) -->

---

## The two most important parameters

- **Dose**: How many atoms are implanted per unit area. It sets the doping concentration.
- **Energy**: How fast the ions travel. It sets how deep they go.

> [!NOTE]
> **📖 Term | Dose and energy (劑量與能量)**
>
> - **Definition**: Dose is the number of atoms implanted per unit area; energy is how strongly the ions are accelerated.
> - **On the floor**: "The dose on this step is 1E15," meaning 10 to the 15th power atoms per square centimeter.
> - **Related terms**: implant angle, sheet resistance, Vt adjust
> - **Common confusion**: Higher energy means the ions go deeper, not that more atoms go in. The number of atoms is set by the dose.

The silicon crystal contains rows of open "tunnels" between its neatly arranged atoms. If ions happen to enter along one of these tunnels, they glide in much too deep. This is called **channeling**. That is why the wafer is usually tilted slightly during implantation to avoid lining up with the tunnels.

---

## Annealing: repair and activation

Ions slamming into the silicon at high speed knock the orderly silicon atoms out of place, and the newly implanted impurity atoms are not yet in their proper positions, so they cannot do their job. After implantation, the wafer is therefore **annealed**: it is heated so the crystal lattice repairs itself and the impurity atoms move into the right positions and start conducting. This is called **activation**.

Common annealing methods, from long to short:

- **Furnace anneal**: Heating in a furnace for tens of minutes or more.
- **Rapid thermal anneal** (RTA): Strong lamps heat the wafer to a high temperature within seconds.
- **Millisecond anneal**: A laser or flash lamp heats only the wafer surface for an extremely short time.

> [!NOTE]
> **📖 Term | Anneal (退火)**
>
> - **Definition**: A process that uses heat to repair crystal damage and activate the impurities.
> - **On the floor**: "After implant, it still needs an RTA."
> - **Related terms**: activation, diffusion, thermal budget, RTA
> - **Common confusion**: Annealing does not only repair the lattice; it also makes the impurities spread out. The higher the temperature and the longer the time, the farther they travel, so annealing is always a balance between activation and diffusion.

---

## Thermal budget: heat comes with a limit

The total amount of high-temperature exposure a wafer experiences across the whole process is called its **thermal budget**. Every high-temperature step makes the previously implanted impurities diffuse a bit more. For transistors only tens of nanometers in size, impurities moving a few extra nanometers can change their electrical behavior.

Also, once metal wiring is on the wafer, temperatures must drop sharply, or the metal and the materials around it will be damaged. This is one of the reasons the order of the process steps has to be planned carefully.

After implantation and annealing, fabs usually measure the **sheet resistance** of monitor wafers to confirm that the doping came out right.

> [!TIP]
> **🔧 Know-how | A wrong implant is invisible to the eye**
>
> - **Situation**: A wafer implanted incorrectly looks exactly the same as a correct one.
> - **Practice**: Implanter recipes and parameters are controlled especially tightly. The system double-checks the species, dose and energy before the tool starts, and the tool monitors the dose in real time.
> - **Why**: Implant mistakes cannot be seen by eye or under an ordinary microscope. They often show up only at electrical test weeks later, and the step cannot be redone.
> - **If you skip it**: The mistake rides along to the end of the line before it is found, all the work in between is wasted, and many lots may already be affected.
> - **Related chapters**: [Chapter 20: Wafer Test](../../5-backend/20-wafer-test/README.md), [Chapter 24: How Systems Run the Fab](../../6-beyond-the-fab/24-fab-systems/README.md)

> [!TIP]
> **🔧 Know-how | Put the high-temperature steps as early as possible**
>
> - **Situation**: Planning the complete process flow for a product.
> - **Practice**: Steps that need high temperatures are placed as early as possible, and later steps run cooler and cooler. Anneals also use the shortest method that works.
> - **Why**: Diffusion adds up. Every later heating step distorts the doped regions built earlier.
> - **If you skip it**: The source and drain doping spreads too deep and too wide, leakage goes up and Vt shifts.
> - **Related chapters**: [Chapter 12: A Complete CMOS Process Flow](../../3-integration/12-cmos-process-flow/README.md)

---

## Common problems

| Problem | Possible cause | Result |
|---|---|---|
| Dose shift | Wrong recipe setting, dose measurement problem | Vt and resistance shift |
| Wrong species or energy | Wrong recipe or gas | Completely wrong electrical behavior; usually only scrap |
| Non-uniform implant | Beam scanning problem | Electrical behavior varies across the wafer |
| Resist fails to block | Resist too thin or defective | Areas that should not be implanted get implanted |
| Anneal temperature drift | Heating system problem | Incomplete activation or too much diffusion |

---

## Key takeaways

1. Ion implantation accelerates impurity atoms and shoots them into silicon, precisely controlling where they go, how many there are and how deep they reach.
2. Dose sets the concentration, and energy sets the depth.
3. Implantation damages the crystal, so annealing is needed to repair it and activate the impurities.
4. The thermal budget is limited, and high temperatures make impurities diffuse, so the order of steps must be planned carefully.
5. Implant mistakes cannot be seen and cannot be redone, so they are controlled especially tightly.

---

## Further reading

- James D. Plummer, Michael D. Deal and Peter B. Griffin, *Silicon VLSI Technology*, chapters on ion implantation and diffusion
- Peter Van Zant, *Microchip Fabrication*, chapters on doping

---

[← Chapter 7: Etching](../../2-process-modules/07-etching/README.md) | [Contents](../../README.md) | [Chapter 9: CMP →](../../2-process-modules/09-cmp/README.md)
