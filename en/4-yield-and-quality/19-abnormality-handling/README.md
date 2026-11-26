<!-- source: zh-TW/4-yield-and-quality/19-abnormality-handling/README.md | sha: 8d39f2549c7a -->

# Chapter 19: Handling Abnormalities and Engineering Changes — How the Fab Responds When Things Go Wrong

> 📍 **Where the wafer is**
>
> - Previous stop: process control raised an alarm
> - **This chapter: handling abnormalities and managing process changes**
> - Next stop: the wafer finishes the front end and gets ready for test

---

## Abnormalities will happen

A fab has more than a thousand tools and hundreds of steps, and abnormalities are bound to happen: data goes outside the control limits, a tool raises an alarm, the defect count suddenly jumps, or someone makes an operating mistake. The point is not "never make a mistake." It is **to respond quickly and consistently when something goes wrong**, and keep the loss as small as possible.

The basic order for handling an abnormality is:

**Detect → Contain → Find the scope → Disposition → Find the root cause → Prevent recurrence**

---

## OCAP: response steps written in advance

An abnormality may happen in the middle of the night, and the person on shift is not necessarily the engineer who knows the process best. So the fab writes down the response steps for every common abnormality in advance.

> [!NOTE]
> **📖 Term | OCAP (Out of Control Action Plan, 異常處理計畫)**
>
> - **Definition**: Predefined response steps for a specific abnormality: what to check, what to do, and whom to notify.
> - **On the floor**: "This OOC follows the OCAP: stop the tool and run a monitor wafer first."
> - **Related terms**: OOC, hold, SPC
> - **Common confusion**: An OCAP is not a report written afterward. It is the action guide for the moment the abnormality happens, so that every shift and every person responds in the same way.

---

## Hold: stop it first

After an abnormality is detected, the first action is usually a **hold**: the wafers that may be affected are stopped, and the problem tool is taken out of service so that no more wafers go into it.

Holds have a few key features:

- Every hold must record its reason and an owner.
- Only authorized people can release a hold.
- A **future hold** can also be set: the wafers keep moving, and they are automatically stopped when they reach a specified step, for example to wait for the measurement results at the next step before deciding.

> [!TIP]
> **🔧 Know-how | The first job is to contain, not to fix**
>
> - **Situation**: A tool is found to be producing abnormal results.
> - **Practice**: Stop the tool and hold the suspect wafers first, then start investigating the cause.
> - **Why**: Finding the cause can take hours. If the tool keeps running during the investigation, more and more wafers are affected.
> - **If you skip it**: A problem that would have affected only one or two lots grows to a dozen or more, and the loss multiplies.
> - **Related chapters**: [Chapter 18: Process Control](../../4-yield-and-quality/18-process-control/README.md)

---

## Finding the scope

Once the problem is contained, you have to work out **which wafers may have been affected**. This is where the history recorded by the factory systems comes in: find out which wafers went through this tool, or this chamber, during the abnormal period.

> [!TIP]
> **🔧 Know-how | The scope starts from the "last known good" point**
>
> - **Situation**: A tool is found to be abnormal this afternoon, but nobody knows when the problem started.
> - **Practice**: Go back to the last time the tool was confirmed to be normal, for example the last time a monitor wafer passed. Every wafer that went through the tool after that point is treated as suspect.
> - **Why**: The problem may have started long before anyone noticed it. Holding only the wafers found at the moment of detection misses the ones affected earlier.
> - **If you skip it**: Bad wafers are released and discovered only at test, or even at the customer. This is also why tools need regular checks: the more often they are checked, the smaller the suspect scope.
> - **Related chapters**: [Chapter 24: How Systems Run the Fab](../../6-beyond-the-fab/24-fab-systems/README.md)

---

## Disposition: release, rework or scrap

Once the scope is clear, the fate of each lot has to be decided:

| Disposition | Meaning | When it applies |
|---|---|---|
| Release | No impact confirmed; production continues | The abnormality does not affect product quality |
| Rework | Remove part of the result and do it again | Steps that can be redone, mainly lithography |
| Scrap | The wafers are taken out of production | The damage cannot be undone, or continuing is too risky |
| Conditional release | Production continues with extra checks later or special marking | The impact is still uncertain and more data is needed |

When the impact is large or uncertain, a **material review board** (MRB) meets, and the process, integration, quality and other departments decide together. The customer is notified when necessary.

After the disposition, the **root cause** must still be found, corrective actions put in place, and it must be confirmed that the same problem will not happen again.

---

## Engineering changes: change is a risk too

It is not only abnormalities that need managing; change itself is a risk. Modifying a recipe, adjusting the flow, switching materials or suppliers, or adding a tool can all affect a product's electrical behavior, yield and reliability.

So every change goes through a formal process: assess the risk, verify it with experimental lots, run reliability tests when needed, and put it into production only after it is approved. Major changes must also be announced to customers in advance.

> [!NOTE]
> **📖 Term | ECN and PCN (Engineering Change Notice / Process Change Notification)**
>
> - **Definition**: An ECN is the fab's internal engineering change notice and approval process. A PCN is a notice sent to customers about a process or product change.
> - **On the floor**: "This recipe change has to go through an ECN." "Switching materials means sending the customer a PCN."
> - **Related terms**: change management, qualification, reliability testing, split lot
> - **Common confusion**: Not only big changes need to go through the process. A change that looks tiny, such as adjusting one temperature setting, can still affect reliability, so it has to be assessed as well.

---

## Key takeaways

1. Abnormalities are bound to happen; what matters is responding quickly and consistently.
2. The order is: contain, find the scope, disposition, find the root cause, and prevent recurrence.
3. An OCAP lets people on every shift handle abnormalities with the same steps.
4. The suspect scope starts from the last point at which the tool was confirmed to be normal.
5. Every engineering change must be assessed and verified, and major changes must be announced to customers.

---

## Further reading

- JEDEC, J-STD-046, *Customer Notification Standard for Product/Process Changes by Electronic Product Suppliers*
- Gary S. May and Costas J. Spanos, *Fundamentals of Semiconductor Manufacturing and Process Control*

---

[← Chapter 18: Process Control](../../4-yield-and-quality/18-process-control/README.md) | [Contents](../../README.md) | [Chapter 20: Wafer Test →](../../5-backend/20-wafer-test/README.md)
