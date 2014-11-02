/* globals module */

module.exports = function (grunt) {
    var config = {
        pkg: grunt.file.readJSON("package.json"),
        jshint: {
            uses_defaults: ["gruntfile.js", "./js/**/*.js"],
            options: {
                jshintrc: ".jshintrc"
            }
        },
        browserify: {
            main: {
                src: ["./js/AppView.js"],
                dest: "./build/mat.js",
                options: {
                    ignore: [
                        "jquery",
                        "backbone",
                        "underscore"
                    ],
                    alias: [
                      "./js/AppView.js:AppView"                  
                    ]
                }
            },
        },
        exec: {
            "browserify": "browserify --ignore jquery --ignore backbone --ignore underscore -r ./js/AppView.js:AppView > ./build/mat.js" 
        },
        watch: {
          scripts: {
            files: ["./js/**/*.js"],
            tasks: ["browserify"],
            options: {
              spawn: false,
            },
          },
        }
    };

    // Project configuration.
    grunt.initConfig(config);

    // NPM tasks
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-exec");

    grunt.registerTask("default", ["jshint"]);
};
