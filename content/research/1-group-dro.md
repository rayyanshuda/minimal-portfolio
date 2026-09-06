---
id: group-dro
title: Decomposing Group DRO
order: 1
links:
  - url: hhttps://github.com/rayyanshuda/group-dro-research
  - url: https://www.rayyanhuda.com/papers/decomposing-group-dro.pdf
    label: pdf
---

## the idea

Most models are trained to minimize average loss. That's fine until the training data has a shortcut baked into it; some feature that correlates with the label almost everywhere but doesn't cause it. the model has no way to tell "correlated" from "causal," so it learns whichever one is easier, because the easier one still gets it a lower average loss.

Waterbirds is a synthetic benchmark built specifically to expose this. it pastes bird photos, landbirds and waterbirds, onto backgrounds, land and water, and in the training set the background matches the bird type about 95% of the time. so a model can partly ignore the bird and just read the background, and still score well, because the shortcut holds almost everywhere. the two combinations where it doesn't hold, waterbird-on-land and landbird-on-water, are where a shortcut-reliant model breaks.

Sagawa et al.'s 2020 paper, "Distributionally Robust Neural Networks for Group Shifts," proposes Group DRO to fix this: instead of minimizing average loss, minimize the loss of the worst-performing group, where a "group" is a (label, background) pair, four of them on Waterbirds. the algorithm does this with two mechanisms bundled together:

1. A **group-balanced sampler**: training batches are drawn so every group is seen roughly equally often, instead of at its natural (95%-skewed) frequency.
2. An **adversarial reweighting** on top of that: the loss tracks a per-group weight q<sub>g</sub>, and after every batch it raises the weight on whichever group currently has the highest loss, so the optimizer keeps getting pushed toward whatever's struggling the most.

The paper reports these two mechanisms only as a combined effect. I wanted to know something narrower: on this specific benchmark, how much of Group DRO's benefit comes from the sampler alone, before the adversarial part is ever switched on? The two mechanisms have very different costs. The sampler is a five-line change to a data loader. The adversarial reweighting means tracking per-group losses and adding an extra optimization step every iteration.

## the setup

I reproduced Group DRO from the paper and the reference implementation, `kohpangwei/group_DRO`, training a ResNet-50 on Waterbirds from the WILDS package. SGD, momentum 0.9, learning rate 1e-3, weight decay 1e-4, batch size 128, 300 epochs, no augmentation, matching the paper's reference configuration exactly. every 300-epoch run took 7–7.5 hours on Kaggle's free T4x2 GPUs; the three configurations in this post add up to about 21.6 GPU-hours.

I audited the loaded dataset before touching a training loop, and my split counts matched the paper's Table 1 exactly:

| split | landbird/land | landbird/water | waterbird/land | waterbird/water | total |
|---|---|---|---|---|---|
| train | 3,498 | 56 | 184 | 1,057 | 4,795 |
| val | 467 | 133 | 466 | 133 | 1,199 |
| test | 2,255 | 642 | 2,255 | 642 | 5,794 |

Val and test are constructed background-independent (identical land/water split within each label); train is ~95% correlated. That asymmetry is pretty much the whole experiment. Also worth noticing, the rarest training group, waterbird/land, has only 56 examples. A lot of what follows traces back to that number.

One thing that isn't obvious until you actually build this: there are two different ways to pick which checkpoint to report, best validation *average* accuracy, or best validation *worst-group* accuracy. I report both throughout, just so I don't miss anything.

Everything below is a single training run per configuration, not averaged over seeds, it's a limitation I've flagged to show that these numbers can vary within an unidentified reasonable range. With only 56 training examples in the rarest group, a single run's worst-group number is going to carry seed-to-seed noise I haven't measured.

## reproducing group DRO

first, plain ERM, no reweighting, no robust loss:

| model selected by | avg. accuracy | worst-group accuracy |
|---|---|---|
| best val worst-group acc | 97.25% | **68.54%** |
| best val average acc | 97.33% | 60.12% |
| paper's reported number | 97.3% | 72.6% |

Average accuracy is close to an exact match to the paper. Worst-group accuracy is in the right neighborhood but about 4 points under theirs; I'm reading that as single-seed variance on a 56-example group, since the per-group breakdown looks exactly like the spurious-correlation story predicts: landbird/land 99.4%, landbird/water 72.0%, waterbird/land 68.5% (the minimum), waterbird/water 96.0%.

What I didn't expect: just switching which checkpoint gets reported moved worst-group accuracy by **8.4 points** (60.12% → 68.54%) while average accuracy barely moved at all. The same training run, same weights sitting in the same loss curve the whole time, the only difference is which epoch you point to. I'd been treating checkpoint selection as an implementation detail. It isn't, it's a free 8-point swing with nothing to do with the algorithm.

Then full Group DRO, same everything else, plus the balanced sampler and the adversarial loss:

| model selected by | avg. accuracy | worst-group accuracy |
|---|---|---|
| best val worst-group acc | 95.40% | **86.14%** |
| best val average acc | 97.57% | 70.72% |
| paper's reported number (standard reg.) | 97.4% | 76.9% |

Against my own ERM baseline, this is the main reproduction claim: **+17.60 points** worst-group accuracy for a cost of only **1.85 points** average accuracy. that's the paper's central thesis, reproduced from scratch.

## so which part is actually doing the work?

This is the actual question of the project. I trained a third configuration, identical to the Group DRO run above in every respect, same architecture, same hyperparameters, same 300 epochs, same balanced sampler, except the loss function is plain cross-entropy instead of the adversarial exponentiated-gradient loss. That isolates the sampler: any gap between this and ERM comes from balanced sampling alone, since the loss didn't change. The remaining gap between this and full Group DRO is what the adversarial reweighting adds on top.

(small side note: this run never needs to route group indices into the loss computation, so it skipped a CPU/GPU device-mismatch bug the full Group DRO implementation needed a fix for, plain cross-entropy only needs `x, y`. Thankfully, it worked on the first try.)

| arm | avg. accuracy | worst-group accuracy | Δ avg vs. ERM | Δ worst-group vs. ERM |
|---|---|---|---|---|
| ERM (no reweighting, plain CE) | 97.25% | 68.54% | — | — |
| **balanced-sampling-only** | 96.28% | **83.02%** | −0.97 pts | **+14.48 pts** |
| full Group DRO | 95.40% | **86.14%** | −1.85 pts | **+17.60 pts** |

Of Group DRO's total +17.60-point gain over ERM, **balanced sampling alone recovers +14.48 points, 82% of the total, before the adversarial loss is introduced at all.** The adversarial reweighting adds a smaller +3.12 points on top, 18% of the total gain. The average-accuracy cost splits more evenly: −0.97 points from the sampler, another −0.88 from adding the robust loss.

That 18% isn't spread evenly. Per-group accuracy for balanced-sampling-only: landbird/land 98.0%, landbird/water 88.3%, waterbird/land 83.0% (the minimum), waterbird/water 92.8%. Moving to full Group DRO, three of those four groups shift by a point or less (98.0→96.7, 88.3→87.9, 92.8→92.8, pretty much unchanged), while the rarest training group, the same 56-example waterbird/land, improves by another 3.1 points, 83.0% → 86.1%. that's the mechanism working as it should: balanced sampling already gets every group seen equally often per epoch; the adversarial weight additionally biases the loss toward whichever group is currently struggling hardest, and on this benchmark that's consistently the same small, background-conflicted group.

To be clear about what this doesn't say: the full pipeline still wins outright, 86.14% vs. 83.02%, it isn't an argument that the adversarial reweighting is redundant. It's that on Waterbirds specifically, most of the benefit reported under Group DRO's name is coming from a much simpler mechanism sitting inside it. And since this is one benchmark, one architecture, one hyperparameter setting, single seed, I'm treating the 82%/18% split as an observation about this setup, not a general property of Group DRO. This pattern isn't unprecedented either, work on class-imbalanced classification has separately found that data-level rebalancing captures a large share of the benefit that gets credited to more elaborate loss-design interventions, and Idrissi et al. (2022) report the same conclusion across several standard group-shift benchmarks, including Waterbirds. My ablation gives a mechanism-level view of the same pattern inside one specific algorithm, rather than comparing separately tuned methods against each other, which is a much more costly experiment.

## does the same trick work on a real dataset?

I run a separate project classifying wildfire images (check it out in my machine learning section), which has its own well-documented shortcut: the dataset combines Flickr and Unsplash photos, and a classifier that reads only which stock-photo source an image came from, ignoring the actual picture, scores 92.4% on the official test split. Source almost fully determines the label, the same shape of problem as Waterbirds' background, and it's the same failure mode documented in other domains, Zech et al. (2018) found chest X-ray models partly detecting which hospital's scanner took an image rather than reading the lungs.

I'd already tried one fix in my wildfire detection project: targeted color augmentation, on the theory that if the shortcut lives in the stock-photo color grading, messing with the color should hurt the shortcut without hurting the real signal. It failed across the board, slice AUC (accuracy on the subset where source and label are matched, which isolates shortcut reliance) dropped for every model: a small custom CNN 0.774→0.723, an EfficientNet-B0 trained from scratch 0.855→0.812, a pretrained EfficientNet-B0 0.942→0.934. In hindsight the reason is more obvious: fire is orange, and stock-photo polish is saturation and color grading. The shortcut and the true signal live in the same channel, so changing the color, damages the accuracy.

Group-balanced resampling is a fundamentally different kind of intervention; it never touches pixels, it only changes which examples get seen during training, so it seemed worth testing specifically because it couldn't collide with the true signal the way augmentation did. The rarest group here, Unsplash images of fire, has only 28 training examples, more sparse than Waterbirds' worst group. I thought the same risk going in that I had thought on Waterbirds: a sampler leaning that hard (for that many epochs too) on 28 images risks memorizing those specific photos rather than learning anything general.

Source-matched slice AUC, the headline metric for this project:

| arm | custom CNN | B0 (scratch) | B0 (pretrained) |
|---|---|---|---|
| control | 0.774 ± 0.015 | 0.855 ± 0.010 | 0.942 ± 0.003 |
| augmentation (failed) | 0.723 (−0.051) | 0.812 (−0.043) | 0.934 (−0.008) |
| **group-balanced resampling** | **0.814 ± 0.035 (+0.040)** | **0.852 ± 0.019 (−0.003)** | **0.952 ± 0.003 (+0.010)** |

Resampling beat augmentation on every arm, and relative to control specifically it's the first experiment in this project that didn't make things worse :)

It comes with a cost though: full-test AUC, performance on the natural, unbalanced test distribution, dropped for all three arms, −0.029, −0.012, −0.004. It's not suprising, it's an expected trade-off; oversampling the rare groups means the model sees the easy majority-group examples less often relative to their true frequency, so performance on the distribution that's dominated by that majority group decreases. It's the same shape of the tradeoff Group DRO makes on Waterbirds.

The 28-image risk partially showed up as variance. The custom CNN's slice-AUC standard deviation more than doubled versus control (0.035 vs. 0.015), and the scratch model's nearly doubled too (0.019 vs. 0.010), which is consistent with a sampler leaning towards a tiny group making runs more seed-sensitive. The pretrained model's variance barely moved (0.003 vs. 0.0025), because its features are robust enough that hammering the same 28 images again and again doesn't destabilize it, which matches what the failed-augmentation experiment found: pretrained features are the most robust of the three architectures. I checked the actual train/val loss curves for any signs of memorization, like train loss collapsing while val loss diverges, but I didn't see it in any of the three arms.

So: the same mechanism, two different datasets, and a mixed result on the second one. To me, that's evidence the shortcut-fixing behavior generalizes past a synthetic benchmark, and it shows the cost, variance, an average-accuracy tax, generalizes along with it.

## the big picture

the practical takeaway I'd give another engineer facing a group-shift problem with a small number of labeled groups: try the balanced sampler first. It's a five-line change with no new loss function, no per-group weight tracking, and on both a controlled synthetic benchmark and a real dataset, it captured most of the available benefit. It is not to say that adversarial reweighting is unnecessary, since the full group DRO pipeline won in both places, but trying the balanced sampler (the easier solution) is a good place to start.

It's also a caution about how these methods get evaluated in general. A headline number like "Group DRO gets 86% worst-group accuracy" describes a combined effect. It doesn't say how much each component in the algorithm contributed to that percentage. This project only checked one algorithm on one benchmark plus one crossover dataset, so I'm not claiming this generalizes, but it's a specific case where the answer to "how much of this gain or profit or effect came from a single component in the algorithm?", where in my case, it turned out to be "most of it." and I don't think that's something you can claim unless you ran the decomposition.

> Full setup, dataset audit, and per-group results for the Waterbirds side are written up in more detail in the research paper, *Decomposing the Group DRO Advantage: Balanced Sampling vs Adversarial Reweighting on Waterbirds*.

## resources

1. Sagawa S, Koh PW, Hashimoto TB, Liang P. Distributionally Robust Neural Networks for Group Shifts: On the Importance of Regularization for Worst-Case Generalization. International Conference on Learning Representations (ICLR); 2020. arXiv:1911.08731.
2. He K, Zhang X, Ren S, Sun J. Deep Residual Learning for Image Recognition. IEEE Conference on Computer Vision and Pattern Recognition (CVPR); 2016.
3. Koh PW, Sagawa S, Marklund H, et al. WILDS: A Benchmark of in-the-Wild Distribution Shifts. International Conference on Machine Learning (ICML); 2021. Built from Wah C, Branson S, Welinder P, Perona P, Belongie S. The Caltech-UCSD Birds-200-2011 Dataset. Caltech Technical Report CNS-TR-2011-001; 2011, and Zhou B, Lapedriza A, Khosla A, Oliva A, Torralba A. Places: A 10 Million Image Database for Scene Recognition. IEEE TPAMI; 2017.
4. Buda M, Maki A, Mazurowski MA. A Systematic Study of the Class Imbalance Problem in Convolutional Neural Networks. Neural Networks. 2018;106:249–259. Cui Y, Jia M, Lin TY, Song Y, Belongie S. Class-Balanced Loss Based on Effective Number of Samples. IEEE Conference on Computer Vision and Pattern Recognition (CVPR); 2019:9268–9277.
5. Idrissi BY, Arjovsky M, Pezeshki M, Lopez-Paz D. Simple Data Balancing Achieves Competitive Worst-Group-Accuracy. Conference on Causal Learning and Reasoning (CLeaR); 2022.
6. Byrd J, Lipton Z. What is the Effect of Importance Weighting in Deep Learning? International Conference on Machine Learning (ICML); 2019:872–881.
7. Huda R. wildfire detection project. 2026.
8. Zech JR, Badgeley MA, Liu M, Costa AB, Titano JJ, Oermann EK. Variable generalization performance of a deep learning model to detect pneumonia in chest radiographs: A cross-sectional study. PLOS Medicine. 2018;15(11):e1002683.
9. Koh PW, Sagawa S. group_DRO: reference implementation accompanying Sagawa et al. (2020). GitHub; 2020. https://github.com/kohpangwei/group_DRO
