<!-- source: zh-TW/3-integration/14-memory/README.md | sha: ab6055c10211 -->

# Chapter 14: Memory Processes — DRAM, 3D NAND and HBM

> 📍 **Where the wafer is**
>
> - Previous stop: the transistor structures of logic chips
> - **This chapter: how memory is made: DRAM, 3D NAND and HBM**
> - Next stop: what the "nanometers" in a process name really mean

---

## How memory differs from logic

A logic chip, such as a processor, contains all kinds of circuits, needs many layers of metal wiring, and is built for speed. Memory is a huge array of billions of **identical memory cells**, built for **density and cost per bit**.

A memory chip usually has two parts:

- **Memory array**: The memory cells that store data. They take up most of the chip area.
- **Periphery**: The logic circuits that handle reading, writing and address selection.

| Type | Data after power-off | Main use | Characteristics |
|---|---|---|---|
| DRAM | Lost | Main memory of computers and phones | Fast, but must be refreshed constantly |
| NAND flash | Kept | Solid-state drives, phone storage | High capacity, low cost |

---

## DRAM: one transistor and one capacitor

Each DRAM memory cell is made of **one transistor and one capacitor**. The transistor is a switch, and the capacitor is a small bucket that holds charge: charge means 1, no charge means 0.

The bucket slowly leaks, so DRAM must regularly read the data out and write it back. This is called **refresh**. See [Chapter 25](../../6-beyond-the-fab/25-process-and-firmware/README.md).

The biggest challenge in DRAM manufacturing is the capacitor. The cell area keeps shrinking, but the capacitor still has to hold enough charge, so the only way is up. The capacitors in modern DRAM are slender cylinders dozens of times taller than they are wide, like rows of skyscrapers. Etching and filling such deep structures requires extremely high-aspect-ratio etching and deposition.

To save area, DRAM transistors also have their gates buried in the silicon. These are called **buried word lines**.

<!-- Figure: DRAM memory cell cross-section (buried word line, bit line, tall cylindrical capacitor) -->

> [!NOTE]
> **📖 Term | DRAM (Dynamic Random Access Memory, 動態隨機存取記憶體)**
>
> - **Definition**: Memory that records data as charge stored in capacitors. It is fast, but it must be refreshed regularly, and its data is lost when power is off.
> - **On the floor**: "This DRAM generation is 1β."
> - **Related terms**: 1T1C, capacitor, word line, bit line, refresh
> - **Common confusion**: DRAM generations are named with codes such as 1x, 1y, 1z, 1α, 1β and 1γ. They all belong to the 10 nm class and cannot be compared directly with the "nanometers" of logic processes. See [Chapter 15](../../3-integration/15-process-nodes/README.md).

---

## 3D NAND: building upward

NAND flash stores charge in a special storage layer. The charge stays even when power is off, so the data is not lost.

Early NAND was planar. Once it shrank past a certain point, each cell could hold too few electrons, and neighboring cells disturbed each other. So the industry changed its approach: **stop shrinking and start stacking**. This is **3D NAND**. Its main flow is:

**Stack alternating oxide and nitride layers → Etch channel holes → Deposit storage layer and channel → Form the staircase → Replace nitride with metal**

1. **Stack**: Deposit alternating layers of oxide and nitride, hundreds of layers in total.
2. **Channel holes**: Etch through the entire stack in one go. The holes are so deep and narrow that they are often etched in several sections and joined together.
3. **Storage layer and channel**: Deposit the storage layer and the channel material along the walls of each hole.
4. **Staircase**: Shape the edge of the stack into steps, so contacts from above can land on each layer separately.
5. **Word line replacement**: Remove the nitride layers and replace them with metal, which becomes the word lines that control each layer of memory cells.

Many 3D NAND designs also place the periphery circuits **directly underneath** the memory array to save more area.

<!-- Figure: 3D NAND cross-section (alternating stacked layers, vertical channel holes, staircase at the edge) -->

> [!NOTE]
> **📖 Term | 3D NAND**
>
> - **Definition**: NAND flash with memory cells stacked vertically, increasing capacity by adding layers.
> - **On the floor**: "This generation added another few dozen layers."
> - **Related terms**: channel hole, staircase, word line replacement, high-aspect-ratio etching
> - **Common confusion**: Layer count is not the only metric. How many bits each cell stores, how large the cells are, and where the periphery sits all affect the real density and cost.

> [!TIP]
> **🔧 Know-how | The taller the stack, the more the wafer bends**
>
> - **Situation**: 3D NAND stacks hundreds of thin films on the wafer.
> - **Practice**: Tune the stress of each film carefully so that tension and compression cancel out, keep measuring how much the wafer bows, and deposit compensating films on the backside of the wafer when needed.
> - **Why**: Every film has a little stress. Added up over hundreds of layers, it is enough to warp the whole wafer.
> - **If you skip it**: The wafer cannot lie flat in the scanner, causing alignment errors. In severe cases, robot arms cannot even pick up and place the wafer normally.
> - **Related chapters**: [Chapter 6: Thin Films](../../2-process-modules/06-thin-films/README.md)

---

## HBM: stacking DRAM

AI computing needs to move huge amounts of data between processors and memory. **HBM** (high bandwidth memory) stacks several DRAM dies vertically and places them right next to the processor, greatly increasing the bandwidth of data transfer.

The stacked DRAM dies are connected by vertical wires that pass through the dies, called **TSVs**. The main steps of making HBM are: build the TSVs, thin the wafers down to only a few dozen micrometers, form tiny bumps, and then stack and bond 8, 12 or even more dies. For how HBM is integrated with the processor, see [Chapter 22](../../5-backend/22-advanced-packaging/README.md).

> [!NOTE]
> **📖 Term | TSV (Through-Silicon Via, 矽穿孔)**
>
> - **Definition**: A metal-filled wire that passes vertically through an entire die, so that dies stacked on top of each other can connect directly.
> - **On the floor**: "The TSV is too deep. The copper didn't fill it completely."
> - **Related terms**: HBM, wafer thinning, micro bump, 3D stacking
> - **Common confusion**: A TSV is not the same as the vias inside a chip. A via only connects neighboring metal layers inside the chip, while a TSV goes through the whole silicon substrate.

> [!TIP]
> **🔧 Know-how | Memory hides spare circuits**
>
> - **Situation**: A memory chip has billions of cells, and it is almost impossible for every one of them to be perfect.
> - **Practice**: Spare rows and columns are built in at design time. When testing finds bad cells, fuses switch them over to the spare circuits. This is called **repair**.
> - **Why**: As long as the number of bad cells is within what can be repaired, the whole chip can be "saved."
> - **If you skip it**: A single bad cell would mean scrapping the whole chip, and memory yield would be unacceptably low.
> - **Related chapters**: [Chapter 20: Wafer Test](../../5-backend/20-wafer-test/README.md)

---

## Key takeaways

1. Memory is made of huge numbers of identical cells and is built for density and cost per bit.
2. DRAM stores data with one transistor and one capacitor, and the capacitor must be made tall and thin.
3. 3D NAND stops shrinking the cells and stacks them upward instead, to hundreds of layers.
4. HBM uses TSVs to stack several DRAM dies, providing extremely high bandwidth.
5. Memory uses spare circuits to repair bad cells and raise yield.

---

## Further reading

- Rino Micheloni, Luca Crippa and Alessia Marelli, *Inside NAND Flash Memories*
- Bruce Jacob, Spencer W. Ng and David T. Wang, *Memory Systems: Cache, DRAM, Disk*

---

[← Chapter 13: Advanced Transistor Structures](../../3-integration/13-advanced-transistors/README.md) | [Contents](../../README.md) | [Chapter 15: What Does "3 nm" Really Mean? →](../../3-integration/15-process-nodes/README.md)
