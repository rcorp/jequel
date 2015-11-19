if (require){
    var Jequel = require('./jequel.js')
}

var objectData =
{
    "a":
    {
        "b":"c"
    },

    "e":
    [
        3,
        4
    ],

    "f":[
            {
                "h":
                    [
                        5,
                        6
                    ]
            }
        ]
}


console.log('results for objectData',
    new Jequel(objectData).MultiSelect(['*', '*.*']).Where([{
    	path: '0.h',
    	value: [5,6]
    }]))

console.log('Transformer results for objectData',
    new Jequel(objectData)
        .MultiSelect(['*', '*.*'])
        .SequentialTransformer(a => console.log('a', a)))

var nestedArrays =
[
    [
        1,
        2
    ],
    [
        [
            3,
            4,
            [
                5,
                6
            ]
        ]
    ]
]

console.log('results for nestedArrays',
    new Jequel(nestedArrays).Select('*.*').Where([{
        path: '2.*',
        is: '=',
        value: 6
    }]).results)
