/**
 * Created by harsh on 22/6/15.
 */


/* Controllers */
var dhis2commcareAppControllers = angular.module('dhis2commcareAppControllers',[])

    .controller('HomeController', function($rootScope,
                                        $scope,$timeout,goToService,utilityService){
        $scope.goTo = function (place) {
            goToService.goTo(place);
        };

        // Fetch instance configuration from systemSetting,
        utilityService.getInstancesWithAuthorityMap().then(function(instancesAndAuthorityMap){
            $timeout(function(){

                $scope.configurationInstances = instancesAndAuthorityMap.configurationInstances;
                $scope.currentUserInstanceAuthorityMap = instancesAndAuthorityMap.currentUserInstanceAuthorityMap;
            })
        })

        //get current User
        utilityService.getCurrentUser().then(function(userDetails){
            $timeout(function() {

                $scope.userDetails = userDetails;
            })
        })

    })

    .controller('ConfigurationController', function($rootScope,
                                                    $scope,$timeout,configurationService,DHISMetaDataService,utilityService,goToService){
        $scope.currentInstance = undefined;
        $scope.formInvalid = false;
        $scope.showMessageToUser = false;
        $scope.currentInstanceNameUsedAsUniqueIdentifier = undefined;

        $scope.addInstance = function(){

        highlightWhatIsSelected('addNewInstance');

            var instanceJson = {
                name: "",
                domain: "",
                version: "",
                appId: "",
                URL: "",
                username: "",
                password: "",
                dhisSettings : {
                                rootOuUid: "",
                                orgUnitAttributeName: ""
                                },
                forms: []
            }
            // Full Structure of Config-
            //var instanceJson = {
            //    name: "",
            //    domain: "",
            //    version: "",
            //    appId: "",
            //    URL: "",
            //    rootOuUid: "",
            //    username: "",
            //    password: "",
            //    forms: [{
            //        unique_id: "",
            //        name: "",
            //        orgUnitIdentifier: "",
            //        orgUnitCodeMapping: "",
            //        mappingElements: [
            //            {
            //                commcareQuestion: "",
            //                dataElement: "",
            //                categoryCombo: "",
            //                period: ""
            //            }
            //        ]
            //    }]
            //}
            $scope.currentInstance = instanceJson;
        };


        $scope.showInstance = function(configurationInstance) {
            configurationInstance.dhisSettings.rootOuUid = $scope.orgUnitIdToObjectMap[configurationInstance.dhisSettings.rootOuUid];
            highlightWhatIsSelected(configurationInstance.appId);
            $scope.messageToUser = "";
            $scope.currentInstance = configurationInstance;
            $scope.currentInstanceNameUsedAsUniqueIdentifier = $scope.currentInstance.name;
        }

        // Fetch instance configuration from systemSetting,
        utilityService.getInstancesWithAuthorityMap().then(function(instancesAndAuthorityMap){
            $timeout(function(){

                $scope.configurationInstances = instancesAndAuthorityMap.configurationInstances;
                $scope.currentUserInstanceAuthorityMap = instancesAndAuthorityMap.currentUserInstanceAuthorityMap;
            })
        })


        isFormValid = function(){
            if ($scope.currentInstance.name == "" ||
                $scope.currentInstance.domain == "" ||
                $scope.currentInstance.version == "" ||
                $scope.currentInstance.appId == "" ||
                $scope.currentInstance.username == "" ||
                $scope.currentInstance.password == "" ||
                $scope.currentInstance.dhisSettings.orgUnitAttributeName == "" ||
                $scope.currentInstance.dhisSettings.rootOuUid == "" ||  $scope.currentInstance.dhisSettings.rootOuUid == undefined
            ){
                return false
            }
            return true;
        }
        // Fetch all Org Units
        DHISMetaDataService.getAllOrgUnitsIdNameAttributeValues().then(function(organisationUnits){
            $scope.orgUnits = organisationUnits;
            $scope.orgUnitIdToObjectMap = utilityService.prepareIdToObjectMap($scope.orgUnits,"id");

        })
        $scope.saveInstance = function(){

                if (!isFormValid()){
                    $scope.formInvalid = true;
                    $scope.messageToUser = "Please fill all the fields"
                    return
                }
            $scope.formInvalid = false;

            $scope.currentInstance.dhisSettings.rootOuUid = $scope.currentInstance.dhisSettings.rootOuUid.id;

            if ($scope.currentInstanceNameUsedAsUniqueIdentifier != $scope.currentInstance.name) {
                //delete and save
                configurationService.delete('dhis2commcare-' + $scope.currentInstanceNameUsedAsUniqueIdentifier).then(function (response) {
                    configurationService.save('dhis2commcare-' + $scope.currentInstance.name, $scope.currentInstance).then(function (response) {
                        $scope.showMessageToUser = true;
                        if (response.status == 'OK') {

                            $scope.messageToUser = "Saved";
                            $timeout(function () {
                                window.location.reload();
                            }, 700)
                        } else {
                            $scope.messageToUser = "Operation not successful..An unexpected thing happened";
                        }
                    })
                })
            }else{
                configurationService.save('dhis2commcare-' + $scope.currentInstance.name, $scope.currentInstance).then(function (response) {
                    $scope.showMessageToUser = true;
                    if (response.status == 'OK') {

                        $scope.messageToUser = "Saved";
                        $timeout(function () {
                            window.location.reload();
                        }, 700)
                    } else {
                        $scope.messageToUser = "Operation not successful..An unexpected thing happened";
                    }
                })
            }

        }

        highlightWhatIsSelected = function(id){

            $('#'+id).addClass('glow');
            if ($scope.previouslySelectedDomain!=undefined){
                $('#'+$scope.previouslySelectedDomain).removeClass('glow');
            }
            $scope.previouslySelectedDomain = id;
        }

        $scope.deleteInstance = function(){

            if (!isFormValid()){
                $scope.messageToUser = "Nothing to delete";
                $scope.showMessageToUser = false;
                return;
            }
            if (!confirm($scope.currentInstance.name+' will be deleted along with its metadata mapping. Are you sure you want to delete?')){
                return
            }

            configurationService.delete('dhis2commcare-'+$scope.currentInstance.name).then(function(response){
                $scope.showMessageToUser = true;

                if (response.status == '200'){
                    $scope.messageToUser = "Form Deleted";
                    $timeout(function(){
                        window.location.reload();
                    },700)
                }else{
                    $scope.messageToUser = "Operation not successful..An unexpected thing happened";

                }
            })
        }
    })

    .controller('MetadataMappingController', function($rootScope,
                                                    $scope,$timeout,configurationService,commcareAPIService,DHISMetaDataService,utilityService){

        $scope.configurationInstances = [];
        $scope.dataElements = [];
        $scope.currentForm=[];
        $scope.metadataMapping = [];
        $scope.categoryComboInputHolder = [];
        $scope.commcareQuestionToOrgUnitIdentifierMap=[];
        $scope.commcareQuestionIdToDataElementMap = [];
        $scope.formIdToObjectMap = [];
        $scope.formIdMetadataMappingToObjectMap = [];
        $scope.formIdToIsOrgUnitIdentifierPresentMap = [];

        $scope.dataElementsIdToObjectMap = [];
        $scope.periodIdToObjectMap = [];
        $scope.waitingList = [];


        $scope.messageToUser = "";
        $scope.showInfoMessageToUser = true;



        // Fetch instance configuration from systemSetting,
        utilityService.getInstancesWithAuthorityMap().then(function(instancesAndAuthorityMap){
            $timeout(function(){

                $scope.configurationInstances = instancesAndAuthorityMap.configurationInstances;
                $scope.currentUserInstanceAuthorityMap = instancesAndAuthorityMap.currentUserInstanceAuthorityMap;
            })
        })

        DHISMetaDataService.getDataElementsWithCategoryCombo().then(function(dataElements){
            $scope.dataElements = dataElements;
            // create map
            $scope.dataElementsIdToObjectMap = utilityService.prepareIdToObjectMap(dataElements,'id');
        })

        DHISMetaDataService.getAllCategoryOptionCombos().then(function(categoryOptionCombos){
            $scope.categoryOptionIdToObjectMap = utilityService.prepareIdToObjectMap(categoryOptionCombos,'id');
        })

        $scope.periods = [{ name : "QuaterlyJan",
                            id : "QJan"}];

        $scope.periodIdToObjectMap = utilityService.prepareIdToObjectMap($scope.periods,'id');

        pushIntoWaitingList = function(id,description){

            var waitingJson = {
                id : id,
                description : description
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
        highlightWhatIsSelected = function(id,whichBar){

            $('#'+id).addClass('glow');
            if (whichBar == "second") {
                if ($scope.previouslySelectedDomain != undefined) {
                    $('#' + $scope.previouslySelectedDomain).removeClass('glow');
                }
                $scope.previouslySelectedDomain = id;
            }else if (whichBar == 'third'){
                if ($scope.previouslySelectedForm != undefined) {
                    $('#' + $scope.previouslySelectedForm).removeClass('glow');
                }
                $scope.previouslySelectedForm = id;
            }
        }
        $scope.doOrgUnitUIOperations = function(thiz){
            if ($scope.commcareQuestionToOrgUnitIdentifierMap[$scope.currentForm.unique_id+thiz.mappingElement.commcareQuestion] == true){
                $scope.formIdMetadataMappingToObjectMap[$scope.currentForm.unique_id].orgUnitIdentifier = thiz.mappingElement.commcareQuestion;
                $scope.formIdToIsOrgUnitIdentifierPresentMap[$scope.currentForm.unique_id] = true;
            }else{
                $scope.formIdMetadataMappingToObjectMap[$scope.currentForm.unique_id].orgUnitIdentifier = '';
                $scope.formIdToIsOrgUnitIdentifierPresentMap[$scope.currentForm.unique_id] = false;
            }
        }

        $scope.updateCategoryCombo = function(mappingElement){
            if (mappingElement.dataElement == undefined || mappingElement.dataElement == '') return;

            var categoryComboJson = [{
                name: "",
                id:""
            }]
            if (mappingElement.dataElement && mappingElement.dataElement.categoryCombo.name == 'default'){
                categoryComboJson[0].name = mappingElement.dataElement.categoryCombo.name;
                categoryComboJson[0].id =  mappingElement.dataElement.categoryCombo.name;
            }else{
                categoryComboJson = mappingElement.dataElement.categoryCombo.categoryOptionCombos;
            }
            $scope.categoryComboInputHolder[$scope.currentForm.unique_id+mappingElement.commcareQuestion] = categoryComboJson;
        }

        $scope.showForm = function(form){
            highlightWhatIsSelected(form.unique_id,"third");

            for (var i=0; i<form.mappingElements.length;i++ ){
                var categoryComboJson = [{
                    name: "",
                    id:""
                }]


                // populate category combo initially
                if (form.mappingElements[i].dataElement)
                if(form.mappingElements[i].dataElement.categoryCombo.name == 'default'){
                    categoryComboJson[0].name = form.mappingElements[i].dataElement.categoryCombo.name;
                    categoryComboJson[0].id =  form.mappingElements[i].dataElement.categoryCombo.name;

                    $scope.categoryComboInputHolder[form.unique_id+form.mappingElements[i].commcareQuestion] = categoryComboJson;
                }else {
                    categoryComboJson[0].name = form.mappingElements[i].categoryCombo.name;
                    categoryComboJson[0].id =  form.mappingElements[i].categoryCombo.id;

                    $scope.categoryComboInputHolder[form.unique_id + form.mappingElements[i].commcareQuestion] = form.mappingElements[i].categoryCombo == '' ? [] : categoryComboJson;
                }

                if (form.orgUnitIdentifier == form.mappingElements[i].commcareQuestion){
                    $scope.commcareQuestionToOrgUnitIdentifierMap[form.unique_id+form.mappingElements[i].commcareQuestion] = true;
                    $scope.formIdToIsOrgUnitIdentifierPresentMap[form.unique_id] = true;
                }else
                $scope.commcareQuestionToOrgUnitIdentifierMap[form.unique_id+form.mappingElements[i].commcareQuestion] = false;
            }

            $scope.currentForm = form;
            // Assign to object (ng-repeat creates a child scope but have to assign the original object to current form)
            //for (var i=0;i<$scope.metadataMapping.forms.length;i++){
            //    if ($scope.metadataMapping.forms[i].unique_id == form.unique_id){
            //        $scope.currentForm = $scope.metadataMapping.forms[i];
            //    }
            //}
        }
        $scope.showInstanceMapping = function(configurationInstance){
            highlightWhatIsSelected(configurationInstance.appId,"second");

            //clear previous form selections
            $scope.previouslySelectedForm = undefined;
            $scope.metadataMapping = {
                forms:[]
            }
            $scope.currentForm = '';

            $scope.currentConfigurationInstance = configurationInstance;
            //make map from config
            $scope.commcareQuestionIdToDataElementMap = [];
            for (var formCount=0;formCount<$scope.currentConfigurationInstance.forms.length;formCount++){
                $scope.formIdToObjectMap[$scope.currentConfigurationInstance.forms[formCount].unique_id] = $scope.currentConfigurationInstance.forms[formCount];
                for (var mappingElementsCount=0; mappingElementsCount<$scope.currentConfigurationInstance.forms[formCount].mappingElements.length;mappingElementsCount++){
                    $scope.commcareQuestionIdToDataElementMap[$scope.currentConfigurationInstance.forms[formCount].unique_id+$scope.currentConfigurationInstance.forms[formCount].mappingElements[mappingElementsCount].commcareQuestion] = $scope.currentConfigurationInstance.forms[formCount].mappingElements[mappingElementsCount];
                }
            }

            pushIntoWaitingList(1,"Fetching form structure from Commcare server...");
            //fetch commcare forms and prepare and populate metadataMapping form
            commcareAPIService.getCommcareAppSchema($scope.currentConfigurationInstance).then(function(commcareSchema){
                $scope.currentFormsSchema = commcareSchema.modules[0].forms;

                for (var formCount=0;formCount<$scope.currentFormsSchema.length;formCount++){
                    pushIntoWaitingList(2,"Preparing Form " + $scope.currentFormsSchema[formCount].name.en);

                    var ouidentifier = "";
                    $scope.formIdToIsOrgUnitIdentifierPresentMap[$scope.currentFormsSchema[formCount].unique_id] = false;
                    if ($scope.formIdToObjectMap[$scope.currentFormsSchema[formCount].unique_id] != undefined){
                        ouidentifier = $scope.formIdToObjectMap[$scope.currentFormsSchema[formCount].unique_id].orgUnitIdentifier;
                    }
                    var newForm = {
                        unique_id:$scope.currentFormsSchema[formCount].unique_id,
                        name : $scope.currentFormsSchema[formCount].name.en,
                        orgUnitIdentifier: ouidentifier,
                        orgUnitCodeMapping: "",
                        mappingElements : []
                    }
                    for (var questionCount=0;questionCount<$scope.currentFormsSchema[formCount].questions.length;questionCount++){
                        //handle multiselect
                        if ($scope.currentFormsSchema[formCount].questions[questionCount].type == 'MSelect'){
                            //loop through all the options
                            for (var optionCount = 0;optionCount<$scope.currentFormsSchema[formCount].questions[questionCount].options.length;optionCount++){
                                var de='',cc='',pe='';
                                var commcareQuestionUniqueId = $scope.currentFormsSchema[formCount].questions[questionCount].value + ":"+$scope.currentFormsSchema[formCount].questions[questionCount].options[optionCount].value;
                                var formMappingElement = $scope.commcareQuestionIdToDataElementMap[newForm.unique_id+commcareQuestionUniqueId];
                                if (formMappingElement!=undefined){
                                    de = $scope.dataElementsIdToObjectMap[formMappingElement.dataElement];
                                    cc = formMappingElement.categoryCombo == 'default'?{id:'default',name:'default'} :$scope.categoryOptionIdToObjectMap[formMappingElement.categoryCombo];
                                    pe = $scope.periodIdToObjectMap[formMappingElement.period];
                                }
                                var questionJson = {
                                    commcareQuestion: commcareQuestionUniqueId,
                                    commcareQuestionDescription : $scope.currentFormsSchema[formCount].questions[questionCount].label,
                                    option:$scope.currentFormsSchema[formCount].questions[questionCount].options[optionCount],
                                    type : $scope.currentFormsSchema[formCount].questions[questionCount].type,
                                    dataElement: de,
                                    categoryCombo: cc,
                                    period: pe
                                }
                                newForm.mappingElements.push(questionJson);
                            }
                        }else{
                            var de='',cc='',pe='';
                            var commcareQuestionUniqueId = $scope.currentFormsSchema[formCount].questions[questionCount].value;
                            var formMappingElement = $scope.commcareQuestionIdToDataElementMap[newForm.unique_id+commcareQuestionUniqueId];
                            if (formMappingElement!=undefined){
                                de = $scope.dataElementsIdToObjectMap[formMappingElement.dataElement];
                                cc = formMappingElement.categoryCombo == 'default'?{id:'default',name:'default'} :$scope.categoryOptionIdToObjectMap[formMappingElement.categoryCombo];
                                pe = $scope.periodIdToObjectMap[formMappingElement.period];
                            }
                            var questionJson = {
                                commcareQuestion: commcareQuestionUniqueId,
                                commcareQuestionDescription : $scope.currentFormsSchema[formCount].questions[questionCount].label,
                                type : $scope.currentFormsSchema[formCount].questions[questionCount].type,
                                dataElement: de,
                                categoryCombo: cc,
                                period: pe
                            }
                            newForm.mappingElements.push(questionJson);
                        }
                    }
                    $scope.metadataMapping.forms.push(newForm);
                    $scope.formIdMetadataMappingToObjectMap[newForm.unique_id] = newForm;
                    popFromWaitingList(2);
                }
                popFromWaitingList(1);
            })
        }

        $scope.saveMetadataMapping = function(){

            var stateInvalid = false;

            for (var formCount=0;formCount<$scope.metadataMapping.forms.length;formCount++) {
                for (var mappingElementsCount=0;mappingElementsCount<$scope.metadataMapping.forms[formCount].mappingElements.length;mappingElementsCount++) {
                    if (!($scope.metadataMapping.forms[formCount].mappingElements[mappingElementsCount].dataElement == "" &&
                        $scope.metadataMapping.forms[formCount].mappingElements[mappingElementsCount].categoryCombo == "" &&
                        $scope.metadataMapping.forms[formCount].mappingElements[mappingElementsCount].period == ""
                        ||
                        $scope.metadataMapping.forms[formCount].mappingElements[mappingElementsCount].dataElement != "" &&
                        $scope.metadataMapping.forms[formCount].mappingElements[mappingElementsCount].categoryCombo != "" &&
                        $scope.metadataMapping.forms[formCount].mappingElements[mappingElementsCount].period != "" )
                    ){
                        stateInvalid = true;
                        $scope.metadataMapping.forms[formCount].mappingElements[mappingElementsCount].invalidState = true;
                    }else{
                        $scope.metadataMapping.forms[formCount].mappingElements[mappingElementsCount].invalidState = false;

                    }
                }
            }

            if (stateInvalid == true){
                $timeout(function(){
                    $scope.showInfoMessageToUser = false;
                    $scope.messageToUser = "Form Invalid..please recheck";
                })
                return;
            }

            $scope.currentConfigurationInstance.forms = [];
            for (var formCount=0;formCount<$scope.metadataMapping.forms.length;formCount++){

                var form  =  {
                    unique_id: "",
                    name: "",
                    orgUnitIdentifier: "",
                    orgUnitCodeMapping: "",
                    mappingElements: []
                }

                form.unique_id = $scope.metadataMapping.forms[formCount].unique_id;
                form.name = $scope.metadataMapping.forms[formCount].name;
                form.orgUnitIdentifier =$scope.metadataMapping.forms[formCount].orgUnitIdentifier;
                form.orgUnitCodeMapping = $scope.metadataMapping.forms[formCount].orgUnitCodeMapping;

                for (var mappingElementsCount=0;mappingElementsCount<$scope.metadataMapping.forms[formCount].mappingElements.length;mappingElementsCount++){
                    if ($scope.metadataMapping.forms[formCount].mappingElements[mappingElementsCount].dataElement != '' &&
                        $scope.metadataMapping.forms[formCount].mappingElements[mappingElementsCount].categoryCombo!= '' &&
                        $scope.metadataMapping.forms[formCount].mappingElements[mappingElementsCount].period != ''){
                        var categoryCombo=undefined;
                        //if category is default save name
                        if ($scope.metadataMapping.forms[formCount].mappingElements[mappingElementsCount].categoryCombo.id == 'default'){
                            categoryCombo = $scope.metadataMapping.forms[formCount].mappingElements[mappingElementsCount].categoryCombo.id;
                        }else{debugger
                            categoryCombo = $scope.metadataMapping.forms[formCount].mappingElements[mappingElementsCount].categoryCombo.id;
                        }
                        var mappingElement = {
                            commcareQuestion: $scope.metadataMapping.forms[formCount].mappingElements[mappingElementsCount].commcareQuestion,
                            commcareQuestionDescription : $scope.metadataMapping.forms[formCount].mappingElements[mappingElementsCount].commcareQuestionDescription,
                            option:$scope.metadataMapping.forms[formCount].mappingElements[mappingElementsCount].option,
                            type : $scope.metadataMapping.forms[formCount].mappingElements[mappingElementsCount].type,
                            dataElement: $scope.metadataMapping.forms[formCount].mappingElements[mappingElementsCount].dataElement.id,
                            categoryCombo: categoryCombo,
                            period: $scope.metadataMapping.forms[formCount].mappingElements[mappingElementsCount].period.id
                        }
                        form.mappingElements.push(mappingElement);
                    }
                }
                $scope.currentConfigurationInstance.forms.push(form);
            }
            configurationService.save('dhis2commcare-'+$scope.currentConfigurationInstance.name,$scope.currentConfigurationInstance).then(function(response){
                if (response.httpStatusCode == "200") {
                    $scope.showInfoMessageToUser = true;
                    $scope.messageToUser = "Saved";
                }else{
                    $scope.showInfoMessageToUser = false;
                    $scope.messageToUser ="Operation not successful..An unexpected thing happened";
                }
            })
        }

        $scope.resetMapping = function(){
            if (!confirm('All form mappings will be deleted. Are you sure you want to Reset?')){
                return
            }
            $scope.currentConfigurationInstance.forms = [];
            configurationService.save('dhis2commcare-'+$scope.currentConfigurationInstance.name,$scope.currentConfigurationInstance).then(function(response){
                if (response.httpStatusCode == "200") {
                    $scope.showInfoMessageToUser = true;
                    $scope.messageToUser = "Cleared";
                }else{
                    $scope.showInfoMessageToUser = false;
                    $scope.messageToUser ="Operation not successful..An unexpected thing happened";
                }
            })
        }

    })
