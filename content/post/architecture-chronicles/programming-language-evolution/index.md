---
title: 编程语言的演化（译）
description: 软件架构编年史（3）编程语言的演化
date: 2018-09-19
tags:
  - 架构
  - 编年史
  - 翻译
author: 覃宇
series:
  - 软件架构编年史
draft: true
---

<!--more-->

原文：<https://herbertograca.com/2017/07/10/programming-language-evolution/>

*这篇文章是[软件架构编年史](https://herbertograca.com/2017/07/03/the-software-architecture-chronicles/)([译]({{< ref "post/architecture-chronicles/chronicles" >}}))的一部分，这部编年史由[一系列关于软件架构的文章](https://herbertograca.com/category/development/series/software-architecture/)组成。在这一系列文章中，我将写下我对软件架构的学习和思考，以及我是如何运用这些知识的。如果你阅读了这个系列中之前的文章，本篇文章的的内容将更有意义。*

编程语言本身并不是架构的产出，但是如果没有涵盖编程语言的内容，我会觉得*软件架构编年史*中总是缺点什么。

所以，我们来快速回顾一下编程语言的历史和演进过程，看看我们能学到些什么。出于好奇，我在这里加入了一些并不算精确的时间，但重要的是演进的顺序和它们试图解决的问题。

# 20世纪50年代 – 非结构化编程

汇编 ~1951

软件开发曾经是一项高深莫测的活动，只发生在世界上很少的地方。那时汇编是最热门的语言，它使用非常底层的“add”“sub”“goto”操作并直接操纵内存地址。创建一个简单的应用程序都很困难，也要花费很长的时间。它需要好几行代码才能实现条件语句，而实现循环就需要更多代码行了...划分和重用代码段的能力是它之后的事情了，所以它的编码风格就是一路到底，代码重用仅限于在单个文件中或多个文件之间复制粘贴代码。

# 20世纪60年代 – 结构化编程

Algol ~1958

结构化编程语言出现了，带来了代码块、控制结构(if/then/else、case、for、while、do…) 和子例程。这样我们才能创建一些有趣的代码流，而更重要的是，我们可以划分代码质量并重用它们了，尽管还有一些限制，例如子例程只能作用于同样的全局变量。这是**重用**思想第一次变为现实。

# 20世纪70年代 – 过程式编程 & 函数式编程

Pascal ~1970, C ~1972

过程式和函数式代码诞生于20世纪70年代。这时我们终于拥有了：

- **过程**：一组不返回数据的指令；
- **函数**：一组返回数据的指令；
- **数据结构**：记录，和关联数组类似；
- **模块**：可以在其它代码文件中导入的代码文件。

“意大利面式的代码”也是在这个时代提出的，1968年它出现在Edsger W. Dijkstra发表在计算机协会通信(CACM)上题为“Go To Statement Considered Harmful*”的文章中。

20世纪70年代末，**面向事件编程**的思想开始浮现，Trygve Reenskaug撰写了关于MVC的论文(其中用到了事件)。

伴随着这些改进，我们有了更好的**重用性**，因为子例程(过程或函数)可以对不同的数据执行同样的逻辑。我们还可以通过将关联的数据划分在一起编程复杂的数据接口来**对领域概念建模**。最后，我们迈出了**解耦和模块化**的第一步，我们可以创建在其他代码文件中重用的代码，还可以创建事件来分离调用方代码和执行逻辑。

# 20世纪80年代 – 面向对象编程(OOP)

Simula ~1965, Smalltalk-71 ~1971, C++ ~1980, Erlang ~1986, Perl ~1987,

Python ~1991, Ruby ~1993, Delphi, Java, Javascript, PHP ~1995

[OOP的思想和理论早在20世纪60年代就开始萌芽了](http://gagne.homedns.org/~tgagne/contrib/EarlyHistoryST.html)而且[在那个年代第一次被Simula 实现了](https://en.wikipedia.org/wiki/Simula)。

然而，现在这种编程范式的使用方法却是在20世纪80年代形成的：拥有可见性级别、方法(消息)、对象、类以及包的面向对象编程。同时***封装**和**模块化***也被越来越多地提及。

- **可见性级别** 让我们控制一组特定的数据能被哪些代码访问；
- **类** 让我们定义/建模领域概念；
- **对象** 让我们创建出同样领域概念的不同实例；
- **包** 让我们可以将类划分到一组表示领域概念或功能概念，来共同完成某个任务；
- **方法** 从功能性角度来看代表了过程和函数，而在概念性交付来看则应该被看作是可以发给指定类型对象的消息(或者更好的名字，命令)。

# 20 世纪 90 年代 – 面向主观编程和面向方面编程

面向主观编程和面向方面编程在 20 世纪 90 年代横空出世。

**面向主观编程**需要对象根据谁在“*观察*”它展现不同的表现形式。例如，在人类的眼中树可能就是木材，而在鸟类的眼中树可能是食物和庇护所。对应到编程范式中，这意味着对象的属性和行为会根据是谁给它发的消息(谁触发了对象的方法)而不同。

**面向方面编程**试图通过在“编译”期注入额外的代码来将横切面的关注点从真正的业务逻辑中分离出来。例如，一个*方面*就是一个方法名，一个横切的关注点则是日志。使用 AOP，我们可以通过简单的系统配置就可以将日志代码注入到所有名字符合格式的方法中，比如，“*记录所有对以‘find’开头的方法的调用*”。([TYPO3](https://typo3.org/) 就是一个使用 AOP 的 CMS 实例)

# OOP 之外

在 OOP 流行起来之后，我们的注意力就放在了 Web 编程，为了 Web 开发改进现有语言和创造新语言，为了现如今大量的请求和数据调整工具和架构。

也有一些编程范式的尝试，比如面向主观编程(根据发起行为的主观对象具有不同的行为)或者面向方面编程(编译期的代码注入)，但实质上编程语言范式并没有发生变化，大多数情况下我们仍然使用的是 OOP。尽管最近函数式语言又重新得到了一些应用(也许是炒作？)。

# 总结

我想表达的观点是在软件开发历史的最初的年代，编程语言不仅仅是为了重要性在演进，它们也让软件可以拥抱变化(改变功能，重构或者完全替换一段代码)，它们在**模块化**(低耦合)和**封装**(高内聚)两个方向上同时演进。在接下来的文章中，你将看到架构也在演进，只不过是在更高的抽象级别。

# 引用来源

1979 – Trygve Reenskaug – [MVC](http://heim.ifi.uio.no/~trygver/1979/mvc-2/1979-12-MVC.pdf)
1993 – Alan C. Kay – [The Early History of Smalltalk](http://gagne.homedns.org/~tgagne/contrib/EarlyHistoryST.html)
1993 – William Harrison, Harold Ossher – [Subject-Oriented Programming: A Critique of Pure Objects](https://pdfs.semanticscholar.org/bdb2/ed51f2d471c730aea28b3692f63d5c478e0b.pdf)
1997 – Gregor Kiczales, John Lamping, Anurag Mendhekar, Chris Maeda, Cristina Videira Lopes, Jean-Marc Loingtier, John Irwin – [Aspect Oriented Programming](http://www.cs.ubc.ca/~gregor/papers/kiczales-ECOOP1997-AOP.pdf)
2005 – David R. Tribble – [Go To Statement Considered Harmful: A Retrospective](http://david.tribble.com/text/goto.html)
2017* – Wikipedia – [Programming Paradigm](https://en.wikipedia.org/wiki/Programming_paradigm)
2018* – Wikipedia – [Simula](https://en.wikipedia.org/wiki/Simula)

[原文](https://herbertograca.com/2017/07/10/programming-language-evolution/)作者为**Herberto Graça**，本译文作者为**覃宇**，分享需遵循[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)许可。
