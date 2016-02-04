module.exports = function(grunt) {
	grunt.initConfig({
		docco: {
			src: ['src/**/*.coffee', 'README.md'],
			options: {
				output: 'docs/out/'
			}
		},
        browserify: {
            // Optionally can be used via Command line.
            // `browserify -d -s jequel -t coffeeify --bare src\index.coffee > src\index.js`

            options: {
                transform: [['coffeeify', {
                    bare: true
                }]],
                browserifyOptions: {
                    debug: true,
                    standalone: 'jequel',

                }
            },
            dist: {
                files: {
                    'dist/index.js': ['src/index.coffee']
                }
            }
        }
	})
	grunt.loadNpmTasks('grunt-docco');
    grunt.loadNpmTasks('grunt-browserify');
	grunt.registerTask('default', ['docco']);
}
