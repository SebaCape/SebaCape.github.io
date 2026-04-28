## What resources do we need to compute anything?

This is one of the earliest, most simple and fundamental, yet important questions in computer science and computation as a whole. Additionally, this encapsulates a layman's explanation of the field of research in computer science known as "complexity theory,"  which exists in order to rigorously test and prove the limits of algorithmic efficiency.

One such problem that falls within this niche of theoretical computer science is one that seems amorphous at first, but once you grasp its true shape, you recognize how important it is. That problem is determining whether P = NP.

### Context

I was sitting in my lecture for algorithms when I was formally introduced to this problem. Our professor presented a problem to us that was inherently benign; to determine if an undirected graph had some subgraph that was a clique of size k (a complete subgraph such that every vertex pair has an edge between one another.)

Answering this for small cases at a glance was quite simple, but devising an algorithm for it was very hard. We didn't know initially, but he went on to explain that the reason it was so difficult to do so is because the best known algorithm is exponential in its time complexity.

He then went on to explain reductions, how some of these problems can be proven to be greater than or equivalent to other problems in terms of their "difficulty," and solving one would by extension prove that a solution of the same complexity exists for that reduction.

One thing to note about these problems is that the reason they appear so inoffensive at a glance is because verifying that some input for them is correct can be done in polynomial time, but doing otherwise requires non-deterministic polynomial time. This means that it could *theoretically* be solved given infinite machines computing in parallel, but naturally this isn't feasible.

### P v.s. NP

This is what P v.s. NP explores within complexity theory. The question of whether P = NP is truly asking the following: does the ability to verify a problem's solution in a reasonably fast time imply that finding a solution could also be done at a similar speed? It seems like a mere thought exercise, until you start to investigate what types of problems fall within NP.

Before describing that, it is necessary to do some categorization. Of the NP problems, there are some that are **NP hard,** but this is actually a separate set from NP, defined by holding problems that are *at least as hard if not harder than any other problem in NP.* Standard NP problems are defined by having an ostensibly non-deterministic polynomial solution time, but a polynomial runtime to *verify* any solution.

Where things get interesting is the intersection between these two sets. When a problem is NP and NP hard, it is known as **NP Complete.** The solution of any NP Complete problem would by virtue of reduction, prove that there exists a solution for every problem in NP, thus proving that P = NP.

### Well, what does this solve if found?

Everything. The answer is everything.

If it were proven that P = NP, then every NP problem would be solved. This includes things like breaking RSA encryption, protein folding, and even things like optimal pathfinding of a super mario game level. Security as we know it in our modern world would collapse. Research regarding cures to ailments like cancer would be put on a fast track.

It is because of this that so many researchers believe that P couldnt possibly be equivalent to NP, but even then years and years of concerted effort has led to no substantiation of the claim in either direction. Something so remarkably consequential in terms of its implications is still something that researchers grapple with today, betting their careers and in some cases their livelihoods on it.

In the words of Scott Aaronson, "if P=NP, then the world would be a profoundly different place than we usually assume it to be. There would be no special value in “creative leaps,” no fundamental gap between solving a problem and recognizing the solution once it's found. Everyone who could appreciate a symphony would be Mozart; everyone who could follow a step-by-step argument would be Gauss; everyone who could recognize a good investment strategy would be Warren Buffett."