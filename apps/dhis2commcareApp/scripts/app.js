/**
 * Created by harsh on 22/6/15.
 */


var dhis2commcareApp = angular.module('dhis2commcareApp',['ui.bootstrap',
    'ngRoute',
    'ngCookies',
    'ngSanitize',
    'ngMessages',
    'dhis2commcareAppServices',
    'dhis2commcareAppControllers',
    'jsonFormatter'
    ])

    .config(function( $routeProvider) {


        $routeProvider.when('/', {
            templateUrl:'views/home.html',
            controller: 'HomeController'
        }).when('/configure-instance', {
            templateUrl:'views/instanceConfiguration.html',
            controller: 'ConfigurationController'
        }).when('/metadata-mapping', {
            templateUrl:'views/metadataMapping.html',
            controller: 'MetadataMappingController'
        }).when('/import', {
            templateUrl:'views/import.html',
            controller: 'ImportController'
        }).when('/report', {
            templateUrl:'views/reports.html',
            controller: 'ReportsController'
        }).otherwise({
            redirectTo : '/'
        });


    });
