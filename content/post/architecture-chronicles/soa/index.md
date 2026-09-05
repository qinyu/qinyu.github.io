---
title: 面向服务的架构（译）
description: 软件架构编年史（16）面向服务的架构
date: 2018-10-10
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

原文：<https://herbertograca.com/2017/11/09/service-oriented-architecture-soa/>

*这篇文章是[软件架构编年史](https://herbertograca.com/2017/07/03/the-software-architecture-chronicles/)([译]({{< ref "post/architecture-chronicles/chronicles" >}}))的一部分，这部编年史由[一系列关于软件架构的文章](https://herbertograca.com/category/development/series/software-architecture/)组成。在这一系列文章中，我将写下我对软件架构的学习和思考，以及我是如何运用这些知识的。如果你阅读了这个系列中之前的文章，本篇文章的内容将更有意义。*

SOA 风格在 20 世纪 80 年代末就已出现，它起源于 CORBA、DCOM、DCE 和其它一些概念。关于 SOA 的讨论太多了，也有一些不同的实现模式，但从本质上讲，SOA 并没有给出如何实现它们的处方，而是仅仅聚焦于一些概念：

- 面向用户的应用的可组合性；
- 可重用的业务服务；
- 独立技术栈；
- 自治(独立演进、可扩展和可部署) 。

SOA 是一组和技术或产品无关的架构原则，这和多态以及封装一样。

在这篇文章里，我将探讨下面这些和 SOA 相关的模式：

- CORBA – Common Object Request Broker Architecture
- Web 服务
- 消息队列
- 企业服务总线
- 微服务

# CORBA(Common Object Request Broker Architecture，通用对象请求代理架构)

在 20 世纪 80 年代，随着企业网络和 C/S 架构应用的增长，对使用不同技术构建并且运行在不同地电脑和操作系统上的应用之间的通用通信方法的需求也越来越迫切。CORBA 因此诞生。它是一个分布式计算标准，20 世纪 80 年代发展起来并于 1991 年发布了第一个成熟版本。

CORBA 标准由多家供应商实现，其目标是提供：

- 平台中立的远程过程调用；
- 事务(还有远程事务)；
- 安全性；
- 事件；
- 编程语言无关；
- 操作系统无关；
- 硬件无关；
- 数据转换和通信细节分离；
- 接口定义语言(IDL)实现数据类型。

现在 CORBA 依然在异构计算中发挥余热，例如，[它依然是 JAVA EE](http://docs.oracle.com/javase/7/docs/technotes/guides/idl/corba.html)的一部分，尽管[从 JAVA 9 开始它会被作为一个独立的模块打包](https://www.infoq.com/news/2016/06/corba-removed-java-9)。

有一点要说明，**我并不认为 CORBA 是一种 SOA 模式**(虽然我认为 CORBA 和 SOA 模式都属于分布式计算范畴)。这里之所以要介绍它，是因为我觉得是**它的短板导致了 SOA** 运动。

## 工作原理

首先，我们需要获取一个对象请求代理(ORB，Object Request Broker)，它由供应商提供，符合 CORBA 规范，使用语言映射器生成用客户端代码语言表示的桩和骨架。使用 ORB 和 IDL (和 WSDL 类似)定义的接口定义，在客户端生成与可以远程调用真正类的**桩**类，在服务器生成可以处理收到的请求并调用真正目标对象的**骨架**。

{{< figure src="1980s-corba.png" class="medium" >}}

1. 调用者调用通过桩实现的本地过程；
2. 桩验证调用并创建一个请求消息传给 ORB；
3. 客户端 ORB 通过网络把消息传给服务器并阻塞当前的执行线程；
4. 服务器 ORB 收到请求消息并实例化骨架；
5. 骨架执行被调用对象的过程；
6. 被调用对象执行计算并返回结果；
7. 骨架将输出参数压缩成一个响应消息并传给 ORB；
8. ORB 将消息通过网络发回客户端；
9. 客户端 ORM 收到响应消息，展开并发给桩；
10. 桩将输出参数传给调用者，释放执行线程，然后调用者继续执行。

## 优点

- 技术栈无关(除了 ORB 的实现之外)；
- 数据转换和通信细节分离。

## 缺点

- **地点透明**：客户端代码不知道调用到底是本地的还是远程的。这听起来不错，然而，两者的时延和错误种类大相径庭。如果不知道调用的类型，应用就不可能选择合适的策略来处理方法调用，最后可能错误地将远程调用放到循环里，导致整个系统性能明显下降。
- **复杂、冗余、充满歧义的规范**：它拥一些现有的供应商版本堆砌而成，容易引起歧义，而且多余，实现起来非常困难。
- **通信管道被拦截**：它使用了基于 TCP/IP 的特定协议和特定端口，甚至是随机的端口。但企业安全规则和防火墙通常只允许 80 端口的 HTTP 协议，实际种会拦截 CORBA 通信。

# **Web 服务**

尽管 CORBA 现在仍然有使用场景，但我们也学到了一些经验：**需要减少远程通信**来提升系统性能，**通信管道必须可靠**，**通信规范必须简化**。

因此，在 20 世纪 90 年代末，Web 服务得到了大量应用，其目标是解决下面这些问题：

- **通信管道必须可靠**，所以：

  - **80 端口的 HTTP** 是默认的通信管道；
  - 使用**通用的通信语言**(比如 **XML** 和 **JSON**) ；
- **需要减少远程通信**，所以：

  - 有了**显式远程通信**，这样就能确切地知道何时发起了远程调用；
  - 有了**粗粒度的远程调用**，例如，不用再频繁调用远程对象，少量调用远程服务即可；
- **通信规范必须简化**，所以：

  - 1998 年**SOAP** 发布了第一版草案，在 2003 年获得了 W3C 推荐，成为了事实上的标准。它体现了一些 CORBA 的思想，例如一个用于处理通信的层次和使用 *Web 服务描述语言* (WSDL，Web Services Description Language)定义的“文档”；
  - Roy Fielding 于 2000 年在他的论文 “*Architectural Styles and the Design of Network-based Software Architectures*”中定义了 **REST**，它是比 SOAP 简单得多，迅速得到推广，比稍早诞生的 SOAP 规范应用得更广。
  - Facebook 于 2012 年开发了 **GraphQL** 并在 2015 年开源。它是一种 API 查询语言，允许客户端准确地指定服务端应该返回什么数据，而不是专用的负载格式，来避免数据的过度抓取和不足抓取。

> [Web] 服务能够以一种技术中立、标准的形式被发布、发现和使用。—— Microsoft 2004, [Understanding Service-Oriented Architecture](https://msdn.microsoft.com/en-us/library/aa480021.aspx)

{{< figure src="2000s-soa.png" class="medium" >}}

通过 Web 服务，SOA 完成了从远程调用对象方法的范式（CORBA），到在服务之间传递消息的范式转换。

我们要明白，尽管 Web 服务属于 SOA 范畴，但一个 Web 服务并不只是一个通过 HTTP 简单地提供数据库 CRUD 访问的通用 API。也许这种实现有些情况下有用，*它要求用户理解底层模型并遵循业务规则来确保数据完整性得到保护*。SOA 意味着 Web 服务应该设计成业务子域的限界上下文，从它们提供的概念服务中抽象出实现。

> 从技术角度看，SOA 不仅仅是服务的架构，还是确保提供和使用正确服务的策略、实现和框架。—— Microsoft 2004, [Understanding Service-Oriented Architecture](https://msdn.microsoft.com/en-us/library/aa480021.aspx)

## 优点

- 服务与技术栈无关，服务可以独立部署和扩展；
- **通用、简单以及可靠的通信通道(通过 HTTP 80 端口的文本)**；
- **最优的通信**；
- **稳定的通信标准**；
- **领域上下文隔离**。

## 缺点

- 不同的 Web 服务**集成困难**，这是不同的通信语言造成的，例如，两个 Web 服务使用不同的 JSON 表示同一个概念；
- 同步通信可能让系统**过载**。

# **消息队列**

其核心思想是让应用之间使用语言无关的消息进行异步通信。消息队列提升了应用的可扩展性，降低了应用之间的耦合，因为不用知道其它应用部署在哪里、部署了多少，甚至都不用知道它们是什么。除此之外，它们全部需要使用同样的通信语言，例如，提前定义好的可以表示数据的文本格式。

消息队列使用消息代理软件（例如，RabbitMQ、Beanstalkd、Kafka 等）作为基础设施，可以y用不同地方式设置，实现应用间通信：

- **请求/回复**

  - 客户端将消息发送给消息队列，包括“*对话*”的引用。消息被投递给特定节点，该节点回复另一条消息给原来的发送者。这条消息包含同样的*对话*引用，这样接收者才知道它和哪次*对话*有关，流程才可以继续下去。对于中等时间和长时间的业务进程（***sagas***）来说，这很有用。
- **发布/订阅**

  - **基于列表**
    它维护着发布主题列表和这些主题的订阅者。当收到某个主题的消息后，将消息放到对应主题列表中。消息和主题的匹配可以通过消息类型或者一组事先定义的更复杂的条件完成，这些条件和消息内容有关。
  - **基于广播**
    当它收到消息后，将消息广播给所有监听该队列的节点。每个监听节点负责过滤和处理自己感兴趣的消息。

{{< figure src="1995s-message-queue.jpg" class="medium" >}}

所有这些模式都可以设置成***拉取***（又叫做*轮询*）或者***推送***方式：

- **拉取场景**下，客户端每隔一段时间 *X*，就从队列中取一条消息。这样做的优势是**客户端可以控制它的负载**，却**会产生延迟**的劣势 。例如，消息已经到达队列中，客户端却并不会马上处理消息而是在等待轮询消息的时刻到来；
- **推送场景**下，队列一收到消息就会推送给客户端。这样就**没有延迟**，但**客户端不能自己控制负载**。

## 优点

- 服务与技术栈无关，服务可以独立部署和扩展；
- 通用、简单以及可靠的通信通道(通过 HTTP 80 端口的文本)；
- 最优的通信；
- 稳定的通信标准；
- 领域上下文隔离；
- **服务可以轻松地连接和断开**；
- **通过异步通信控制系统负载**。

## 缺点

- 不同的 Web 服务**集成困难**，这是不同的通信语言造成的，例如，两个 Web 服务使用不同的 JSON 表示同一个概念；

# 企业服务总线（ESB，Enterprise Service Bus）

上世纪 90 年代，在 Web 服务蓬勃发展的同时，企业服务总线已经在应用它们了（可能有些实现最初甚至使用了 CORBA？）。

ESB 诞生于这样一种环境下：公司拥有一些独立的应用，比如财务应用、人力资源应用、股票管理应用等等，这些应用需要互相通信，需要集成。但这些应用没有考虑过集成，它们没有应用通信所需的通用语言格式（直到现在也没有这样一种格式）。因此，合理的解决方案是由应用提供商创建发送和接收特定格式数据的终端节点。然后，客户公司必须建立通信管道来集成应用，并将一种应用语言的消息转换成另一种。

消息队列可能有助于解决这个问题，但无法解决应用各自拥有不同语言格式的难题。不过，消息队列从哑通信通道变成了中间件，它既可以处理消息投递，也可以将消息转换成接收端期望的语言/格式，这前进了一小步。相对简单的消息队列自然演进的结果就是 ESB。

{{< figure src="esb-2.gif" class="medium" >}}

这种架构类型一版会有典型的面向用户的复合应用，它们联系 Web 服务来执行某个操作。而这些 Web 服务接下来也会联系其它 Web 服务并最终返回一些数据给复合应用。然而复组合应用和后端服务互相都不知道对方的具体细节，即它们的位置和通信协议。它们知道的只是需要哪些服务和服务总线的位置。

这样，客户应用（服务也好，复合应用也罢）将请求发送给服务总线，然后由总线将消息转换成目的地期望的格式并将请求**路由**到目的地。需要注意的是，**所有**的通信同要经过 ESB，也就是说一旦 ESB 宕机，所有通信也会宕机，所有系统也会无法运行。最后，ESB 就像一个中间件那样工作，其中发生的事情太多太多，最后呈现的是一个相当复杂的构件。

当然，这只是对 ESB 架构的非常浅显的解释。此外，尽管 ESB 是这种架构中主要的构件，还有其他一些构件也会被涉及，比如域代理、数据服务、流程编排服务或规则引擎。在系统按照业务领域隔离的联合设计中也可以应用同样的架构风格，每个领域都有自己的 ESB设置，所有这些设置会将它们连接起来。这有助于提升性能和缓解单点故障的问题，例如，一个 ESB 的故障只会影响它所属的那个业务领域。

{{< figure src="federated_esb.jpg" class="medium" >}}

ESB 的主要职责是：

- 监控和控制服务之间交换消息的**路由**；
- 解决互相通信的服务组件之间的**消息转换**；
- 控制服务的**部署**和**版本**；
- 提供事件处理、数据转换和映射、消息和事件排队以及排序、安全或异常处理、协议转换等日常服务，保障通信服务的质量;

> 对于在不同的进程之间各种通信结构的构建，我们已经看到许多产品和方法，强调在通信机制本身大做文章。企业服务总线（ESB）就是一个很好的例子。ESB 产品经常包含复杂的设施，来进行消息的路由、编排、转换以及业务规则的应用。—— Martin Fowler 2014, [Microservices](https://martinfowler.com/articles/microservices.html)

这种架构模式有其优势，特别是在下面这样种情况下尤其有用。这种情况下，我们没有 Web 服务的“*控制权*”，因此需要一个**中间件**来转换它们之间的消息、编排需要多个 Web 服务参与的业务流程，等等。

还有一点值得记住，ESB 的实现已经发展了很久，现在，大多数用例甚至用简单的 UI 拖拽就可以完成 ESB 的配置。

## 优点

- 服务与技术栈无关，服务可以独立部署和扩展；
- 通用、简单以及可靠的通信通道(通过 HTTP 80 端口的文本)；
- 最优的通信；
- 稳定的通信标准；
- 领域上下文隔离；
- 服务可以轻松地连接和断开；
- 通过异步通信控制系统负载；
- **单点的版本和转换管理。**

## 缺点

- 较慢的通信速度，尤其是那些本来就兼容的服务；
- **集中化的逻辑**：
  - 单点故障可以造成企业内所有通信宕机；
  - 配置和维护过于复杂；
  - ESB 最终可能包含业务规则；
  - 其复杂程度最终会需要一个团队专门管理；
  - 服务变得及其依赖 ESB。

# 微服务

微服务架构以 SOA 概念为基础，与 ESB 有着同样的全局目标：将多个特定的业务领域应用整合为一个全局应用。

它和 ESB 之间的关键区别在于，ESB 诞生的上下文是**独立应用需要集成**实现企业范围内的分布式应用，而微服务架构诞生的上下文则是快节奏和不断变化的**业务**，它们通常需要从头**创建自己的云应用**。

换句话说，它们的出发点不同。就 ESB 来说，我们一开始就要面对**没有“控制权“”的已有应用**，不能修改它们。而对微服务来说，我们**可以完全控制应用**（这并不是说系统不能涉及任何第三方 Web 服务）。

微服务构建和设计的方式不需要高度的集成。微服务应该专注于一个业务概念，一个限界上下文，它们自己管理自己的状态，这样就不会直接依赖其它微服务，因此需要的集成更少。换句话说，微服务的高内聚低耦合带来了不错的副作用，即减少了集成的需要。

> [微服务是]一起工作的小型的自治服务，它们围绕着业务领域进行建模。—— Sam Newman 2015, [Principles Of Microservices](https://youtu.be/PFQnNFe27kU?t=1m50s)

既然 ESB 架构最大的弊端在于它过于复杂，而且所有其它应用都得依赖一个中心应用，所以微服务架构几乎完全去掉了中心应用，来解决这个问题。

仍然会有一些元素横切整个微服务生态系统，但它们并没有像 ESB 那样承担这么多职责。例如，依然会存在用于微服务间异步通信的消息队列，但它只是一个纯粹的消息管道，没有其它职责。另一个例子是微服务生态系统的网关，所有和外界的通信都由它完成。

*[Building Microservices](https://www.amazon.co.uk/d/Books/Building-Microservices-Sam-Newman/1491950358)* 一书的作者 Sam Newman 指出了微服务架构的八条原则：

- **服务要围绕业务领域建模**
  因为它能带给我们围绕业务概念的稳定接口、高度内聚和解耦的代码单元以及清晰可见的限界上下文；
- **自动化的文化**
  因为我们会拥有多得多的活动部件和部署单元；
- **隐藏实现细节**
  让服务可以互不干扰，独自演进；
- **一切都是去中心化的**
  决策权力和架构概念都是去中心化的，将自治权下放给团队，这样组织会将自己转变成一个复杂的自适应系统，能够快速适应变化；
- **独立部署**
  这样无需任何改变我们就能部署一个新版本的服务；
- **消费者优先**
  服务应该很容易被消费，很容易被其它服务使用；
- **隔离故障**
  这样即使一个服务宕机，其它服务仍可以继续工，让整个系统保持很高的失败恢复能力；
- **高度可观察**
  由于系统部件数量众多，想要理解系统的方方面面更加困难，所以我们需要成熟的监控工具，让我们掌握发生在系统每个角落里的细节，理解每一个连锁反应。

{{< figure src="2010-microservices.jpg" class="medium" >}}
> 微服务社区青睐另一种方法：**智能终端节点和哑管道**。基于微服务构建的应用以尽可能地解耦和内聚为目标 —— 它们拥有自己的领域逻辑，并且表现得更像经典 Unix 意义上的过滤器 —— 接收一个请求，酌情运用逻辑并生成一个响应。这些都使用简单的 REST 风格的协议进行编排，而不是类似 WS-Choreography 或 BPEL 或由中心工具编排的复杂协议。—— Martin Fowler 2014, [Microservices](https://martinfowler.com/articles/microservices.html)

## 优点

- 服务与技术栈无关，服务可以独立部署和扩展；
- 通用、简单以及可靠的通信通道(通过 HTTP 80 端口的文本)；
- 最优的通信；
- 稳定的通信标准；
- 领域上下文隔离；
- 服务可以轻松地连接和断开；
- 通过异步通信控制系统负载；
- **同步通信有益于管理系统性能；**
- **真正独立和自治的服务；**
- **业务逻辑都存在于服务内部；**
- **将组织转变成由一些小型自治的部件/团队组成的可以快速适应业务变化的*复杂适应性系统*的可能性。**

## 缺点

- **运维复杂度高**：
  - 需要大量投入建立牢固的 DevOps 文化；
  - 多种技术和库的运用可能导致失控；
  - 输入和输出 API 的变更必须进行细致的管理，因为这些接口被软件依赖；
  - 最终一致性的使用影响巨大，必须在开发应用时处理，从后端到 UX 层全部都要考虑 ；
  - 测试更加复杂，因为接口的变化可能给其它服务带来无法预测的后果。

# 反模式：意式馄饨架构

{{< figure src="ravioli.png" class="small" >}}

*意式馄饨架构*这个名字通常指的是**微服务架构的反模式**。如果我们最终创建了一个这样的微服务生态系统，其中有太多微服务，而这些微服务太小本身也不能代表领域概念时，这种反模式就会发生。

# 总结

SOA 在最近几十年里已经取得了长足的进步，实现方案和技术优势的不足最终促成了微服务架构。

整个变化的背后蕴含着我们解决复杂问题的常规策略：将问题分解成更小的可以解决的碎片。

在我们将一个单体拆分成解耦的领域组件（限界上下文）时，也可以使用同样的方式解决代码复杂性。但是，随着团队和代码规模的增长，独立演进、扩展和部署的需求也在不断增加。SOA 提供了实现这些独立性的工具，强制在限界上下文之间确立更严格的边界。

{{< figure src="soa.gif" class="medium" >}}

高内聚低耦合再一次得到了体现，这次是在比之前更粗的粒度上。同样，实用主义在分析我们的需求时也非常重要：只有在真正需要时使用 SOA，因为它会带来很多复杂性，而如果**我们确实
需要使用 SOA**，就创建**满足我们需求的大小和数量**的微服务，不要多也不要少。

# 引用来源

1997 – Steve Vinoski – [CORBA: Integrating Diverse Applications Within Distributed Heterogeneous Environments](https://www.google.nl/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=0ahUKEwjNjcrh-a3SAhXMCywKHWFgAEwQFggdMAA&url=http%3A%2F%2Fwww.cs.wustl.edu%2F~schmidt%2FPDF%2Fvinoski.pdf&usg=AFQjCNGHgp0XUqdxj7IF5pKEGNr8KSop2A&sig2=5dDa9AU9WVrxa7d64Ih88g&bvm=bv.148073327,d.bGg)
2000 – Roy Fielding – [Architectural Styles and the Design of Network-based Software Architectures](https://www.google.nl/url?sa=t&rct=j&q=&esrc=s&source=web&cd=2&cad=rja&uact=8&ved=0ahUKEwjxhZPc_K3SAhUFtRQKHSFJBUsQFggsMAE&url=https%3A%2F%2Fwww.ics.uci.edu%2F~fielding%2Fpubs%2Fdissertation%2Ffielding_dissertation.pdf&usg=AFQjCNEEwS3STct3jnKXToOQXO15Q4cY1g&sig2=7B1V07RRh9X6vFTcFVRMVQ)
2004 – Microsoft – [Message Bus](https://msdn.microsoft.com/en-us/library/ff647328.aspx)
2004 – Microsoft – [Understanding Service-Oriented Architecture](https://msdn.microsoft.com/en-us/library/aa480021.aspx)
2011 – Chris Ostrowski – [Understanding Oracle SOA – Part 1 – Architecture](https://www.youtube.com/watch?v=0hyXOuvyq2Q)
2011 – Chris Ostrowski – [Understanding Oracle SOA – Part 2 – Technologies](https://www.youtube.com/watch?v=zNvyCUO0dyw)
2011 – Chris Ostrowski – [Understanding Oracle SOA – Part 3 – Development](https://www.youtube.com/watch?v=0J4iHaUOpzU)
2011 – Chris Ostrowski – [Understanding Oracle SOA – Part 4 – Business Benefits](https://www.youtube.com/watch?v=t9-kj1veqXk)
2012 – Prabhu – [Service Oriented Architecture – SOA](http://www.mudskipper-solutions.com/home/service-oriented-architecture-soa)
2014 – Martin Fowler – [Microservices](https://martinfowler.com/articles/microservices.html)
2014 – PWC – [Agile coding in enterprise IT: Code small and local](http://www.pwc.com/us/en/technology-forecast/2014/cloud-computing/features/microservices.html)
2015 – Udi Dahan – [Messaging Architecture and Services Bus](https://www.youtube.com/watch?v=CVc3d4hrH6Y)
2015 – Sam Newman – [Principles Of Microservices](https://www.youtube.com/watch?v=PFQnNFe27kU)
2016 – Kai Wähner – [Microservices: Death of the Enterprise Service Bus?](https://www.youtube.com/watch?v=fITFdDU5L9w)
2016 – Abraham Marín Pérez – [Java 9 Will Remove CORBA from Default Classpath](https://www.infoq.com/news/2016/06/corba-removed-java-9)
2016 – Oracle – [CORBA Technology and the Java™ Platform Standard Edition](http://docs.oracle.com/javase/7/docs/technotes/guides/idl/corba.html)
2017 – Wikipedia – [Distributed object communication](https://en.wikipedia.org/wiki/Distributed_object_communication)
2017 – Wikipedia – [Common Object Request Broker Architecture](https://en.wikipedia.org/wiki/Common_Object_Request_Broker_Architecture)
2017 – Wikipedia – [Enterprise service bus](https://en.wikipedia.org/wiki/Enterprise_service_bus)
2017 – Wikipedia – [Representational State Transfer](https://en.wikipedia.org/wiki/Representational_state_transfer)
2017 – Wikipedia – [SOAP](https://en.wikipedia.org/wiki/SOAP)
2017 – Wikipedia – [Service-oriented architecture](https://en.wikipedia.org/wiki/Service-oriented_architecture)
2017 – Microsoft – [Enterprise Architecture: SOA in the real world](https://msdn.microsoft.com/en-us/library/bb833022.aspx)

[原文](https://herbertograca.com/2017/11/09/service-oriented-architecture-soa/)作者为**Herberto Graça**，本译文作者为**覃宇**，分享需遵循[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)许可。
