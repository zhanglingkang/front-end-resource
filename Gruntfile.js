module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
    , connect: {
      test: {
        port: 3001
        , base: '.'
      }
    }
    , mocha: {
      'test-lib' :{// 自己写的脚本
        options: {
          urls: [ 'localhost:3001/test/test-random.html' ]
          , options: {
            timeout: 10000
          }
          , run: true

          // src: [ 'test/*.html' , '!test/*.html']
        }
      }
      // , 'test-lib' :{// 学习第三方库写的测试脚本
      //   options: {
      //     // urls: [ 'localhost:3001/test/*.html' ]
      //     urls: [ 'test/*.html' ]
      //   }
      // }
    }
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
        libs: {
            options: {
                destPrefix: 'libs/vendor'
            },
            files: {
              'requirejs.js': 'requirejs/require.js'
              ,'jquery.min.js': 'jquery/dist/jquery.min.js'
              ,'lodash.min.js': 'lodash/dist/lodash.min.js'
            }
        },
        test: {
            options: {
                destPrefix: 'test/vendor'
            },
            files: {
              'mocha.js': 'mocha/mocha.js'
              ,'mocha.css': 'mocha/mocha.css'
              ,'chai.js': 'chai/chai.js'
              ,'sinon.js': 'sinonjs/sinon.js'
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