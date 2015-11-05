if (require){
    var Jequel = require('./Jequel.js')
}

q = new Jequel()

var data =
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

var ours = q.query({
    select: '*',
    from: data,
    where: [{
        path: '0.h',
        is: '=',
        value: [5,6]

    }]
})
console.log ('ours', ours)

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

var ours = q.query({
    select: '*.*',
    from: nestedArrays,
    where: [{
        path: '2.*',
        is: '=',
        value: 6
    }]
})

console.log ('ours', ours)


actions =
[{
	'name': 'Create a new Setting',
	'element': 'settings-create-schema-submit',

	'event': 'click',
	'operations': [{
		type: 'create',
		elements: [{
			id: 'settings-create-schema',
			data: [{
				table: 'custom_schema',
				column: 'fields',
				name: 'schema'
			}]
		}, {
			id: 'settings-schema-name',
			data: [{
				table: 'custom_schema',
				column: 'name',
				name: 'name'
			}]
		}]
	}]
}, {
	'name': 'Get Settings for editing',
	'element': 'settings-select-schema',
	'event': 'select',
	'operations': [{
		type: 'read',
		elements: [{
			id: 'settings-edit-schema',
			data: [{
				table: 'custom_schema',
				column: 'fields',
				name: 'schema',
				property: 'value'
			}]
		}],
		restrictions: [{
			id:'settings-select-schema',
			name: 'name',
			property: 'selected',
			table: 'custom_schema',
			column: 'name'
		}]
	}]
}, {
	'name': 'Get List of Settings',
	'element': 'settings-select-schema',
	'event': 'open',
	'operations': [{
		type: 'read',
		elements: [{
			id: 'settings-select-schema',
			data: [{
				table: 'custom_schema',
				column: 'name',
				name: 'name',
				property: 'value'
			}]
		}]
	}]
}]

var ours = q.query({
    select: '*.operations.*.elements',
    from: actions
})

console.log('ours', ours)
