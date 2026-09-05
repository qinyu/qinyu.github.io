---
title: 用文档描述架构（译）
description: 软件架构编年史（20）用文档描述架构
date: 2020-04-03
tags:
  - 架构
  - 编年史
  - 翻译
author: 覃宇
series:
  - 软件架构编年史
draft: false
---

<!--more-->

原文：<https://herbertograca.com/2019/08/12/documenting-software-architecture/>

*这篇文章是[软件架构编年史](https://herbertograca.com/2017/07/03/the-software-architecture-chronicles/)([译]({{< ref "post/architecture-chronicles/chronicles" >}}))的一部分，这部编年史由[一系列关于软件架构的文章](https://herbertograca.com/category/development/series/software-architecture/)组成。在这一系列文章中，我将写下我对软件架构的学习和思考，以及我是如何运用这些知识的。如果你阅读了这个系列中之前的文章，本篇文章的内容将更有意义。*

我们学习了如何编码，我们构建了一些很酷的应用，然后我们学习了架构以及它们如何保证应用可以维护多年...

但是我们还是需要向别人（新来的开发、产品负责人、投资人...）解释应用是如何工作的，我们还需要做更多...我们需要文档。

我们有哪些可供选择的文档工具来表达整个应用的构建块以及应用如何工作？！

本文我将介绍以下这些选择：

- UML
- 4+1 架构视图模型
- 架构决策记录
- C4 模型
- 依赖图
- 应用地图

## UML

我们可以用 UML 绘制各种图，我们将这些图分成两大类：

- **UML 行为图**（译注，<http://tool.uml.com.cn/ToolsEA/UserGuide/model_domains/behavioraldiagrams.html>）
  - [活动图](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-activity-diagram/)
  - [用例图](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-use-case-diagram/)
  - [交互概述图](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-interaction-overview-diagram/)
  - [时序图](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-timing-diagram/)
  - [状态机图](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-state-machine-diagram/)
  - [通信图](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-communication-diagram/)
  - [序列图](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-sequence-diagram/)
- **UML 结构图**（译注，<http://tool.uml.com.cn/ToolsEA/UserGuide/model_domains/structuraldiagrams.html>）
  - [类图](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/uml-class-diagram-tutorial/)
  - [对象图](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-object-diagram/)
  - [组件图](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-component-diagram/)
  - [符合结构图](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-composite-structure-diagram/)
  - [部署图](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-deployment-diagram/)
  - [包图](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-package-diagram/)
  - [个人资料图](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-profile-diagram/)

这里我不会介绍每种类型的细节，一篇文章不可能讲清楚，而且这些图的类型的介绍文档实在是太多了。要想深入了解每种类型，你可以点击上面这些链接，它们会跳转到 [Visual Paradigm guides](https://www.visual-paradigm.com/guide/) 的对应介绍，或者可以读一下[这篇博客](https://tallyfy.com/uml-diagram/)。（译注，可以在这里找到各种 UML 图的中文介绍，<http://tool.uml.com.cn/ToolsEA/UserGuide/model_domains/whatisuml.html>）

总而言之，UML 很酷很有意思，表达力很强，我们可以简单地描绘我们的思路，并和同事讨论。

然后，用 UML 记录一个完整的应用会用到不同类型的图。而且，如果我们只想用一张类图来表达完整应用就是在自找麻烦。

一个适合 UML 类图的例子是用来记录设计模式：

{{< figure src="strategy_1.png" class="medium" >}}

*来自: https://java-design-patterns.com/patterns/strategy*

很好，这实际上很不错！它可以表代类、接口、使用以及继承关系、数据和行为。这种类图也简洁易读，因为图很小，创建起来也快。

然而，下面这个例子却没什么用...它非常大，因而令人困惑并且很难懂。而且，绘制这样一张类图非常耗时，当我们完成绘制的时候就已经过时了，因为在绘制的同时多半代码已经发生了变化。

{{< figure src="class-diagram2.png" class="medium" >}}

*来源: https://knowhow.visual-paradigm.com*

所以，我们可以并且应该使用 UML，但是应该只在某些情况下使用，如：描述模式，应用每一小部分的细节，或者没有太多细节的粗粒度应用视图（用的不是类图）。（译注，除了使用一些重量级软件来绘制 UML 图之外，可以使用[PlantUml](https://plantuml.com/zh/) 来绘制。PlantUml 是一个开源工具，使用代码来描述 UML 图，通过工具来生成真正的图形。）

但是问题没有彻底解决，我们怎样记录一个完整的应用？！

## 4+1 架构视图模型

4+1 架构视图模型由 Philippe Kruchten 创造，并在他 1995 年的论文 《[Architectural Blueprints—The “4+1” View Model of Software Architecture](https://www.win.tue.nl/~wstomv/edu/2ip30/references/Kruchten4+1.pdf)》里公开发表。

这种将软件应用架构可视化出来的方法基于五种不同的应用视图/视角，告诉我们每种试图应该是用哪种图来记录。

{{< figure src="41_view_model-2.png" class="medium" >}}

1. ***逻辑/结构视图***
   关注系统提供的功能以及代码设计如何提供这些功能；
2. ***实现/开发者视图***
   描绘代码的静态组织结构，如组件、模块和包；
3. ***进程/行为视图***
   聚焦系统的运行时行为，系统进程如何通信，以及并发、同步、性能等等问题；
4. ***部署/物理视图***
   说明应用的物理组织结构，就是“硬件上运行的是什么代码”；
5. ***用例/场景视图***
   利用少量几个用例来说明完整的架构，用例就是交互的序列。部分架构在这些用例上进行演进。

需要注意的是，*4+1 架构视图模型*并不要求我们使用前面提到的*全部*这些图，甚至不会用到所有的视图。我们总是要理解工具，根据我们的需要使用该用的功能。

## 架构决策记录

**架构决策记录（ADR，Architecture Decision Record）**实际上记录的并不是应用程序架构的当前或未来状态，而是关于导致这些状态的原因。这些原因特别重要，它们的目的是告诉他人和未来的自己，**为什么架构是这个样子的**。

**ADR 就是一条架构决策的日志条目**，这些已经做出的决策导致了架构现在的状态或者未来将要变成的状态。它们包含了这些描述架构的图背后的**原因**。

首先，我们需要了解一些制品：

- **架构显著的需求（Architecturally-Significant Requirement，ASR）**：对软件系统的架构的影响可以度量的需求；
- **架构决策（Architecture Decision，AD）**：解决一个重要需求的软件设计选择；
- **架构决策记录（Architecture Decision Record ，ADR）**：记录作出的架构决策以及上下文和结果的文档；
- **架构决策日志（Architecture Decision Log ，ADL）**：一个特定项目（或者组织）创建和维护的全部 ADR 集合；
- **架构知识管理（Architecture Knowledge Management，AKM）**：囊括上述所有概念更高层次的范畴。

我见过一些创建 ADR 的模板，其中一些有点东西，于是我创建了自己的模板。你也可以，也许应当创建符合自己或团队需要的模板。

我认为就模板而言最重要的是简单，可以用一些文件来帮助充实并协助作出务实和公正的决定。

在讨论或者决策后记录一份文档，并不是 ADR 的最佳实践。最佳实践是在讨论开始的时候就把它当做记录思路/提案的 RFC（Request For Comments），我们提出的这些思路/提案需要团队/部门其它成员的输入/观点/批准。其目的实际上是用它来开始讨论，进行头脑风暴，做出可能的最佳决策，并将提案文档本身作为决策日志条目（ADR）。从一开始就编写 ADR 并不意味着不可变，相反随着讨论的展开它表虚更新/改进。把所有考虑到的方案以及利弊都写下来，我觉得这一点特别重要，这样才能激发讨论和明确的决定。

我设计的文档如下：

{{< figure src="adr_template.png" class="medium" >}}

*https://docs.google.com/document/d/1Xe5erulKsdaha3uwU6tNWsAWxjQK-Rcrr_iJeOCXuSQ/edit?usp=sharing*

你可以随意复制[这份文档](https://docs.google.com/document/d/1Xe5erulKsdaha3uwU6tNWsAWxjQK-Rcrr_iJeOCXuSQ/edit?usp=sharing)。

如果你想进一步探讨这个话题，推荐[Joel Parker Henderson 关于 ADR 的 github 仓库](https://github.com/joelparkerhenderson/architecture_decision_record)（译注，也可以参考 Phodal 的两篇文章：[【译文】架构决策记录（Architecture Decision Records）](https://www.phodal.com/blog/documenting-architecture-decisions/)、[使用 adr 轻松创建 “程序员友好” 的轻量级架构决策记录](https://www.phodal.com/blog/use-adrjs-create-documenting-architecture-decisions/?PageSpeed=noscript)）。

## C4 模型

C4 模型是 Simon Brown 发明的，是我目前看到的关于软件架构文档的最好思路。我会快速地用自己的语言来阐述主要的思路，但使用的还是他的图例。

其思路是用四种不同粒度（或者“缩放”）层级来记录软件的架构：

- 第一级：系统上下文图
- 第二级：容器图
- 第三级：组件图
- 第四级：代码图

### 第一级：系统上下文图

这是最粗粒度的图。它的细节很少但**其主要目标是描述应用所处的上下文**。因此，这幅图中只有一个方块代表整个应用，其它围绕着应用的方块代表了**应用要进行交付的外部系统和用户**。

{{< figure src="bigbankplc-systemcontext.png" class="large" >}}

### 第二级：容器图

现在，我们将应用放大，也就是上一级图中的蓝色方块，在这一级它对应的是下图中的虚线框。

在这个粒度级别，**我们将看到应用得容器**，一个容器就是一个应用中技术上独立的一小部分，例如一个移动 App，一个 API 或者一个数据库。它还描述了**应用使用的主要技术**和**容器之间的通信方式**。

{{< figure src="bigbankplc-containers.png" class="large" >}}

### 第三级：组件图

组件图展示的是一个容器内的组件。在 C4 模型上下文里，每个组件就是应用的一个模块，不光是领域维度的模块（如账单、用户...）还包括纯粹的功能模块（如 email、sms...）。因此这个层级的图**向我们展示了一个容器的主要齿轮和齿轮之间的啮合关系**。

{{< figure src="bigbankplc-components.png" class="large" >}}

### 第四级：代码图

这是最细粒度的图，**目的是描述一个组件内部的代码结构**。在这个层级，我们使用的是表示类级别制品的 UML 图。

{{< figure src="bigbankplc-classes.png" class="large" >}}

要了解更多信息，可以阅读 Simon Brown 自己的说明：[这里](https://c4model.com/)以及[这里](https://www.infoq.com/articles/C4-architecture-model/)，或者看看他关于 C4 模型的[演讲](https://www.youtube.com/watch?v=uvnZ46OvJLA)。（译注，可以参考我的同事[仝键](https://www.jianshu.com/u/d1f81629cc1e)的文章“[可视化架构设计——C4 介绍](https://www.jianshu.com/p/1e496225b6b6)”。）（译注，前面提到的 PlantUml 可以自己定义扩展图形，C4 模型上述的前三种图已经有了开源的扩展 https://github.com/RicardoNiepel/C4-PlantUML，使用非常简单高效。第四种代码图本来就是 PlantUML 支持的 UML 类图）。

## 还有什么问题？！

我认为 C4 模型是一种非常好的记录应用架构的方式，它可以帮我们很好地理解应用在某个层次上的架构。但我觉得还是不够，尽管搞清楚这个问题花了不少时间。

这些图有三处限制：

1. 除了一些例外情况，比如 Simon Brown 的[structurizr](https://structurizr.com/)，这些图需要人工绘制，而不能自动生成，也不能直接从代码中生成，这意味着它们体现的可能并不是实际代码，而是我们目前对代码的理解；
2. 这些图并不能帮助我们发现应用程序代码库中存在的问题，比如混乱的代码关系和糟糕的结构，这些问题影响了模块化和封装，这对任何工程产品都是至关重要的；
3. 这些图不能帮助我们从整体上理解代码库：应用程序的齿轮可以做什么，它们之间如何交互。

我找到了另外两类图来帮我们解决这些问题。

### 依赖图

依赖图可以有效地告知我们代码库中不同类型代码之间存在的依赖。

有一点特别重要，这些图是直接从代码自动生成的，不然这种图只能反映我们认为的代码的样子，如果理解真的丝毫不差，我们也就不需要这种类型的文档了。

此外，我们能借助这种依赖分析能力，当预设的依赖关系规则被破坏的时候停止构建，这一点可能比这些图本身更为重要。用来生成依赖图的工具也应该可以当做测试工具使用，包括在 CI 流水线上使用，就像单元测试那样，组织不必要的依赖性进入生产环境，这维护并强化了模块化，反过来也能帮助实现较高的变更频率，进而适应特性开发的快节奏。

对这种图来说，我觉得有三种不同类别对不同的依赖类别进行断言。

下面的这些例子都是用我的[个人项目(explicit-architec-php)](https://github.com/hgraca/explicit-architecture-php)通过 [deptrac](https://github.com/sensiolabs-de/deptrac)生成的，这是我的一个实验项目。你可以在仓库根目录下找到生成配置。

不过有一点请注意，我自己添加了一些颜色，让这些图例在这篇文章里更容易读懂。不同的颜色代表了应用的不同层级，和我之前文章中配图的层级一致：

{{< figure src="infographic-16_9.png" class="medium" >}}

{{< figure src="more_than_concentric_layers.png" class="medium" >}}

#### 层级依赖图

这种图的目的是可视化，并且确保每个层级的代码只能依赖内部或下面的层级。

因此，我们可以看到下面的图例中，例如，最外面层级之一的基础设施层可以依赖其他任何层。反过来，最中心的领域层，只能依赖下面的层，即 SharedKernel-Domain（它也是领域的一部分）和 PhpExtension（其代码被当成语言自身的一部分使用）。

{{< figure src="deptrac_layers-2.png" class="medium" >}}

*用[deptrac](https://github.com/sensiolabs-de/deptrac) 生成的 <https://github.com/hgraca/explicit-architecture-php> 的层级依赖图*

#### 类依赖图

层级依赖图分析的是层级之间的依赖，但在层级之还有一些依赖关系不允许出现。

类依赖图则有助于分析代码仓库中不同类型的类之间的依赖关系，尤其是那些属于同一层级的类的依赖关系。

例如，如果我们希望事件可以被序列化以便于放到队列中，我们可能希望它们不要包含实体，因为使用 ORM 来对实体进行反序列化和持久化可能会出问题。事件依赖于服务也是没有意义的。使用这种类型的依赖图，或者更准确地说，使用这种测试依赖关系的工具，我们可以很容易地检测到这些问题，防止它们进入生产环境。

{{< figure src="deptrac_class-3.png" class="medium" >}}

*用[deptrac](https://github.com/sensiolabs-de/deptrac) 生成的 <https://github.com/hgraca/explicit-architecture-php> 的类依赖图*

#### 组件依赖图

组件是领域维度的模块，这样的模块既包含应用层也包含领域层。一个组件（例如“账单”）可以包含全部有关的用例和领域逻辑。

组件可以和 DDD 的限界上下文与/或微服务对应起来，这意味着它们必须完全从物理上和时间上解耦。如果我们的单体应用包含的是完全解耦的组件，（在代码维度）它就能很容易的转换成微服务架构。

而且，如果能在其它非领域维度的模块上也应用同样的解耦要求，我们就能保证任何模块都可以轻松进行替换。

组件依赖图的木不碍事保证应用组件和模块之间的解耦。

注意，在下面这个图例中，同一个层级中的模块（颜色相同的节点）是互相不知道对方的存在的，至少直接的依赖是不存在的。

尤其重要的一点是两个组件（User 和 Blog，图中央较深蓝色的两个椭圆）是解耦的。如果应用采用了微服务架构，这两个组件应该是微服务。

{{< figure src="deptrac_components.png" class="large" >}}

*用[deptrac](https://github.com/sensiolabs-de/deptrac) 生成的 <https://github.com/hgraca/explicit-architecture-php> 的组件依赖图*

### 应用地图

大约一年前，我意识到这些文档选项还有一些遗漏的地方：所有这些图只能告诉我们组成应用的是哪些构建块，哪些构建块之间需要交互以及它们之间的关联，但是这些图**不能告诉我们** ***构建块的作用是什么***，**也不能告诉我们** ***它们之间是如何交互的***，**以及是** ***何时交付的***。这要求我们既要从用户视角理解应用，也要从开发者视角理解代码库。前面这些图无法告诉我们应用中有哪些用例，也无法告诉我们事件是那些用例触发的，也无法告诉我们这些事件的后果是什么。如果我们把这些图拿给产品负责人看，他会觉得大部分图对他没有任何帮助。

所以我想到了一种信的文档图，我把它称为***应用地图***，它可以替代 C4 模型组件图。

***应用地图***的目标就是成为名副其实的应用地图，定义出其中的“城市”（组件）、“当地的道路”（用例）、“高速公路”（事件）等等。

组件和模块之间的区别是，模块是应用程序的任何模块化片段，而组件是应用程序的**领域维度**的模块。因此，虽然 ORM 是应用程序的模块，但它不是组件，因为它只关心技术。另一方面，“账单”模块是一个组件，因为它关心的是领域。

应用地图首先要定义出应用的组件，即领域维度的模块，如“账单”、“用户”、“公司”、“订单”、“产品”等。对一个简单的博客应用来说，我们可以划出两个组件，“用户”（User）和“博客”（Blog）：

{{< figure src="app_map_01.png" class="medium" >}}

在每个组件内部，我们定义出可以发给它们的命令。“用户”组件可以创建和删除用户，而“博客”组件可以创建和删除帖子，还可以创建帖子的评论。

{{< figure src="app_map_02-1.png" class="medium" >}}

接下来，我们列出每个组件相关的全部服务。这些服务之所以和组件相关，是因为它们要么触发一个事件，要么被另一个组件直接使用。这一点很重要，因为应用地图应该把组件之间的连接及其含义和导致的任何副作用可视化出来，因此，我们需要展现将组件和其他组件串联起来的服务及其名称（服务命名应该代表它们的功能）。

{{< figure src="app_map_03-2.png" class="medium" >}}

服务列完之后，每个组件还要列出所有的事件监听器，哪怕实际上这些监听器没有被用过，这样我们就可以检测到并按需修复或者删除未使用的代码，这一点很方便。

我所说的监听器就是一个类，其公共方法由唯一一种的事件类型触发，它们关注的是某一个事件。

{{< figure src="listeners.png" class="medium" >}}

我们还要列出组件的事件订阅者，这和列出监听器的目的一样。事件订阅者和事件监听器类似，但它的公共方法由不同的事件触发，它们专注于一个复合的任务，一个类监听不同的框架事件，以控制何时开始、提交或回滚事务请求，就是一个事件订阅者的例子。

{{< figure src="subscribers.png" class="medium" >}}

现在，我们已经在地图中列出了所有的组件及其功能。这张地图非常有价值，它能告诉我们或任何非技术人员，每个组件可以做什么。

但是，它仍然没有告诉我们所有这些功能是之间是如何关联的，比如如“用户创建博客文章会产生什么结果？”

要体现出这些关联，第一步是列出特定功能被触发时组件上会发生什么。

在下面的这幅图例中，我们可以看到删除帖子（“DeletePost”）将触发 PostService 的DeletePost() 方法，此外，当监听器监听到了用户已被删除的通知事件时，也会触发这个方法。这告诉我们，我们的应用删除帖子可以是用户直接命令导致的结果，也可以是帖子作者被删除导致的结果。

我们可以看到用户组件在创建帖子时，其作者自动订阅了帖子的主题（标签）。

{{< figure src="direct_calls.png" class="medium" >}}

现在，我们有了组件内部的流的相关信息，但是我们仍然缺少跨组件的流的相关信息，因此我们要加上被触发和被监听的事件：

{{< figure src="events-1.png" class="medium" >}}

例如，我们可以看到：

- 删除用户将触发将删除用户帖子的事件；
- 创建帖子将同时触发作者订阅帖子主题的时间和提高作者等级的事件；
- 任何用例只要删除帖子都会触发降低作者等级的事件。

有了地图上的这些信息，我们就可以导航了。任何技术人员或非技术人员都可以清楚地看到，任何应用用例触发时会发生什么。这可以帮助我澄清我们的代码，和对应用行为的想法。
(译注，如果熟悉[事件风暴](https://zhuanlan.zhihu.com/p/95001438)，我们可以发现，上述这些组件图和依赖非常像我们在事件风暴过程中不断梳理出一些领域概念，包括事件、命令、聚合、API，慢慢浮现出来的限界上下文地图/服务地图。这个工具可以帮我们将事件风暴的成果进行电子化)。

然而，这种图用在大型应用中时仍然或存在与前面提到的关系图相同的问题：

1. 这份图需要花费大量的精力和时间来完成，而维护其简单的时效性也要大量投入;
2. 最后这幅图也会变得很大，上面有很多文本，可读性也不是最好的。

要解决第一个问题，我们需要能够随时从代码中生成应用地图。这样创建应用地图不费吹灰之力，维护也不需要什么成本，想要创建的时候可以立即创建。

要解决第二个问题，我们需要能够选择性的生成部分应用地图。例如，提供我们想要分析的用例的名称，只生成与给定用例相关的部分地图。

所以，我们需要一个工具，但这个工具...现在...还不存在！

真的不存在吗？！

最近我开始创造这个工具，目前只有组件内部的流这部分功能还没完成，但是已经可以列出所有命令、服务、监听器、订阅者和事件。这个工具仍然还处于非常早期的阶段，不光是因为缺少组件内部的这些信息，还因为它分析的代码库还不够灵活，但我目前工作的公司的代码库可以用它生成这样的图：

{{< figure src="appmap00.png" class="large" >}}

*https://gitlab.com/hgraca/app-mapper生成的(不完整的)应用地图示例*

如果你对这个项目感兴趣，可以在[这里](https://gitlab.com/hgraca/app-mapper)找到它。不过要请注意，这个仍然是非常初级，只是验证了我的想法，而且我已经有几个月没做这个了。如果你觉得有价值，也有时间可以贡献，请联系我，我会全力支持你帮你创建任务，让你把这个工具提升到更高的水平。

[原文](https://herbertograca.com/2019/08/12/documenting-software-architecture/)作者为**Herberto Graça**，本译文作者为**覃宇**，分享需遵循[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)许可。
