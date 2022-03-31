# Ecvida ([lkabinet.online](https://lkabinet.online))

## Nodes:

-   **ecvida-get** Get accruals, payments or counters
-   **ecvida-send** Send counters

## Installation:

```
npm install node-red-contrib-ecvida
```

or clone repo to any place and then

```
npm install *full path to cloned repo folder*
```

## Changelog

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
