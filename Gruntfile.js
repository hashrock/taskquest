module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            files: [
                ['<%= my_src_files %>'],
                'package.json',
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        watch: {
            html: {
                files: 'public/**/*.html',
                tasks: ["jsbeautifier"],
                options: {
                    livereload: true
                }
            },
            css: {
                files: 'public/**/*.css',
                tasks: [],
                options: {
                    livereload: true
                }
            },
            js: {
                files: ['<%= my_src_files %>'],
                tasks: ["jsbeautifier", "jshint"],
                options: {
                    livereload: true
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 4000,
                    base: './src/'
                }
            }
        },
        jsbeautifier: {
            files: ['<%= my_src_files %>'],
            options: {
            	jsbeautifyrc: true
            }
        },
        my_src_files : ["public/*.js", "models/**/*.js", "routes/**/*.js", "app.js"]
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.registerTask('default', ['connect', 'watch']);
};
