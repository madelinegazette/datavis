---
elm:
  dependencies:
    gicentre/elm-vegalite: latest
---

# My first litvis document

```elm {l v}
import VegaLite exposing (..)


helloLitvis : Spec
helloLitvis =
    let
        data =
            dataFromColumns []
                << dataColumn "x" (nums [ 1, 2, 3 ])

        enc =
            encoding
                << position X [ pName "x" ]
    in
    toVegaLite [ data [], enc [], circle [] ]
```
