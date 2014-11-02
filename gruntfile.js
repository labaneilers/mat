/* globals module */

module.exports = function(grunt) {
    var config = {
        pkg: grunt.file.readJSON("package.json"),
        jshint: {
            main: ["gruntfile.js", "./js/**/*.js", "!./js/*_generated.js"],
            options: {
                jshintrc: ".jshintrc"
            }
        },
        exec: {
            "browserify": "npm run-script browserify"
        },
        clean: {
            main: {
                src: ["./js/MerchandisingAssetTester_generated.js"]
            }
        },
        exorcise: {
            main: {
                options: {},
                files: {
                    "./js/MerchandisingAssetTester_generated.map": ["./js/MerchandisingAssetTester_generated.js"]
                }
            }
        },
        watch: {
            main: {
                files: ["./js/**/*.js"],
                tasks: ["build"],
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
    grunt.loadNpmTasks("grunt-exorcise");

    grunt.registerTask("build", ["exec:browserify", "exorcise"]);
    grunt.registerTask("default", ["jshint", "build"]);
};