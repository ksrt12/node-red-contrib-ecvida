# WellSoft.PRO

## Управляющие компании

-   1&3 Сервис
-   Bravo
-   CO_LOFT
-   EVSERVIS
-   LOFT.FM
-   SOHO Suite house
-   SmartPro
-   TEN сервис
-   ВБ ГРУПП
-   Голос Комфорт
-   ЕВРОДОМ
-   ЕкаПарк сервис
-   Жилой дом "Навигатор"
-   Лидер Плюс
-   Наш Дом Эталон
-   ПСК Смарт
-   Пригородный простор
-   Региональная УК
-   СК «Причал»
-   УК "КамаСтройИнвест"
-   УК "Эдельвейс"
-   УК «City Group»
-   УК «АСТО»
-   УК «Актив-Система»
-   УК «Альтернатива-Екатеринбург»
-   УК «Альтернатива-СЕВЕР»
-   УК «Конверс»
-   УК «Меридиан Сервис»
-   УК «Новый город»
-   УК «Перспектива»
-   УК «РИФ»
-   Умное ЖКХ
-   Урбан Сервис
-   [ЦДС](https://lk.cds-home.ru)
-   Цветной бульвар
-   [Эквида](https://lkabinet.online)

## Nodes

-   **ecvida-get** Get accruals, balance, payments or counters
-   **ecvida-send** Send counters

## Requirements

-   NodeJS: v16.0+
-   Node-Red: v2.0.0+

## Installation

```
npm install node-red-contrib-ecvida
```

or clone repo to any place and then

```
npm install *full path to cloned repo folder*
```

## Changelog

Version 2.0.13 25/04/22

-   Drop unneeded headers
-   Merge fetchGet and fetchPost into single file
-   Set minimum nodejs version to 16.x
-   Use built-in fetch API if possible (nodejs 18.x)

Version 2.0.12 22/04/22

-   Add checkbox to show archive counters data
-   Move Debug checkbox to **ecvida-send** node
-   Update docs for JSON input

Version 2.0.11 16/04/22

-   Drop unneeded devDependencies
-   Rename lib to utils

Version 2.0.10 09/04/22

-   Clean project
-   Drop unneeded CheckContext() function
-   Update examples
-   Update Docs

Version 2.0.9 09/04/22

-   Move "uk" var to credentials

Version 2.0.8 09/04/22

-   Use credentials for login node
-   Stop using context

Version 2.0.7 07/04/22

-   Isolate context for different login
-   Call CheckContext on every node input event

Version 2.0.6 07/04/22

-   Add getBalance entrie
-   Save previous state to flow context
-   Change flatId type to Number
-   Import NodeStatusFill and NodeStatusShape types

Version 2.0.5 06/04/22

-   Fix getToken
-   Call getConfig only if flatId is changed

Version 2.0.4 05/04/22

-   Add types declarations for WellSoft API
-   Simplify index.d.ts (use generic types)

Version 2.0.3 05/04/22

-   Write types declarations

Version 2.0.2 03/04/22

-   Fix node status

Version 2.0.1 03/04/22

-   Fix missing flatID

Version 2.0.0 03/04/22

-   Use WellSoft API

Version 1.0.10 01/04/22:

-   Expand get accruals params
-   Use strict
-   Use destructurization

Version 1.0.9 31/03/22:

-   Move date generation logic to separate file
-   Don't crush node-red on errors

Version 1.0.8 31/03/22:

-   Implement get payments

Version 1.0.7 31/03/22:

-   Implement date selection in get node
-   Fix utils.js

Version 1.0.6 30/03/22:

-   Allocate getCounters to separate module

Version 1.0.5 30/03/22:

-   Add examples

Version 1.0.4 29/03/22:

-   Write nodes descriptions

Version 1.0.3 29/03/22:

-   Write send counters logic

Version 1.0.2 29/03/22:

-   Move getCookies and getHTML functions to modules

Version 1.0.1 28/03/22:

-   Write get counters and accruals logic

Version 1.0.0 28/03/22:

-   Init commit
