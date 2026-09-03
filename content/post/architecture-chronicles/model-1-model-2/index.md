---
title: “Model 1” 和 “Model 2”（译）
description: 软件架构编年史（7）Model 1 与 Model 2
date: 2019-02-16
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

原文：<https://herbertograca.com/2018/08/29/model-1-model-2/>

*这篇文章是[软件架构编年史](https://herbertograca.com/2017/07/03/the-software-architecture-chronicles/)([译]({{< ref "post/architecture-chronicles/chronicles" >}}))的一部分，这部编年史由[一系列关于软件架构的文章](https://herbertograca.com/category/development/series/software-architecture/)组成。在这一系列文章中，我将写下我对软件架构的学习和思考，以及我是如何运用这些知识的。如果你阅读了这个系列中之前的文章，本篇文章的的内容将更有意义。*

JSP 是这样一种技术，它是可以与 PHP、ASP 或是 Python 比肩的脚本语言，用来创建服务端的页面，这些页面由 JVM 解释，可以使用 Java 对象。

最早的 JSP 规范，于 1998 年由 Sun Microsystems 发布，定义了两种组织应用结构的方式，因此，展现逻辑能够以 HTTP 请求/响应范式和业务逻辑甚至用例解耦。

有人认为 “Model 1” 和 “Model 2” 是最早将原本为桌面软件开发上下文而生的 MVC 模式应用到网络 HTTP 请求/响应范式的尝试。

# Model 1

第一份 [JSP spec. v0.92](http://www.kirkdorffer.com/jspspecs/jsp092.html#model) 提案，只是将 JSP 仅用作展现层的制品，它将包含全部展现层和用例逻辑。

{{< figure src="beans.jpg" class="medium" >}}

“Model 1” ( JSP spec. v0.92 )

这种方法对大多数当时的用例来说已经足够好了，因为那时大部分 Web 都是由简单的动态页面组成，而不是用我们现在所了解的复杂 Web 企业应用组成。

# Model 2

第二份关于如何使用 JSP 的提案是为了那时所谓的复杂 Web 应用。但是，请记住，现在的 Web 应用的规模和复杂性要高得多。

{{< figure src="scenario2.jpg" class="medium" >}}

“Model 2” ( JSP spec. v0.92 )

在 “Model 2” 中，一个 HTTP 请求将抵达一个 Servlet；它会解释 HTTP 请求，使用 Java 对象和 EJB（资源库）执行一些逻辑，将结果数据收集起来并将其传给 JSP；而 JSP 将渲染发回给客户端的页面。在 “Model 2” 中，JSP 纯粹作为模板引擎使用。

1999 年 Govind Seshadri 发表了一篇文章，他将 “Model 2” 和 MVC 做了映射：

- Controller 就是 Servlet，它控制着应该为用户请求做的事情；�
- View 就是 JSP，它决定了展现给用户的内容；
- Model，在 MVC 和 “Model 2” 中都是指整个领域模型。

# 我对这两种模式的看法

挺奇怪的，“Model 2” 实际上是我学到的第一个版本的 “MVC”，就在不久之前。

最后，根据手头上的项目的范围和需求，两种方法现在都可以发挥作用。

话虽如此，我认为现在的 Web 企业应用需要更好的方法。
我发现这两种模式共同的毛病是它们都没有遵守单一职责原则。

当谈到 “Model 1” 时，我希望每个人都清楚的看到被混在一起的关注点：我们会把模板逻辑和用例逻辑混在一起。

关于 “Model 2”，我发现 View 和 Controller 都属于展现层，可是Govind Seshadri 却说得很清楚：“*[Model 2 架构应该导致所有的处理逻辑都集中在控制器 Servlet 之中](https://www.javaworld.com/article/2076557/java-web-development/understanding-javaserver-pages-model-2-architecture.html?page=2)*”，尽管领域逻辑确实是放在外部的 Java 对象和 EJB 之中。

这意味着 “Model 2” 控制器包含了用例逻辑，它应该属于应用层而不是展现层。

例如，如果我们要通过事件触发一个现存的用例，我们需要在事件监听器中复制用例逻辑（已经存在于某个控制器中），而这是一个很大的禁忌，因为这将导致维护性降低并可能导致应用不一致（的问题）。

# 引用来源

1998 – Sun Microsystems – [JavaServerTM PagesTM – Specification 0.92](http://www.kirkdorffer.com/jspspecs/jsp092.html)
1999 – Govind Seshadri – [Understanding JavaServer Pages Model 2 architecture:](https://www.javaworld.com/article/2076557/java-web-development/understanding-javaserver-pages-model-2-architecture.html)
[Exploring the MVC design pattern](https://www.javaworld.com/article/2076557/java-web-development/understanding-javaserver-pages-model-2-architecture.html)
2018 – Paul M. Jones – [Model View Controller and “Model 2”](https://github.com/pmjones/adr/blob/master/MVC-MODEL-2.md)
2018* – Wikipedia – [JSP model 2 architecture](https://en.wikipedia.org/wiki/JSP_model_2_architecture)

[原文](https://herbertograca.com/2018/08/29/model-1-model-2/)作者为**Herberto Graça**，本译文作者为**覃宇**，分享需遵循[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)许可。
