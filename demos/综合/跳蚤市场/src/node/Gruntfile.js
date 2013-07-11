//Wrapper function with one parameter
module.exports = function(grunt) {
 var bannerContent = '/*! <%= pkg.name %> v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> \n';
  var name = 'allJs-<%= pkg.version%>';

  grunt.initConfig({
    // pkg is used from templates and therefore
    // MUST be defined inside initConfig object
    pkg : grunt.file.readJSON('package.json'),
    //压缩叫
    uglify: {
      options: {
        banner: bannerContent,
        //sourceMapRoot: '../',
        sourceMap: 'distrib/'+name+'.min.js.map',
        sourceMapUrl: name+'.min.js.map'
      },
      target : {
        src : ['js/*.js'],
        dest : 'product/js/' + name + '.min.js'
      }
    },
    // concat configuration
    concat: {
      options: {
        banner: bannerContent
      },
      target : {
        src : ['js/*.js'],
        dest : 'product/js/' + name + '.js'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-concat');//合并文件
  // grunt.loadNpmTasks('grunt-contrib-uglify');//压缩文件
  grunt.registerTask('default', ['concat']);
};