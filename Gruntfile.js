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
          , '!libs/vendor/*.js'
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
            //clean: false // default false
        },
        // Anything can be copied
        libs: {
            options: {
                destPrefix: 'libs/vendor'
            },
            files: {
              'requirejs.js': 'requirejs/require.js'
              ,'jquery.min.js': 'jquery/dist/jquery.min.js'
              ,'lodash.min.js': 'lodash/dist/lodash.min.js'
            }
        }
      }
  });


  // Load grunt tasks from NPM packages
  require( "load-grunt-tasks" )( grunt );

  grunt.registerTask('doc', ['jsdoc']);
  grunt.registerTask('bower', 'bowercopy');// alias for bowercopy
  grunt.registerTask('build', ['jshint','bower']);

  grunt.registerTask('default', ['build']);
};