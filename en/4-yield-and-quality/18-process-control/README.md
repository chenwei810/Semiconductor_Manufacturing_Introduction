<!-- source: zh-TW/4-yield-and-quality/18-process-control/README.md | sha: 1021e2da5c41 -->

# Chapter 18: Process Control — Keeping the Process Stable with Data

> 📍 **Where the wafer is**
>
> - Previous stop: metrology and inspection produced a large amount of data
> - **This chapter: using that data to keep the process stable**
> - Next stop: how the fab responds when the data shows something abnormal

---

## Every run is a little different

The same tool with the same recipe produces slightly different results every time. Tool parts wear, chemicals age, and the room temperature changes, and all of this makes a process slowly drift.

The goal of process control is not to eliminate all variation. It is **to keep variation small and stable**, and to catch drift before it becomes serious. The earlier it is caught, the fewer wafers are affected.

---

## Specification limits and control limits

Process control has two very important sets of limits:

- **Specification limits**: The range the product requires. Outside it, the product is out of spec.
- **Control limits**: A range calculated from how the process normally behaves, usually narrower than the specification limits. Outside it, the process is "not behaving as usual" and something may be wrong.

Think of driving: the specification limits are the edges of the road, and going over them means an accident. The control limits are the lane markings. As soon as you touch them, you should correct your steering, without waiting until you are about to leave the road.

> [!NOTE]
> **📖 Term | OOC and OOS (Out of Control / Out of Spec)**
>
> - **Definition**: OOC means the data is outside the control limits, a sign that the process is behaving abnormally. OOS means the data is outside the specification limits, so the product does not meet requirements.
> - **On the floor**: "This point is OOC. Follow the OCAP and check the tool first." "If it's OOS, we need an MRB to disposition it."
> - **Related terms**: control limits, specification limits, OCAP, SPC
> - **Common confusion**: OOC does not mean the product is bad, but it does mean the process may be going wrong and must be dealt with. OOS means the product itself is already out of spec.

---

## SPC: drawing the data as control charts

**Statistical process control** (SPC) plots every measurement in time order on a **control chart**, which has a center line and upper and lower control limits.

Engineers use a set of rules to spot abnormal patterns, for example:

- One point falls outside the control limits.
- Several points in a row fall on the same side of the center line, meaning the average may have shifted.
- Several points in a row keep rising or falling, meaning the process is drifting.

The point of these rules is that even when every point is still within spec, a "shape" that looks wrong deserves attention.

<!-- Figure: a control chart (center line, control limits, specification limits, with examples of a point outside the limits and a run of shifted points) -->

---

## Process capability: Cpk

The **process capability index** (Cpk) uses a single number to describe how "comfortably" a process fits inside its specifications.

Think of parking: the specifications are the parking space, and the spread of the process is the width of the car. The narrower the car and the more centered it is, the farther it is from the lines on both sides, and the higher the Cpk. A high Cpk means that even if the process shifts a little, it is unlikely to go out of spec.

A common industry requirement is a Cpk of at least 1.33. Products with stricter requirements, such as automotive chips, have even higher standards.

---

## Design of experiments and split lots

You cannot find the best process conditions by changing one parameter at a time and slowly trying. **Design of experiments** (DOE) changes several factors at once in a systematic way to find the best combination with as few experiments as possible.

The most common kind of experiment in a fab is the **split lot**: one lot is divided into several groups, each group uses a different condition, and everything else stays the same. Because the wafers in one lot have almost identical histories, this is the fairest comparison.

---

## Automatic control: R2R and FDC

Advanced fabs let systems control the process automatically. The two most common methods are:

- **R2R** (run-to-run): Automatically fine-tunes the recipe of the next lot based on the measurements of the previous lots. For example, if the line width is running large, the exposure dose of the next lot is adjusted; if a worn pad makes polishing slower, the polishing time is extended. It is like turning up the hot water when the shower feels a little cold.
- **FDC** (fault detection and classification): Watches the tool's sensor data in real time during processing, such as pressure, temperature, power and gas flow. As soon as a trace looks abnormal, it raises an alarm and can stop a problem even before the wafer is measured. It is like the warning lights on a car's dashboard.

> [!NOTE]
> **📖 Term | R2R and FDC**
>
> - **Definition**: R2R is a control method that automatically adjusts the process parameters of the next lot based on measurement results. FDC is a system that monitors tool sensor data in real time to detect abnormalities. Both are part of advanced process control (APC).
> - **On the floor**: "R2R has been compensating upward for the last few lots." "FDC caught an RF power excursion and the tool stopped itself."
> - **Related terms**: APC, SPC, sensor data, recipe
> - **Common confusion**: R2R adjusts "between runs," based on measurement results. FDC monitors "during the run," based on the tool's sensor data.

> [!TIP]
> **🔧 Know-how | Correct when you touch the line; don't wait to leave the road**
>
> - **Situation**: A measurement falls outside the control limits but is still within spec.
> - **Practice**: Follow the predefined response steps and check the tool and the process right away, instead of ignoring it because "the product is still in spec."
> - **Why**: Control limits exist to give early warning. Today it is only OOC; the next lot may be OOS.
> - **If you skip it**: By the time the data actually goes out of spec, many lots may already be affected.
> - **Related chapters**: [Chapter 19: Handling Abnormalities and Engineering Changes](../../4-yield-and-quality/19-abnormality-handling/README.md)

> [!TIP]
> **🔧 Know-how | Automatic compensation can hide problems**
>
> - **Situation**: The R2R system keeps the measurements near the target, and everything looks normal.
> - **Practice**: Besides the measurements, also watch the size of the R2R adjustments themselves, for example whether the exposure dose keeps being pushed further and further.
> - **Why**: R2R keeps compensating for the tool's drift. The results look normal, but the tool may be steadily getting worse.
> - **If you skip it**: The problem surfaces all at once when the adjustment range runs out and can no longer compensate, after it has been building for a long time.
> - **Related chapters**: [Chapter 16: Metrology and Inspection](../../4-yield-and-quality/16-metrology/README.md)

---

## Key takeaways

1. Processes always vary. The goal of control is to keep variation small and stable and to catch drift early.
2. Control limits are narrower than specification limits. OOC is an early warning; OOS means the product is out of spec.
3. SPC control charts look not only at single points outside the limits but also at trends over several points.
4. Cpk describes how comfortably a process fits inside its specs, and DOE and split lots are used to find the best conditions.
5. R2R adjusts the process automatically and FDC monitors tools in real time, but automatic compensation can also hide problems.

---

## Further reading

- Douglas C. Montgomery, *Introduction to Statistical Quality Control*
- Gary S. May and Costas J. Spanos, *Fundamentals of Semiconductor Manufacturing and Process Control*

---

[← Chapter 17: Yield and Failure Analysis](../../4-yield-and-quality/17-yield-analysis/README.md) | [Contents](../../README.md) | [Chapter 19: Handling Abnormalities and Engineering Changes →](../../4-yield-and-quality/19-abnormality-handling/README.md)
