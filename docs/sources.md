# Источники

Библиографические записи оформлены по ГОСТ Р 7.0.100-2018 в соответствии с РД ФГБОУ ВО «КнАГУ»
013-2016 (с изменениями № 1–5). Источники расположены по алфавиту: сначала на русском языке, затем
на иностранных. Номер источника совпадает с номером в квадратных скобках на страницах нотаций.

<div class="lh-sources" markdown>

1 ГОСТ 19.701-90 (ИСО 5807-85). Единая система программной документации. Схемы алгоритмов, программ, данных и систем. Обозначения условные и правила выполнения : межгосударственный стандарт : утв. и введен в действие Постановлением Государственного комитета СССР по управлению качеством продукции и стандартам от 26 декабря 1990 г. № 3294 : взамен ГОСТ 19.002-80, ГОСТ 19.003-80 : дата введения 1992-01-01. – Москва : Стандартинформ, 2010. – 24 с.
{ #src-1 }

2 Фаулер, М. UML. Основы. Краткое руководство по стандартному языку объектного моделирования / М. Фаулер ; пер. с англ. А. Петухова. – 3-е изд. – Санкт-Петербург : Символ-Плюс, 2004. – 192 с.
{ #src-2 }

3 A Guide to Role Activity Diagrams // ixchelte : [блог]. – 2011. – URL: <https://ixchelte.wordpress.com/2011/10/24/a-guide-to-role-activity-diagrams/> (дата обращения: 07.10.2026).
{ #src-3 }

4 BPMN 2.0 Symbols – A complete guide with examples // Camunda : сайт. – URL: <https://camunda.com/bpmn/reference/> (дата обращения: 07.10.2026).
{ #src-4 }

5 bpmn.io : web-based tooling for BPMN, DMN, CMMN, and Forms : сайт. – URL: <https://bpmn.io> (дата обращения: 07.10.2026).
{ #src-5 }

6 Business Process Model and Notation (BPMN). Version 2.0 / Object Management Group. – Needham, 2011. – 538 p. – URL: <https://www.omg.org/spec/BPMN/2.0/> (дата обращения: 07.10.2026).
{ #src-6 }

7 Chen, P. P. The Entity-Relationship Model – Toward a Unified View of Data / P. P. Chen // ACM Transactions on Database Systems. – 1976. – Vol. 1, № 1. – P. 9-36.
{ #src-7 }

8 Data-flow diagram // Wikipedia : the free encyclopedia : сайт. – URL: <https://en.wikipedia.org/wiki/Data-flow_diagram> (дата обращения: 07.10.2026).
{ #src-8 }

9 Gane, C. Structured Systems Analysis : Tools and Techniques / C. Gane, T. Sarson. – Englewood Cliffs : Prentice-Hall, 1979. – 241 p.
{ #src-9 }

10 IDEF3 – Process Description Capture Method // IDEF : Integrated DEFinition Methods : сайт. – URL: <https://www.idef.com/idef3-process-description-capture-method/> (дата обращения: 07.10.2026).
{ #src-10 }

11 Integration Definition for Function Modeling (IDEF0) : Federal Information Processing Standards Publication 183 / National Institute of Standards and Technology. – Gaithersburg, 1993. – URL: <https://nvlpubs.nist.gov/nistpubs/Legacy/FIPS/fipspub183.pdf> (дата обращения: 07.10.2026).
{ #src-11 }

12 Integration Definition for Information Modeling (IDEF1X) : Federal Information Processing Standards Publication 184 / National Institute of Standards and Technology. – Gaithersburg, 1993. – URL: <https://nvlpubs.nist.gov/nistpubs/Legacy/FIPS/fipspub184.pdf> (дата обращения: 07.10.2026).
{ #src-12 }

13 ISO 5807:1985. Information processing – Documentation symbols and conventions for data, program and system flowcharts, program network charts and system resources charts. – Geneva : International Organization for Standardization, 1985. – URL: <https://www.iso.org/standard/11955.html> (дата обращения: 07.10.2026).
{ #src-13 }

14 Mermaid : diagramming and charting tool : сайт. – URL: <https://mermaid.js.org> (дата обращения: 07.10.2026).
{ #src-14 }

15 OMG Unified Modeling Language (OMG UML). Version 2.5.1 / Object Management Group. – Needham, 2017. – 796 p. – URL: <https://www.omg.org/spec/UML/2.5.1/> (дата обращения: 07.10.2026).
{ #src-15 }

16 Ould, M. A. Business Processes : Modelling and Analysis for Re-engineering and Improvement / M. A. Ould. – Chichester : John Wiley & Sons, 1995. – 224 p.
{ #src-16 }

17 UML activity diagrams // UML Diagrams : сайт. – URL: <https://www.uml-diagrams.org/activity-diagrams.html> (дата обращения: 07.10.2026).
{ #src-17 }

18 What Is a Data Flow Diagram? Symbols and Examples // Lucid : сайт. – URL: <https://www.lucidchart.com/pages/data-flow-diagram> (дата обращения: 07.10.2026).
{ #src-18 }

19 What Is a Flowchart? Symbols, Types and Examples // Lucid : сайт. – URL: <https://www.lucidchart.com/pages/what-is-a-flowchart-tutorial> (дата обращения: 07.10.2026).
{ #src-19 }

20 What Is an Entity Relationship Diagram? // Lucid : сайт. – URL: <https://www.lucidchart.com/pages/er-diagrams> (дата обращения: 07.10.2026).
{ #src-20 }

21 Yourdon, E. Modern Structured Analysis / E. Yourdon. – Englewood Cliffs : Yourdon Press, 1989. – 672 p.
{ #src-21 }

</div>

## Инструменты, использованные для диаграмм

| Нотация | Инструмент |
|---|---|
| Flow Chart, ERD, UML (последовательность, состояния, классы) | Mermaid – диаграммы как код в Markdown [[14]](#src-14) |
| DFD, RAD, IDEF0, IDEF3, UML (деятельность) | векторная графика SVG, генератор `tools/build_diagrams.py` |
| BPMN | bpmn-js – интерактивный просмотр модели [[5]](#src-5) |
