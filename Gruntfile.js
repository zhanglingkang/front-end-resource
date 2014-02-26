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
    , jsdoc : {
      src : ['libs/**/*.js']
      , options: {
        destination: 'doc'
      }
    }
    , bowercopy: {
        options: {
            // srcPrefix: 'bower_components',// default find in in .bowerrc
            clean: false
        },
        // Anything can be copied
        libs: {
            options: {
                destPrefix: 'libs/vendor'
            },
            files: {
              // shit  https://github.com/timmywil/grunt-bowercopy/issues/10
              'jquery/dict/jquery.js': 'jquery.js'
            }
        }
      }
  });


  // 加载所有的plugin，so easy!
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('doc', ['jsdoc']);
  grunt.registerTask('build', ['jshint']);

  grunt.registerTask('default', ['build']);
};