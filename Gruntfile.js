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

            dist: {
                files: {
                    'dist/index.js': ['src/index.coffee']
                },
				options: {
	                transform: [['coffeeify', {
	                    bare: true
	                }]],
	                //extension: 'coffee',
	                browserifyOptions: {
	                    debug: true,
	                    standalone: 'jequel'
	                },
					debug: true,
					bare: true,
					watch: true,
					keepAlive: true,
					// exclude: ['underscore']
	            }
            }
        }
	})
	grunt.loadNpmTasks('grunt-docco');
    grunt.loadNpmTasks('grunt-browserify');
	grunt.registerTask('default', ['browserify:dist']);
}
