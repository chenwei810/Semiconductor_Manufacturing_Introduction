<!-- source: zh-TW/5-backend/20-wafer-test/README.md | sha: 668d03bb6a53 -->

# Chapter 20: Wafer Test — WAT and CP

> 📍 **Where the wafer is**
>
> - Previous stop: the front end is finished and the wafer leaves the fab
> - **This chapter: wafer test, checking that the process was normal and whether each die is good or bad**
> - Next stop: packaging

---

## Two kinds of wafer test

After the front end is finished, and before the wafer is cut, it goes through two kinds of test:

| Test | What it tests | Purpose |
|---|---|---|
| WAT | Test structures in the scribe lines | Confirm that the process was normal |
| CP | The function of every die | Find out which dies are good |

Put simply, WAT checks "was the process done right," and CP checks "does each chip work."

---

## WAT: the report card of the process

In the scribe lines between the dies sit many small structures designed only for testing, called **test keys**, such as individual transistors, resistors, capacitors and long chains of vias.

WAT touches these test keys with probes and measures parameters such as transistor Vt, drive current and leakage current, as well as resistance, contact resistance and capacitance. These parameters directly reflect the results of the process, such as whether line widths, film thicknesses and doping concentrations have shifted. Wafers that fail WAT are usually not shipped.

> [!NOTE]
> **📖 Term | WAT (Wafer Acceptance Test, 晶圓允收測試)**
>
> - **Definition**: Measuring the electrical parameters of the test keys in the scribe lines to confirm that the wafer's process results meet specifications.
> - **On the floor**: "Vt on this lot's WAT is high. Ask the integration engineer to take a look."
> - **Related terms**: test key, scribe line, Vt, sheet resistance
> - **Common confusion**: WAT tests the test keys, not the product circuits themselves. It shows that the process was normal, but it does not guarantee that every die is good.

---

## CP: testing die by die

**CP** (chip probing, also called wafer sort) tests every die on the wafer. It needs three main pieces of equipment:

- **Probe card**: Carries many extremely fine probe needles arranged to match the positions of the pads on a die.
- **Prober**: Moves the wafer so that the probes land precisely on the pads of each die.
- **Tester**: Sends test signals and judges whether the die responds correctly.

After a die is tested, it is assigned to a category based on the result, called a **bin**. Arranging the bins of all the dies by position produces the wafer map described in Chapter 17.

<!-- Figure: CP test setup (relative positions of the tester, probe card, prober and wafer) -->

> [!NOTE]
> **📖 Term | Bin (分類)**
>
> - **Definition**: The category a die is assigned to after testing. Usually one bin means pass, and the other bins represent different failure reasons.
> - **On the floor**: "There are a lot of bin 5s on this wafer. Check which test item failed."
> - **Related terms**: wafer map, test program, yield
> - **Common confusion**: The numbers and meanings of bins are defined by each product's test program, so the same bin number can mean different failures on different products.

Memory also goes through **repair** at CP: bad memory cells are found, fuses switch them to spare circuits, and the die is tested again. See [Chapter 14](../../3-integration/14-memory/README.md).

---

## Testing costs money too

Testers are very expensive, and every second of test time per die turns directly into cost. Test engineers have to balance "testing thoroughly enough" against "testing fast enough," and they often test several dies at once to improve efficiency.

> [!TIP]
> **🔧 Know-how | Passing WAT does not mean every die is good**
>
> - **Situation**: A wafer passes every WAT item, but its CP yield is poor.
> - **Practice**: Treat WAT as a health check of the process and CP as the real physical exam of the product, and look at both together.
> - **Why**: WAT measures test keys at only a few places in the scribe lines and cannot represent every die on the wafer. Randomly scattered defects, for example, may not be caught at all.
> - **If you skip it**: Looking only at WAT, you would think the wafer is fine and miss the clues to a yield problem.
> - **Related chapters**: [Chapter 17: Yield and Failure Analysis](../../4-yield-and-quality/17-yield-analysis/README.md)

---

## Handing the wafer map to packaging

After CP, the wafer map travels with the wafer to the packaging house as electronic data. During packaging, the tools pick only the dies marked as good. These dies are called **KGD** (known good dies).

> [!TIP]
> **🔧 Know-how | The wafer map must match the wafer exactly**
>
> - **Situation**: The wafer arrives at the packaging house, and the tools must pick the good dies according to the wafer map.
> - **Practice**: Use the wafer ID to confirm that the data and the physical wafer are the same wafer, and use the marks on the wafer to confirm its orientation, so that every position on the map corresponds to the right die.
> - **Why**: A wafer map is only data. If it is matched incorrectly, the tools will pick dies according to the wrong data.
> - **If you skip it**: Bad dies get packaged and shipped, good dies get thrown away, and the problem is often found only at the customer.
> - **Related chapters**: [Chapter 24: How Systems Run the Fab](../../6-beyond-the-fab/24-fab-systems/README.md)

---

## Common problems

| Problem | Possible cause | Result |
|---|---|---|
| Poor contact | Worn or contaminated probes, abnormal pad surface | Good dies judged bad |
| Probe marks too deep | Too much probe force, too many retests | Damaged pads that affect later wire bonding |
| Tester-to-tester differences | Different testers or probe cards behave differently | Yield depends on the tester |
| Wafer map mismatch | Wrong wafer ID or orientation | The wrong dies are picked during packaging |

---

## Key takeaways

1. Wafer test has two parts: WAT checks the process, and CP checks every die.
2. WAT measures the electrical parameters of test keys in the scribe lines and is the report card of the process.
3. CP tests die by die with a probe card and sorts the results into bins, forming the wafer map.
4. Memory has its bad cells repaired at CP.
5. The wafer map goes with the wafer to the packaging house, where it is used to pick the good dies.

---

## Further reading

- Michael L. Bushnell and Vishwani D. Agrawal, *Essentials of Electronic Testing for Digital, Memory and Mixed-Signal VLSI Circuits*
- Peter Van Zant, *Microchip Fabrication*, chapters on wafer test

---

[← Chapter 19: Handling Abnormalities and Engineering Changes](../../4-yield-and-quality/19-abnormality-handling/README.md) | [Contents](../../README.md) | [Chapter 21: Packaging →](../../5-backend/21-packaging/README.md)
