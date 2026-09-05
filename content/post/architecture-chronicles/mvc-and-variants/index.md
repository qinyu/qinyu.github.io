---
title: MVC及其变种（译）
description: 软件架构编年史（7）MVC及其变种
date: 2018-09-18
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

原文：<https://herbertograca.com/2017/08/17/mvc-and-its-variants/>

*这篇文章是[软件架构编年史](https://herbertograca.com/2017/07/03/the-software-architecture-chronicles/)([译]({{< ref "post/architecture-chronicles/chronicles" >}}))的一部分，这部编年史由[一系列关于软件架构的文章](https://herbertograca.com/category/development/series/software-architecture/)组成。在这一系列文章中，我将写下我对软件架构的学习和思考，以及我是如何运用这些知识的。如果你阅读了这个系列中之前的文章，本篇文章的的内容将更有意义。*

创建可维护的应用始终是构建应用的真正的长期挑战。

不久以前，我还为一家公司工作过，其核心业务应用是拥有数千家公司客户的 SaaS 平台。这个至关重要的应用已经开发了三年，代码文件中混杂着 HTML、CSS、业务逻辑和 SQL。果然，在发布两年之后，公司决定完全重写这个应用。尽管这些情况时有发生，但如今我们许多人都知道这是不对的以及该如何避免。

然而，在20世纪70年代，职责混杂还是常见的实践，人们还在寻找更好的解决办法。随着应用程序复杂度的增长，修改 UI 必然也会引起业务逻辑的修改，修改越发复杂，耗费的时间也越来越多，还可能带来更多的问题(因为修改的代码更多了)。

MVC 因此应运而生，它提出前端和后端之间的“关注点分离”来解决上述问题。

# 1979 – Model-View-Controller

{{< figure src="mvc.jpg" class="small" >}}

为了解决上述问题，[Trygve Reenskaug 于1979 年提出了 MVC 模式](http://heim.ifi.uio.no/~trygver/1979/mvc-2/1979-12-MVC.pdf)来分离关注点，将 UI 和业务逻辑隔离。该模式当时被应用于[1973 就已经出现的桌面图形界面](https://en.wikipedia.org/wiki/History_of_the_graphical_user_interface#Xerox_PARC)的开发。

MVC 模式将代码拆分成了三个概念单元：

- 代表业务逻辑的 Model (模型)；
- 代表 UI 控件的 View (视图)：按钮、文本框等等；
- 在视图和模型之间居中协调的 Controller(控制器)，这意味着:
  - 它决定显示哪些视图以及哪些数据；
  - 它将用户操作(例如点击按钮)转换成业务逻辑。

> 模型可以是单个对象(相当无趣)，也可以是对象组成的某种结构。——Trygve Reenskaug 1979, [MVC](http://heim.ifi.uio.no/~trygver/1979/mvc-2/1979-12-MVC.pdf)

最初的 MVC 模式还有其它一些需要了解的的重要概念：

1. View 直接使用 Model 数据对象来展示数据；
2. 当 Model 发生变化时，会触发一个事件立即更新 View(记住，1979年还没有 HTTP)；
3. 每一个 View 通常只关联一个 Controller；
4. 每个界面可以包含多对 View 和 Controller；
5. 每个Controller 可以对应多个 View。

现在我所熟知的 HTTP 请求响应范式并没有使用最初的 MVC 风格。这是因为，按照原始的设想，数据从 View 流向 Controller，这和我熟悉的一样，但另一边，数据直接从 Model 流向 View，并没有经过 Controller。

而且，在现在的请求响应范式中，当数据库中的数据发生变化时，并不会触发浏览器中展示 View 的更新(尽管可以用 Web Socket 实现)。要看到更新后的数据，用户需要发起一次新的请求，而更新的数据总是会通过 Controller 返回。

# 1987/2000 – PAC/Hierarchical Model-View-Controller

{{< figure src="hmvc.png" class="medium" >}}

PAC 又称 HMVC，在 UI 片段***控件化***的上下文中它能带来更好的模块化拆分。

例如，我们会发现 View 的一部分被其它一些 View 以同样的格式使用，甚至直接就在同一个 View 重复使用。一个实际的例子就是网页展现 RSS 订阅内容的片段，它可以被其它页面重用。

如果使用 HMVC，处理主请求的 Controller 会将子请求转发给其它 Controller 让这些控件进行渲染，然后在主 View 的渲染中合并它们。

在 HTTP 请求/响应范式的上下文里，我自己也曾遇到过几次这种情况，但我发现了一个更简单的方法，即让 UI 向可以渲染控件的 Controller 发起 AJAX 调用。在保持模块化优势的同时并没有增加嵌套 Controller 调用带来的复杂性，另一个优势就是这些子请求可以使用像 Varnish 这样的缓存。

# 1996 – Model-View-Presenter

{{< figure src="mvp.jpg" class="small" >}}

MVC 模式给当时的编程范式注入了一剂强心针。然而，随着应用程序复杂度的增加，需要更进一步地解耦。

1996 年，IBM 的子公司 Taligent 公开了他们基于 MVC 的 模式 MVP。其思想是将 Model 对 UI 的关注更彻底地分离：

- View 是被动的，对 Model 无感知；
- 专注于轻量 Controller(Presenter)，它们不包含任何业务逻辑，只是简单地调用命令和/或查询模型，将原始数据传递给 View；
- 数据的变化不会直接触发 View 的更新：它始终要通过 Presenter，由 Presenter 来更新 View。这样在更新视图之前 Controller(Presenter) 还可以执行一些和展现相关的额外逻辑。例如，同时更新另一些数据，它们和数据库中发生变化的数据有关；
- 每个 View 对应一个 Presenter。

这更接近我所见到的现在的请求/响应范式：**数据流始终要经过 Controller/Presenter**。不过，Presenter 仍然不会主动更新视图，它始终需要执行一次新的请求才能让变化可见，。

MVP 中的 Presenter 又被称为 [Supervisor Controller](https://martinfowler.com/eaaDev/SupervisingPresenter.html)。

# 2005 – Model-View-ViewModel

{{< figure src="mvvm.jpg" class="small" >}}

由于应用程序的复杂性还在增加，2005 年微软的 WPF 和 Silverlight 架构师 [John Gossman 又提出了 MVVM 模式](https://blogs.msdn.microsoft.com/johngossman/2005/10/08/introduction-to-modelviewviewmodel-pattern-for-building-wpf-apps/)，目标是进一步将 UI 设计从代码中分离出来，并提供 View 到数据模型的数据绑定机制。

> [MVVM] 是 [MVC] 的变种，专为现代 UI 开发平台设计。现代 UI 开发中，View 是由设计师负责而不是由传统意义上的开发者负责。[…] 开发应用程序 UI 使用的工具、语言以及使用它们的人都和业务逻辑以及数据后端有着天壤之别。——John Gossman 2005, [Introduction to Model/View/ViewModel pattern](https://blogs.msdn.microsoft.com/johngossman/2005/10/08/introduction-to-modelviewviewmodel-pattern-for-building-wpf-apps/)

Controller 被 ViewModel “取代”：

> [View] 对键盘快捷键进行编码，而且控件自行管理与输入设备的交互，这本该是 MVC 中的 Controller 的职责(现代 GUI 开发中 Controller 的变化说来话长...我认为它只是淡出了开发者的实现。它始终都存在着，而我们不需要像1979年那样去思考它)。——John Gossman 2005, [Introduction to Model/View/ViewModel pattern](https://blogs.msdn.microsoft.com/johngossman/2005/10/08/introduction-to-modelviewviewmodel-pattern-for-building-wpf-apps/)

MVVM 背后的思想是:

- ViewModel 和 View 一一对应；
- 将 View 中的逻辑转移到 ViewModel 来简化 View；
- View 使用的数据和 ViewModel 中的数据一一对应；
- 将 ViewModel 中的数据绑定到 View 中的数据上，这样 ViewModel 中数据的变化会立即体现在 View 上。

和最初的 MVC 模式的情况相仿，对传统的请求/响应范式来说这种方法是行不通的，因为 ViewModel 无法主动地更新 View(除非使用 Web Socket)，而 MVVM 对这一点是有要求的。还有，根据我的经验，ViewModel 的属性和 View 使用的数据做到完全匹配并不是 Controller 的常见实践。

# Model-View-Presenter-ViewModel

{{< figure src="m-v-p-vm1.png" class="medium" >}}

当构建云原生的复杂企业应用时，我倾向于将应用的 UI 结构合理地设计成 M-V-P-VM，这里的 View Model 是 Martin Fowler 在 2004 年提出的 [Presentation Model](https://martinfowler.com/eaaDev/PresentationModel.html),。

- **Model**

  一组包含业务逻辑和用例的类。
- **View**

  一个模板，模板引擎用它来生成 HTML；
- **ViewModel(又叫做 [Presentation Model](https://martinfowler.com/eaaDev/PresentationModel.html))**

  从查询中接收(或者从 Model 实体中提取)原始数据，持有这些会模板会用到的数据。它还要封装复杂的展现逻辑，来简化模板。我发现运用 ViewModel 十分重要，因为我们绝不会想在模板中使用实体。这样我们才能将 View 和 Model 完全隔离开：

  - Model 中的变化(比如实体结构的变化)会上升并影响 ViewModel，但不会影响模板；
  - 复杂的展现逻辑被封装到了 ViewModel 之中，因此不会被泄露(例如，在业务实体中创建一些只和展现逻辑有关的方法)到领域之中；
  - 模板的依赖变得很清晰，因为它们必须在 ViewModel 中设置。例如，暴露出依赖可以帮助我们决定应该优先从数据库中加载哪些内容来避免 N+1 问题。
- **Presenter**

  接收 HTTP 请求，触发命令或查询，使用查询返回的数据、ViewModel、模板和模板引擎生成 HTML 并将它返回给客户端。所有 View 的交互都要经过 Presenter。

下面是我实现的一个非常简单的例子：

```
<?php
// src/UI/Admin/Some/Controller/Namespace/Detail/SomeEntityDetailController.php
namespace UI\Admin\Some\Controller\Namespace\Detail;
// use ...
final class SomeEntityDetailController
{
    /**
     * @var SomeRepositoryInterface
     */
    private $someRepository;

    /**
     * @var RelatedRepositoryInterface
     */
    private $relatedRepository;
    /**
     * @var TemplateEngineInterface
     */
    private $templateEngine;
    public function __construct(
        SomeRepositoryInterface $someRepository,
        RelatedRepositoryInterface $relatedRepository,
        TemplateEngineInterface $templateEngine
    ) {
        $this->someRepository = $someRepository;
        $this->relatedRepository = $relatedRepository;
        $this->templateEngine = $templateEngine;
    }
    /**
     * @return mixed
     */
    public function get(int $someEntityId)
    {
        $mainEntity = $this->someRepository->getById($someEntityId);
        $relatedEntityList = $this->relatedRepository->getByParentId($someEntityId);
        return $this->templateEngine->render(
            '@Some/Controller/Namespace/Detail/details.html.twig',
            new DetailsViewModel($mainEntity, $relatedEntityList)
        );
    }
}
```

[M-V-C-VM_-_Controller_example.php](https://gist.github.com/hgraca/ea2473a0d83a8fd70718b412870881c2/raw/c48d3af6c0418e1d6aa119daa2ce7a2773080b97/M-V-C-VM_-_Controller_example.php)

```
<?php
// src/UI/Admin/Some/Controller/Namespace/Detail/DetailsViewModel.php
namespace UI\Admin\Some\Controller\Namespace\Detail;
// use ...
final class DetailsViewModel implements TemplateViewModelInterface
{
    /**
     * @var array
     */
    private $mainEntity = [];
    /**
     * @var array
     */
    private $relatedEntityList = [];
    /**
     * @var bool
     */
    private $shouldDisplayFancyDialog = false;
    /**
     * @var bool
     */
    private $canEditData = false;
    /**
     * @param SomeEntity $mainEntity
     * @param RelatedEntity[] $relatedEntityList
     */
    public function __construct(SomeEntity $mainEntity, array $relatedEntityList)
    {
        $this->mainEntity = [
            'name' => $mainEntity->getName(),
            'description' => $mainEntity->getResume(),
        ];
        foreach ($relatedEntityList as $relatedEntity) {
            $this->relatedEntityList[] = [
                'title' => $relatedEntity->getTitle(),
                'subtitle' => $relatedEntity->getSubtitle(),
            ];
        }

        $this->shouldDisplayFancyDialog = /* ... some complex conditional using the entities data ... */ ;

        $this->canEditData = /* ... another complex conditional using the entities data ... */ ;
    }
    public function getMainEntity(): array
    {
        return $this->mainEntity;
    }
    public function getRelatedEntityList(): array
    {
        return $this->relatedEntityList;
    }
    public function shouldDisplayFancyDialog(): bool
    {
        return $this->shouldDisplayFancyDialog;
    }
    public function canEditData(): bool
    {
        return $this->canEditData;
    }
}
```

[M-V-C-VM_-_ViewModel_example.php](https://gist.github.com/hgraca/ea2473a0d83a8fd70718b412870881c2/raw/c48d3af6c0418e1d6aa119daa2ce7a2773080b97/M-V-C-VM_-_ViewModel_example.php)

模板和 ViewModel 一一对应，意味着 View 只能被一个特定的 ViewModel 使用，反过来也一样。这会让我进一步思考，也许**我们可以将模板和 ViewModel 封装成一个 View 对象，更有效地将 Controller 和模板以及 ViewModel 解耦**，让它只依赖一个通用的 View 接口；但我还没有机会实验这个想法。

# 总结

在网上，我们还能找到其它 MVC 的变种。但是，这里列出是我觉得更有意义和/或与我的工作有关的一些模式。

然而，我在本文中引用的这些模式是为桌面应用程序和/或富客户端的上下文创建的，因此它们不是总能和请求/响应范式百分之百的匹配。

如果你开发的是云原生的企业应用并且使用了 MVC，实际上你多半使用的是更接近 MVP 的某种模式。但无论如何，我想表达的不是应该尊崇某种特定的 MVC 变种或是刻板地理解它们的名字，而是我们应该**学习所有的模式，按照需要去使用和调整它们**。还是那句老话，最终目标就是**高内聚低耦合**：**关注点分离**。

# 引用来源

1979 – Trygve Reenskaug – [MVC XEROX PARC 1978-79](http://heim.ifi.uio.no/~trygver/themes/mvc/mvc-index.html)
**1979 – Trygve Reenskaug – [MVC](http://heim.ifi.uio.no/~trygver/1979/mvc-2/1979-12-MVC.pdf)**
**1987 – Joelle Coutaz – [PAC, an Object Oriented Model for Dialog Design](https://www.lri.fr/~mbl/ENS/FONDIHM/2013/papers/Coutaz-Interact87.pdf)**
**1996 – Mike Potel – [MVP: Model-View-Presenter: The Taligent Programming Model for C++ and Java](http://www.wildcrest.com/Potel/Portfolio/mvp.pdf)**
2000 – Jason Cai, Ranjit Kapila, Gaurav Pal – [HMVC: The layered pattern for developing strong client tiers](http://www.javaworld.com/article/2076128/design-patterns/hmvc--the-layered-pattern-for-developing-strong-client-tiers.html)
2003 -Trygve Reenskaug – [The Model-View-Controller (MVC): Its Past and Present](http://heim.ifi.uio.no/~trygver/2003/javazone-jaoo/MVC_pattern.pdf)
**2004 -Martin Fowler – [Presentation Model](https://martinfowler.com/eaaDev/PresentationModel.html)**
**2005 – John Gossman – [Introduction to Model/View/ViewModel pattern for building WPF apps](https://blogs.msdn.microsoft.com/johngossman/2005/10/08/introduction-to-modelviewviewmodel-pattern-for-building-wpf-apps/)**
2006 – Martin Fowler – [Supervising Controller](https://martinfowler.com/eaaDev/SupervisingPresenter.html)
**2006 – Martin Fowler – [GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html)**
2011 – Mārtiņš Tereško – [Architecture more suitable for web apps than MVC?](http://stackoverflow.com/questions/7621832/architecture-more-suitable-for-web-apps-than-mvc/7622038#7622038)
2017* – Tracy-Gregory J. Gilmore – [Never the twain shall meet. The tale of MV*](https://gilmoretj.wordpress.com/musings-on-all-things-ria/never-the-twain-shall-meet-the-tale-of-mv/)
2017* – Tech notes – [MVVM vs MVP vs MVC: The differences explained](http://dodgenotes.blogspot.nl/2013/12/mvvm-vs-mvp-vs-mvc-differences-explained.html)
2017* – Wikipedia – [Model–view–controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)
2017* – Wikipedia – [Presentation–abstraction–control](https://en.m.wikipedia.org/wiki/Presentation%E2%80%93abstraction%E2%80%93control)
2017* – Wikipedia – [Model-view-presenter](https://en.m.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93presenter)
2017* – Wikipedia – [Hierarchical model–view–controller](https://en.m.wikipedia.org/wiki/Hierarchical_model%E2%80%93view%E2%80%93controller)
2017* – Wikipedia – [Model–view–viewmodel](https://en.m.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel)
2018* – Wikipedia – [History of the graphical user interface](https://en.wikipedia.org/wiki/History_of_the_graphical_user_interface#Xerox_PARC)

[原文](https://herbertograca.com/2017/08/17/mvc-and-its-variants/)作者为**Herberto Graça**，本译文作者为**覃宇**，分享需遵循[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)许可。
