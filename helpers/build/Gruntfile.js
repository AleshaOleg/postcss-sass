module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        postcss: {
            options: {
                processors: [],
                parser: require('../../.'),
                stringifier: require('../../stringify')
            },
            dist: {
                src: '../sass/basic.sass',
                dest: './result/basic-grunt.sass'
            }
        }
    });

    grunt.loadNpmTasks('grunt-postcss');

    grunt.registerTask('default', ['postcss']);
};
