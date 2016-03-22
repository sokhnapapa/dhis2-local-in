'use strict';

/* Filters */

var trackerCaptureFilters = angular.module('trackerCaptureFilters', [])

    .filter('shortIt', function () {
        return function(string){
            if (string)
                return string.substring(0,string.length/(3/2))+"...";
        }

    })
