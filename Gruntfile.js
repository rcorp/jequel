module.exports = function(grunt) {
  grunt.initConfig({
    docco: {
      src: ['src/**/*.coffee', 'README.md'],
      options: {
        output: 'docs/out/'
      }
    }
  });
  grunt.loadNpmTasks('grunt-docco');
  grunt.registerTask('default', ['docco']);
}
