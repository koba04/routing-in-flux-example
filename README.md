# routing-in-flux-example
A sample for a pattern to manage routing in Flux

```
------------                     ---------------
| popstate |                     | History API |
|-----------                     ---------------
    |                                   ^
    |                                   |
    V                                   |
----------      --------------      --------      --------
| Action | ---> | Dispatcher | ---> | Store| ---> | View |
---------       --------------      --------      --------
    ^                                                 |
    |                                                 |
    ---------------------------------------------------
```
