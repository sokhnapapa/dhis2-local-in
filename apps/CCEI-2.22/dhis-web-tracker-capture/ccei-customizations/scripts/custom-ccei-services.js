/**
 * Created by Mithilesh Kumar Thakur on 12/10/2015.
 *
 */

/* global angular, moment, dhis2 */

'use strict';

/* Services */

angular.module('trackerCaptureServices')

    /* CCEI Related Services */
    /* CCEI Configuration Setting  Services */
    .service('CCEIConfigurationSetting', function ($http,$q) {

        return {
            save: function (configuration) {
                var configurationJson = JSON.stringify(configuration);
                var promise = $http.post('../api/systemSettings/ccei-configuraton-json?value=' + configurationJson, '', {headers: {'Content-Type': 'text/plain;charset=utf-8'}}).then(function (response) {
                    return response.data;
                });
                return promise;
            },
            get: function () {
                var promise = $http.get('../api/systemSettings/ccei-configuraton-json').then(function (response) {
                    return response.data ;
                });
                return promise;
            },
            delete: function(){
                var promise = $http.delete('../api/systemSettings/ccei-configuraton-json').then(function (response) {
                    return response.data ;
                });
                return promise;
            },
            getMappedProgram : function(programId){
                var def = $q.defer();
                this.get().then(function(settings){

                    angular.forEach(settings.parameters,function(parameter){
                        if (parameter.key == 'program-mapping'){
                            angular.forEach(parameter.programToProgramMapping,function(map){
                                if (map.equipmentProgram[0].UID == programId){
                                    def.resolve(map.modelProgram[0].UID);
                                }
                            })
                        }
                    });
                });
                return def.promise;
            }

        };
    })

    /* Service to Related to CCEI Program */
    //http://127.0.0.1:8080/api/dataElements.json?filter=domaintype:eq:TRACKER&fields=[id,name]&paging=false
    .service('CCEIProgram', function ($http, $q, $rootScope, SessionStorageService, TCStorageService) {

        var userHasValidRole = function(program, userRoles){

            var hasRole = false;

            if($.isEmptyObject(program.userRoles)){
                return !hasRole;
            }

            for(var i=0; i < userRoles.length && !hasRole; i++){
                if( program.userRoles.hasOwnProperty( userRoles[i].id ) ){
                    hasRole = true;
                }
            }
            return hasRole;
        };

        return {
            getProgramsByTe: function(teId)
            {
                var roles = SessionStorageService.get('USER_ROLES');
                var userRoles = roles && roles.userCredentials && roles.userCredentials.userRoles ? roles.userCredentials.userRoles : [];
                var def = $q.defer();

                TCStorageService.currentStore.open().done(function () {
                    TCStorageService.currentStore.getAll('programs').done(function (prs) {
                        var programs = [];
                        angular.forEach(prs, function (pr) {

                            if ( userHasValidRole(pr, userRoles) && pr.trackedEntity.id == teId) {
                                programs.push(pr);

                            }
                        });

                        $rootScope.$apply(function () {
                            def.resolve({programs: programs});
                        });
                    });
                });

                return def.promise;
            },
            getTrackedEntityInstancesByProgram: function (programId, ouId) {
                var promise = $http.get('../api/trackedEntityInstances.json?ou=' + ouId + '&program=' + programId + '&skipPaging=true').then(function (response) {
                    var tei = response.data;
                    return tei;
                });
                return promise;
            },

            getTrackedEntityInstance:function(uid){
                var promise = $http.get( '../api/trackedEntityInstances/' +  uid + '.json').then(function(response){
                    var tei = response.data;
                    return tei;
                });

                return promise;
            },

            getProgramsByOuAndTe: function (ou, selectedProgram, teId, showModalFlag) {
                var roles = SessionStorageService.get('USER_ROLES');
                var userRoles = roles && roles.userCredentials && roles.userCredentials.userRoles ? roles.userCredentials.userRoles : [];
                var def = $q.defer();

                TCStorageService.currentStore.open().done(function () {
                    TCStorageService.currentStore.getAll('programs').done(function (prs) {
                        var programs = [];
                        angular.forEach(prs, function (pr) {
                            if (showModalFlag) {
                                if (pr.organisationUnits.hasOwnProperty(ou.id) && userHasValidRole(pr, userRoles) && pr.trackedEntity.id == teId) {
                                    programs.push(pr);
                                }
                            } else {
                                if (pr.organisationUnits.hasOwnProperty(ou.id) && userHasValidRole(pr, userRoles) && pr.trackedEntity.id != teId) {
                                    programs.push(pr);
                                }
                            }
                        });

                        if (programs.length === 0) {
                            selectedProgram = null;
                        }
                        else if (programs.length === 1) {
                            selectedProgram = programs[0];
                        }
                        else {
                            if (selectedProgram) {
                                var continueLoop = true;
                                for (var i = 0; i < programs.length && continueLoop; i++) {
                                    if (programs[i].id === selectedProgram.id) {
                                        selectedProgram = programs[i];
                                        continueLoop = false;
                                    }
                                }
                                if (continueLoop) {
                                    selectedProgram = null;
                                }
                            }
                        }

                        $rootScope.$apply(function () {
                            def.resolve({programs: programs, selectedProgram: selectedProgram});
                        });
                    });
                });

                return def.promise;
            },
            getByUid: function (entityUid) {
                var promise = $http.get('../api/trackedEntityInstances/' + entityUid + '.json').then(function (response) {
                    var tei = response.data;
                    return tei;
                });
                return promise;
            },
            deleteByUid: function(entityUid){
                var promise = $http.delete('../api/trackedEntityInstances/' + entityUid + '.json').then(function (response) {
                    return response.data;
                });
                return promise;
            }

        };
    })

    /* Service to get all tracker dataElements */
    //http://127.0.0.1:8080/api/dataElements.json?filter=domainType:eq:TRACKER&fields=[id,name]&paging=false
    .service('DataElementService', function ($http) {

        return {
            getAllTrackerDataElement: function () {
                var promise = $http.get('../api/dataElements.json?filter=domainType:eq:TRACKER&fields=[id,name]&paging=false').then(function (response) {
                    return response.data ;
                });
                return promise;
            },

            getAllTrackedEntityAttributes: function () {
                var promise = $http.get('../api/trackedEntityAttributes.json?fields=[id,name]&paging=false').then(function (response) {
                    return response.data ;
                });
                return promise;
            }

        };
    })

    /* Factory for fetching OrgUnit */
    .service('CCEIOrgUnitFactory', function($http, SessionStorageService) {
        var orgUnit, orgUnitPromise, rootOrgUnitPromise;
        var roles = SessionStorageService.get('USER_ROLES');
        return {
            getRootOu: function () {
                var promise = $http.get('../api/organisationUnits?fields=id,name&filter=level:eq:1&paging=false').then(function (response) {
                    return response.data.organisationUnits[0];
                });
                return promise;
            }
        };
    })

/* Update Attribute value */
.service('CCEIUpdateAttributeService', function($http, SessionStorageService, CCEIProgram, TEIService) {
    var orgUnit, orgUnitPromise, rootOrgUnitPromise;
    var roles = SessionStorageService.get('USER_ROLES');
    return {
        updateAttributeValue: function (trackedEntityInstance, attributeUid, value, optionSets, attributesById ) {
            var def = $.Deferred();
            var promiseTei = CCEIProgram.getTrackedEntityInstance(trackedEntityInstance);
            promiseTei.then(function (tei) {
                angular.forEach(tei.attributes, function (att) {
                    if (att.attribute == attributeUid ) {
                        att.value = value;
                    }
                });
                TEIService.update(tei, optionSets, attributesById).then(function (updateResponse) {
                    def.resolve(updateResponse);
                });
            });
            return def;
        }

    };
})



//http://212.71.248.145:8083/ccei_tracker/api/trackedEntityInstances.json?ou=IWp9dQGM0bS&program=FGQtsshLDIz&skipPaging=true

//http://127.0.0.1:8090/dhis/api/trackedEntityInstances.json?ou=IWp9dQGM0bS&program=FGQtsshLDIz&skipPaging=true

/* CCEI Import Setting  Services */
.service('CCEIImportSetting', function ($http,$q) {

    return {
        save: function (importx) {
            var importJson = JSON.stringify(importx);
            var promise = $http.post('../api/systemSettings/ccei-import-json?value=' + importJson, '', {headers: {'Content-Type': 'text/plain;charset=utf-8'}}).then(function (response) {
                return response.data;
            });
            return promise;
        },
        get: function () {
            var promise = $http.get('../api/systemSettings/ccei-import-json').then(function (response) {
                return response.data ;
            });
            return promise;
        },
        delete: function(){
            var promise = $http.delete('../api/systemSettings/ccei-import-json').then(function (response) {
                return response.data ;
            });
            return promise;
        },
        getMappedProgram : function(programId){
            var def = $q.defer();
            this.get().then(function(settings){

                angular.forEach(settings.parameters,function(parameter){
                    if (parameter.key == 'program-mapping'){
                        angular.forEach(parameter.programToProgramMapping,function(map){
                            if (map.equipmentProgram[0].UID == programId){
                                def.resolve(map.modelProgram[0].UID);
                            }
                        })
                    }
                });
            });
            return def.promise;
        }

    };
});


// end
