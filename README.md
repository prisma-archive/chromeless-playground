# chromeless-playground

This codebase is a first proof of concept. The [frontend](/frontend) is based on [this repository](https://github.com/typestyle/typestyle.github.io)

[Demo](https://chromeless-homepage.netlify.com/#src=const%20chromeless%20=%20new%20Chromeless(%7B%20remote:%20true%20%7D)%0A%0Aconst%20screenshot%20=%20await%20chromeless%0A%20%20.goto('https://www.graph.cool')%0A%20%20.scrollTo(0,%202000)%0A%20%20.screenshot()%0A%0Aconsole.log(screenshot)%0A%0Aawait%20chromeless.end())
