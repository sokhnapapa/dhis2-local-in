/**
 *
 *
 */

trackerCapture.controller('ConfigurationController',
    function($rootScope,
             $scope,
             CCEIConfigurationSetting,
             $location,
             TEService,
             ProgramFactory,
             AttributesFactory,
             $route,
             DataElementService,
             CCEIProgram,
             $timeout
    ) {

        $scope.showSuccess = false;
        CCEIConfigurationSetting.get().then(function (data) {
            if (data != "") {
                $scope.configurationParameters = data;

            } else {
                //do default properties
                $scope.configurationParameters = {
                    "parameters": [
                        {   "key": "model-uid",
                            "valueType" : "trackedEntity",
                            "value": ""
                        },
                        {
                            "key": "equipment-uid",
                            "valueType" : "trackedEntity",
                            "value" : ""
                        },
                        {
                            "key": "program-mapping",
                            "valueType" : "programMapping",
                            programToProgramMapping : []

                        },
                        {
                            "key" : "tracker-associate-attribute-display",
                            "valueType" : "attribute",
                            "value" : ""
                        },
                        {
                            "key" : "working-status-attribute",
                            "valueType" : "attribute",
                            "value" : ""
                        },
                        {
                            "key" : "working-status-data-element",
                            "valueType" : "dataelement",
                            "value" : ""
                        }


                    ]
                };
            }

            $scope.update(true);
            TEService.getAll().then(function (data) {
                $scope.trackedEntityList = data;
            });

            /*
            DataElementService.getAllTrackedEntityAttributes().then(function(allAttributes){
                $scope.attributes = allAttributes.trackedEntityAttributes;
            });
            */

            AttributesFactory.getAll().then(function(data){
               $scope.attributes = data;
            });

            DataElementService.getAllTrackerDataElement().then(function(data){
                    $scope.trackerDataElements = data.dataElements;
                }
            )
        });

        $scope.saveConfigurationAndGo = function () {
            $scope.saveConfiguration();
            $scope.showSuccess = true;
            $timeout(function () {
                $location.path('/');
            }, 400);

        }

        $scope.saveConfiguration = function () {
            CCEIConfigurationSetting.save($scope.configurationParameters).then(function (response) {
                //      $scope.showSuccess = true;

            });
        }

        $scope.deleteSetting = function () {
            CCEIConfigurationSetting.delete().then(function (response) {
                $scope.showSuccess = true;
                $timeout(function () {
                    $route.reload();
                }, 200);
            });
        }

        $scope.update = function(firstRun) {
            var equipmentId = null;
            var modelId = null;


            angular.forEach($scope.configurationParameters.parameters,function(parameter){

                //get values
                if (parameter.key == "model-uid"){
                    modelId = parameter.value;
                }else if (parameter.key == "equipment-uid"){
                    equipmentId = parameter.value;
                    CCEIProgram.getProgramsByTe(equipmentId).then(function (data) {
                        $scope.equipmentProgramList = data.programs;
                    })

                }else if (parameter.key == "program-mapping"){

                    if (!firstRun){
                        parameter.programToProgramMapping = [];
                    }
                    $timeout(function() {
                        CCEIProgram.getProgramsByTe(modelId).then(function (data) {
                            //check if values exist
                            if (equipmentId && modelId && parameter.programToProgramMapping.length < data.programs.length) {
                                var programToProgramMapping=[];
                                //populate list

                                angular.forEach(data.programs,function(program){
                                    var jsonObject = {
                                        "equipmentProgram":[
                                            {
                                                "UID": "",
                                                "name":""
                                            }
                                        ],
                                        "modelProgram":[
                                            {
                                                "UID": program.id,
                                                "name": program.name
                                            }
                                        ]
                                    }
                                    programToProgramMapping.push(jsonObject);
                                });
                                parameter.programToProgramMapping = programToProgramMapping;
                           //     $scope.saveConfiguration();

                            }
                        });
                    }, 100);
                }
            });
        }

    });
