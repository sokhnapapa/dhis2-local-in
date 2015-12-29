/**
 * Created by hisp on 10/10/15.
 */


dhis2commcareAppControllers
.controller('ImportController', function($rootScope,
                                       $scope,$location,$timeout,$filter,goToService,configurationService,DHISMetaDataService,
                                         commcareAPIService,globalVariablesService,utilityService){

        $scope.previouslySelectedDomain = undefined;
        $scope.importSummaryIdToObjectMap = [];
        $scope.orgUnitsInstanceWiseMap = [];
        $scope.showDateSelectionDiv = false;
        $scope.waitingList = [];
        $scope.today = new Date();
        $scope.dates = {startDate : "",endDate: new Date()}

        $scope.importElementByElement = true;
        $scope.postRequestsCounter = [{count : 0}];
        $scope.firstRun = true;

        $scope.messageToUser = "";
        $scope.showInfoMessageToUser = true;


        $scope.goTo = function (place) {
        goToService.goTo(place);
    };

        $timeout(function() {
            $rootScope.$broadcast('fetchAuthorities', {});
        });


        // Fetch instance configuration from systemSetting,
        utilityService.getInstancesWithAuthorityMap().then(function(instancesAndAuthorityMap){
            $timeout(function(){

                $scope.configurationInstances = instancesAndAuthorityMap.configurationInstances;
                $scope.currentUserInstanceAuthorityMap = instancesAndAuthorityMap.currentUserInstanceAuthorityMap;

                // Get orgUnits
                DHISMetaDataService.getAllOrgUnitsIdNameAttributeValues().then(function(orgUnits){
                    $scope.orgUnits = orgUnits;

                    // get org units according to instance and kep them in a map
                    for (var instanceIndex=0;instanceIndex<$scope.configurationInstances.length;instanceIndex++) {
                        DHISMetaDataService.getAllOrgUnitsBelowParameterOuId($scope.configurationInstances[instanceIndex].dhisSettings.rootOuUid,instanceIndex).then(function(data){
                            $scope.orgUnitsInstanceWiseMap[$scope.configurationInstances[data.instanceIndex].appId] = data.organisationUnits;
                        })
                    }
                })

            })
        })

        pushIntoWaitingList = function(id,description){

            var waitingJson = {
                id : id,
                description : description,
            }
            $timeout(function(){
                $scope.waitingList.push(waitingJson);
            })
        }

        popFromWaitingList = function(id){
            $timeout(function(){
                for (var i =0;i<$scope.waitingList.length;i++){
                    if ($scope.waitingList[i].id == id){
                        $scope.waitingList.splice(i,1);
                    }
                }
            })
        }

    highlightWhatIsSelected = function(id){

        $('#'+id).addClass('glow');
        if ($scope.previouslySelectedDomain!=undefined){
            $('#'+$scope.previouslySelectedDomain).removeClass('glow');
        }
        $scope.previouslySelectedDomain = id;
    }

    $scope.selectInstanceFromWhichToImport = function(configurationInstance){

        highlightWhatIsSelected(configurationInstance.appId);
        $scope.currentInstance = configurationInstance;
        $scope.showDateSelectionDiv = true;
    }

    $scope.periods = globalVariablesService.getPeriods();

    extractValueFromForm = function(commcareQuestion,form){

        var jsonBreakUp = commcareQuestion.split('/');
        //if (jsonBreakUp.length == 0 || jsonBreakUp == undefined) return null;
        var result = angular.copy(form);
        /*start with 2 to skip the "/data/" part*/
        for (var i=2; i<jsonBreakUp.length; i++){
            if (result[jsonBreakUp[i]]!=undefined){
                result = result[jsonBreakUp[i]];
            }else{return undefined}
        }
        return result;
    }

    prepareToPushIntoDHIS = function(mappingElement,receivedOn,orgUnitIdentifierValue,orgUnitAttributeName,value,formName,object){
        $scope.numberOfRequests++;
        // make period string
        var period = utilityService.makePeriodFromDate(mappingElement.period,receivedOn);
        var orgUnit = utilityService.getOrgUnitIdByIdentifier(orgUnitIdentifierValue,orgUnitAttributeName,$scope.orgUnits);

        // make json
        dataValueJson = {
            dataValues : [
                {
                    dataElement : mappingElement.dataElement,
                    period : period,
                    orgUnit : orgUnit,
                    value : value
                }
            ]
        };
        if (mappingElement.categoryCombo != 'default'){
            dataValueJson.dataValues[0].categoryOptionCombo = mappingElement.categoryCombo;
        }

        var mappingElementJson = {
            commcareQuestion : mappingElement.commcareQuestion,
            commcareQuestionDescription : mappingElement.commcareQuestionDescription,
            dataValues : dataValueJson.dataValues,
            importResponse : ""
        }


             //post
        DHISMetaDataService.postDataValue(dataValueJson,{formName :formName,object : object,mappingElement : mappingElementJson}).then(function(data){

            data.reference.mappingElement.importResponse = data.response;
            data.reference.mappingElement.object = data.reference.object;

            if (data.response.status !='SUCCESS' || data.response.conflicts!=undefined){
                $scope.importSummaryFormNameToObjectMap[data.reference.formName].importFailedElements.push(data.reference.mappingElement);
            }else{
                $scope.importSummaryFormNameToObjectMap[data.reference.formName].successfullyImportedElements.push(data.reference.mappingElement);
            }
        })
    }

        pushIfUnique = function(array,key){
            var isUnique = true;
            for (var i=0;i<array.length;i++){
                if (array[i] == key){
                    isUnique = false;
                    break;
                }
            }
            if (isUnique){
                array.push(key);
            }
        }

        isValuePresent = function(optionValue,value){
            for (var i=0;i<value.length;i++){
                if (value[i] == optionValue){
                    return true;
                }
            }
        return false;
        }
    $scope.beginImport = function(){


        if ($scope.dates.startDate == "" || $scope.dates.endDate == ""){
            $scope.showInfoMessageToUser = false;
            $scope.messageToUser = "Please select both start and end dates";
            return;
        }
        $scope.messageToUser = "";


        var startDate = $filter('date')($scope.dates.startDate,'yyyy-MM-dd');
        var endDate = $filter('date')($scope.dates.endDate,'yyyy-MM-dd');
        $scope.showDateSelectionDiv = false;


        $scope.dataImported = false;

        $scope.numberOfRequests = 0;
        pushIntoWaitingList(1,"Fetching Forms from CommCare Server...");
        $scope.importSummary = {
            forms : [],
            postRequestCount : 0
        };
        $scope.importSummaryIdToObjectMap = [];
        $scope.importSummaryFormNameToObjectMap = [];
        $scope.currentInstanceFormNameToObjectMap = utilityService.prepareIdToObjectMap($scope.currentInstance.forms,'name');


        //call commcare API
        commcareAPIService.getCommcareFormData($scope.currentInstance,startDate,endDate).then(function(data){

            if (data.response == "error"){
                popFromWaitingList(1);
                pushIntoWaitingList(2,"An unexpected thing happened");
                $scope.errorJson = data;
                return;
            }

            popFromWaitingList(1);
            pushIntoWaitingList(2,"Importing Data..");
            // populate import summary with form
            for (var formCount=0;formCount<$scope.currentInstance.forms.length;formCount++) {
                var form = {
                    unique_id: $scope.currentInstance.forms[formCount].unique_id,
                    name: $scope.currentInstance.forms[formCount].name,
                    successfullyImportedElements : [],
                    importFailedElements:  [],
                    valueNotFoundInAPIElements: [],
                    unmappedFacilitiesElements : [],
                    unMappedFacilities : [],
                    objects: [],
                    totalForms : 0,
                    totalElements : 0
                               }
                $scope.importSummary.forms.push(form);
                $scope.importSummaryFormNameToObjectMap[form.name] = form;
            }
                //iterate through each commcare form object and populate accordingly in import summary
            for (var objectCount=0;objectCount<data.objects.length;objectCount++){

                var formName = data.objects[objectCount].form['@name'];
                if ($scope.currentInstanceFormNameToObjectMap[formName] ==undefined ||$scope.currentInstanceFormNameToObjectMap[formName].mappingElements.length == 0){
                    continue;
                }
                $scope.importSummaryFormNameToObjectMap[formName].totalForms++;
                var object = {  object : data.objects[objectCount],
                                mappingElements : [],
                                importResponse : "",
                                valueNotFoundInAPIElements: [],
                                unmappedFacilitiesElements:[],
                                dataValues : { dataValues : []}
                            };

                var ouIdentifier = extractValueFromForm($scope.currentInstanceFormNameToObjectMap[formName].orgUnitIdentifier,data.objects[objectCount].form);
                var receivedOn = data.objects[objectCount].received_on;

                    for (var mappingElementCount=0;mappingElementCount<$scope.currentInstanceFormNameToObjectMap[formName].mappingElements.length;mappingElementCount++){
                        $scope.importSummaryFormNameToObjectMap[formName].totalElements++;

                        var commcareQuestion;
                        var optionValue;
                        if ($scope.currentInstanceFormNameToObjectMap[formName].mappingElements[mappingElementCount].type == 'MSelect'){
                          commcareQuestion = $scope.currentInstanceFormNameToObjectMap[formName].mappingElements[mappingElementCount].commcareQuestion.split(":")[0];
                          optionValue = $scope.currentInstanceFormNameToObjectMap[formName].mappingElements[mappingElementCount].commcareQuestion.split(":")[1];
                        }else{
                            commcareQuestion = $scope.currentInstanceFormNameToObjectMap[formName].mappingElements[mappingElementCount].commcareQuestion;
                        }

                        var value = extractValueFromForm(commcareQuestion,data.objects[objectCount].form);

                        if (value!=undefined)
                        if ($scope.currentInstanceFormNameToObjectMap[formName].mappingElements[mappingElementCount].type == 'MSelect') {
                            if (isValuePresent(optionValue, value.split(" "))) {
                                value = true;
                            } else {
                                value = undefined;
                            }
                        }
                        if (value != undefined){
                            // make period string
                            var period = utilityService.makePeriodFromDate($scope.currentInstanceFormNameToObjectMap[formName].mappingElements[mappingElementCount].period,receivedOn);
                            var orgUnit = utilityService.getOrgUnitIdByIdentifier(ouIdentifier,$scope.currentInstance.dhisSettings.orgUnitAttributeName,$scope.orgUnitsInstanceWiseMap[$scope.currentInstance.appId]);


                            if (orgUnit ==  undefined){
                                pushIfUnique($scope.importSummaryFormNameToObjectMap[formName].unMappedFacilities,ouIdentifier);
                                object.unmappedFacilitiesElements.push($scope.currentInstanceFormNameToObjectMap[formName].mappingElements[mappingElementCount]);
                                $scope.importSummaryFormNameToObjectMap[formName].unmappedFacilitiesElements.push($scope.currentInstanceFormNameToObjectMap[formName].mappingElements[mappingElementCount]);
                                continue
                            }
                            // make json
                            var dataValueJson =
                                    {
                                        dataElement : $scope.currentInstanceFormNameToObjectMap[formName].mappingElements[mappingElementCount].dataElement,
                                        period : period,
                                        orgUnit : orgUnit,
                                        value : value
                                    }


                            if ($scope.currentInstanceFormNameToObjectMap[formName].mappingElements[mappingElementCount].categoryCombo != 'default'){
                                dataValueJson.categoryOptionCombo = $scope.currentInstanceFormNameToObjectMap[formName].mappingElements[mappingElementCount].categoryCombo;
                            }

                            var mappingElementJson = {
                                commcareQuestion : $scope.currentInstanceFormNameToObjectMap[formName].mappingElements[mappingElementCount].commcareQuestion,
                                commcareQuestionDescription : $scope.currentInstanceFormNameToObjectMap[formName].mappingElements[mappingElementCount].commcareQuestionDescription,
                                dataValueJson : dataValueJson,
                                importResponse : ""
                            }

                            mappingElementJson.datafromAPIObject = data.objects[objectCount];
                            object.mappingElements.push(mappingElementJson);
                            object.dataValues.dataValues.push(dataValueJson);
                            // Push to DHIS
                           // prepareToPushIntoDHIS($scope.currentInstanceFormNameToObjectMap[formName].mappingElements[mappingElementCount],receivedOn,ouIdentifier,$scope.currentInstance.dhisSettings.orgUnitAttributeName,value,formName,data.objects[objectCount]);
                        }else{
                            object.valueNotFoundInAPIElements.push($scope.currentInstanceFormNameToObjectMap[formName].mappingElements[mappingElementCount]);
                           // $scope.importSummaryFormNameToObjectMap[formName].valueNotFoundInAPIElements.push($scope.currentInstanceFormNameToObjectMap[formName].mappingElements[mappingElementCount]);
                            var valueNotInAPIMappingElement = $scope.currentInstanceFormNameToObjectMap[formName].mappingElements[mappingElementCount];
                            valueNotInAPIMappingElement.object = data.objects[objectCount];

                            $scope.importSummaryFormNameToObjectMap[formName].valueNotFoundInAPIElements.push(valueNotInAPIMappingElement);
                        }
                    }
                $scope.importSummaryFormNameToObjectMap[formName].objects.push(object);
            }

           $scope.responseFormCount = 0;

            // Send POST request
            if (!$scope.importElementByElement) {
                for (var formCount = 0; formCount < $scope.importSummary.forms.length; formCount++) {
                    var def = $.Deferred();
                    DHISMetaDataService.postDataValueObjects(def,undefined, $scope.importSummary.forms[formCount].objects, 0,$scope.importSummary);
                    def.then(function (response) {
                        $scope.responseFormCount++;

                        $timeout(function () {
                            if ($scope.responseFormCount == $scope.importSummary.forms.length) {
                                $scope.dataImported = true;
                                popFromWaitingList(2);
                            }
                        })
                    })
                }
            }else {
                for (var formCount = 0; formCount < $scope.importSummary.forms.length; formCount++) {
                    var def = $.Deferred();
                    DHISMetaDataService.postDataValueObjectsElementWise(def, undefined, $scope.importSummary.forms[formCount], $scope.importSummary.forms[formCount].objects, 0, 0, $scope.importSummary);
                    def.then(function (response) {
                        $scope.responseFormCount++;

                        $timeout(function () {
                            if ($scope.responseFormCount == $scope.importSummary.forms.length) {
                                $scope.dataImported = true;
                                popFromWaitingList(2);
                            }
                        })
                    });

                }
            }
        })


    }


    getCommcareFormData = function(){
    var domain = $scope.currentInstance.domain;
    var version = $scope.currentInstance.version;
    var commcareFormDataURL = 'https://www.commcarehq.org/a/'+domain+'/api/'+version+'/form/';
        commcareAPIService.commcareGetRequest().then(function(data){

        })
    }

})