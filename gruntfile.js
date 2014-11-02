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
        exec: {
            "browserify": "npm run-script browserify" 
        },
        clean: {
            main: {
                src: [ "./js/MerchandisingAssetTester_generated.js"]
            }
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
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-exec");

    grunt.registerTask("build", ["exec:browserify"]);
    grunt.registerTask("default", ["jshint", "build"]);
};
