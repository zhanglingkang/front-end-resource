module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
    , jshint: {
      all: {
        options: {
          jshintrc: true
        }
        , src: [
          'libs/**/*.js'
          , 'test/**/*.js'
          , '!test/vendor/*.js'
        ]

      }
    }
  });


  // 加载所有的plugin，so easy!
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('build', ['jshint']);

  grunt.registerTask('default', ['build']);
};