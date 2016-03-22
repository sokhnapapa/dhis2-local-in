/**
 *
 *
 */
var attributeID = "";
var instanceJson = [];
var identifierValue = "";
var trackedEntityInstanceID = "";
var orgUnitID = "";
var alertMg = 0;
var validate = 0;
var itemArray = [];
var dateArray = [];

var toDay;
var dateOfReport;
var temp = [];
var minTempArray = [];
var maxTempArray = [];

trackerCapture.controller('ImportController',
    function ($rootScope,
              $scope,
              CCEIImportSetting,
              $location,
              TEService,
              ProgramFactory,
              AttributesFactory,
              $route,
              DataElementService,
              CCEIProgram,
              $timeout,
              $q) {

        $scope.showSuccess = false;
        $scope.showModal = false;
        CCEIImportSetting.get().then(function (data) {
            if (data != "") {
                $scope.importParameters = data;
                console.info("This is import");
            } else {
                //do default properties
                $scope.importParameters = {
                    "parameters": [

                        {
                            "key": "import-parameter-attribute",
                            "valueType": "attribute",
                            "value": ""
                        }

                    ]
                };
            }


            AttributesFactory.getAll().then(function (data) {
                $scope.attributes = data;
            });


        });

        $scope.saveImportAndGo = function () {
            $scope.saveImport();
            $scope.showSuccess = true;
        };

        $scope.saveImport = function () {
            var promise = CCEIImportSetting.save($scope.importParameters).then(function (response) {
                //      $scope.showSuccess = true;
                return response.message;
            });
            $q.all([promise]).then(function (result) {
                console.log(promise);
                attributeID = $scope.importParameters.parameters[0].value;
                console.log(attributeID);

            });

        }


        $scope.showImportDialog = function () {
            $("#btnSave").show();
            $("#btnUpload").show();
            attributeID = $scope.importParameters.parameters[0].value;
            $scope.showSuccess = false;
            $("#importedFilePara").html("Upload PDF File ");
            $("#importedFilePara").removeClass().addClass("alert alert-warning");
            $("#importedFilePara").slideDown();
            $("#alertMsgPara").slideUp();
            $("#btnOK").hide();
            $("#importDialogModal").modal("show");
            $scope.showModal = true;
        };

        $scope.uploadFile = function () {
            $timeout(function () {
                $("#importedFilePara").slideUp();
                $("#alertMsgPara").slideUp();
            }, 1)
            $("#fileUpload").click();
            validate = 1;
            var uploadedFile = document.getElementById("fileUpload").files[0];
            console.log(uploadedFile);
        };


        //methode for parse Data
        $scope.parseData = function () {
            if (validate == 1) {

                $("#alertMsgPara").html("Importing... Please Wait For While...");
                $("#alertMsgPara").removeClass().addClass("alert alert-info");
                $("#alertMsgPara").slideDown();


                $scope.showSuccess = false;
                var uploadedFile = document.getElementById("fileUpload").files[0];
                console.log(uploadedFile.type);
                console.log(uploadedFile);
                console.log(URL.createObjectURL(uploadedFile));
                if (typeof uploadedFile == "undefined") {
				   validate=0;
                    $("#alertMsgPara").html("Please Upload a file");
                    $("#alertMsgPara").removeClass().addClass("alert alert-warning");
                    $("#alertMsgPara").slideDown();
                    var f = $("#fileUpload");
                    f.replaceWith(f.val('').clone(true));
                }
                else if (uploadedFile.type != "application/pdf") {
				    validate=0;
                    $("#alertMsgPara").html("Wrong file type " + uploadedFile.type + ".<br>Please upload .pdf format file.");
                    $("#alertMsgPara").removeClass().addClass("alert alert-danger");
                    $("#alertMsgPara").slideDown();
                    var f = $("#fileUpload");
                    f.replaceWith(f.val('').clone(true));
                }
                else {
				    validate=0;
                    $scope.pdfToText(URL.createObjectURL(uploadedFile));
                    var f = $("#fileUpload");
                    f.replaceWith(f.val('').clone(true));
                }
            }
            else {
                $("#alertMsgPara").html("Please upload File Before Import");
                $("#alertMsgPara").removeClass().addClass("alert alert-danger");
                $("#alertMsgPara").slideDown();

            }

        };


        //--------------pdf To TEXT-------------------//
        $scope.pdfToText = function (data) {
            PDFJS.workerSrc = 'ccei-customizations/scripts/PDF2TEXT/pdf.worker.js';
            PDFJS.cMapPacked = true;


            return PDFJS.getDocument(data).then(function (pdf) {
                var pages = [];
                for (var i = 0; i < pdf.numPages; i++) {
                    pages.push(i);
                }
                return Promise.all(pages.map(function (pageNumber) {
                    return pdf.getPage(pageNumber + 1).then(function (page) {
                        console.log(page);
                        return page.getTextContent().then(function (textContent) {
                            return textContent.items.map(function (item) {
                                return getItems(item.str);
                            }).join(' ');
                        });
                    });
                })).then(function (pages) {
                    $scope.getDate();

                    return pages.join("\r\n");
                });
            });
        };


        function getItems(text) {
            if (text.indexOf("Upper alarm limit") == -1 && text.indexOf("Lower alarm limit") == -1 && text.indexOf("Date") == -1 && text.indexOf("temp.") == -1 && text.indexOf("out of") == -1 && text.indexOf("range") == -1 && text.indexOf("trigger") == -1 && text.indexOf("time") == -1 && text.indexOf("PDF document") == -1 && text.indexOf("Date and place:") == -1 && text.indexOf("Signature:") == -1 && text.indexOf("Page") == -1 && text.indexOf("Below") == -1 && text.indexOf("Above") == -1 && text != "") {
                itemArray.push(text);
            }
        }

        //getDate Function
        $scope.getDate = function () {
            console.log(itemArray);
            var len = 10;
            for (var d = 0; d < itemArray.length; d++) {
                if (itemArray[d] == "Identification number:") {
                    identifierValue = itemArray[d + 1];
                    toDay = itemArray[d - 1];
                    dateOfReport = toDay.split(" ")[0];
                    itemArray.splice(d - 1, 3);
                }
                else if (itemArray[d] == "Today") {
                    dateArray.push($scope.getDateFormat(dateOfReport));
                    //console.log(array[i].length);
                }
                else if (itemArray[d].length == len) {
                    if (itemArray[d].split(".").length - 1 == 2) {
                        // dateArray.push(getDateFormat(itemArray[d]));
                        dateArray.push($scope.getDateFormat(itemArray[d]));
                    }

                } else if (itemArray[d].indexOf("°C") >= 0) {
                    if (itemArray[d].indexOf("Above") == -1 || itemArray[d].indexOf("Below") == -1) {
                        temp.push($scope.getTemp(itemArray[d]));
                    }
                }

            }
            console.log(dateArray);
            console.log(temp);
            console.log(identifierValue);
			
			if(identifierValue.length==9){
			       
                $scope.getTrackEntityInstance();
			    
			}
			else{
			   $("#alertMsgPara").html("PDF File is not in Correct format.");
                $("#alertMsgPara").removeClass().addClass("alert alert-warning");
                $("#alertMsgPara").slideDown();
			}
			
			


        };


       //get trackedEntityInstance

        $scope.getTrackEntityInstance = function () {
            var url = "../api/trackedEntityInstances.json?&filter=" + attributeID + ":IN:" + identifierValue + "&ou=IWp9dQGM0bS&ouMode=DESCENDANTS";
            $.get(url, function (instanceJson) {
                console.log(instanceJson);
                console.log(instanceJson.trackedEntityInstances[0].attributes[7].value);
                console.log(instanceJson.trackedEntityInstances[0].attributes.length);


                $.each(instanceJson.trackedEntityInstances[0].attributes, function (i) {
                    if (instanceJson.trackedEntityInstances[0].attributes[i].value == identifierValue) {

                        orgUnitID = instanceJson.trackedEntityInstances[0].orgUnit;
                        trackedEntityInstanceID = instanceJson.trackedEntityInstances[0].trackedEntityInstance;
                        console.log(orgUnitID);
                        console.log(trackedEntityInstanceID);
                        alertMg = 1;
                        $scope.separateTemp(temp);
                        $scope.sendData(identifierValue, dateArray, minTempArray, maxTempArray);
                    }

                });

                if (alertMg == 0) {
                    alert("Identifier value not matched");
                }

            });
        }


        $scope.getDateFormat = function (date) {
            var tempDate = date.split('.');
            var Day = tempDate[0];
            var Month = tempDate[1];
            var year = tempDate[2];

            var newDate = (year + '-' + Month + '-' + Day);


            return newDate;
        };

        $scope.getTemp = function (temp) {
            var new_Temp = temp.split("°C")[0];
            return new_Temp;
        };

        $scope.separateTemp = function (temp) {
            var x = 1;
            var y = 2;
            for (var i = 0; i < temp.length; i++) {
                if (i == x) {
                    minTempArray.push(temp[i]);
                    x = x + 3;
                }
                else if (i == y) {
                    maxTempArray.push(temp[i]);
                    y = y + 3;
                }
            }
            console.log(maxTempArray);
            console.log(minTempArray);
        };


        //sendData
        $scope.sendData = function (id, date, minT, maxT) {


            var flag = false;
            var len = date.length;


            var pushDataElements =
                [
                    {uid: "MT4IiZfKn8I"},
                    {uid: "dOs7q36Vq11"}
                ];

            var eventJSON = {
                "program": ' ',
                "status": ' ',
                "programStage": ' '
            };


            for (var i = 0; i <= len - 1; i++) {
                eventJSON = {
                    "program": 'QkpY35KBO8d',
                    "status": "COMPLETED",
                    "programStage": 'FaIjrneGdhJ'
                };
                console.log(i);
                var datavalues = [];
                for (var k = 0; k < pushDataElements.length; k++) {
                    var dataelements = {};

                    if (k == 0) {
                        dataelements ["dataElement"] = pushDataElements[k].uid;
                        dataelements ["value"] = parseFloat(maxT[i]);
                    } else {
                        dataelements ["dataElement"] = pushDataElements[k].uid;
                        dataelements ["value"] = parseFloat(minT[i]);
                    }
                    datavalues.push(dataelements);
                }

                eventJSON.eventDate = date[i].toString();
                eventJSON.dataValues = datavalues;
                eventJSON.orgUnit = orgUnitID.toString();
                eventJSON.trackedEntityInstance = trackedEntityInstanceID.toString();
                console.info("Send");
                console.log(eventJSON);
                $.ajax({
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    url: '../api/events',
                    data: JSON.stringify(eventJSON),
                    dataType: 'json',
                    type: 'post',
                    async: false,
                    success: handleEventSuccess,
                    error: handleEventError
                });


                function handleEventSuccess(data) {
                    if (data.response.importSummaries[0].status === 'SUCCESS') {
                        flag = true;
                        console.log('Event created successfully!');
                        //  alert('Event created successfully!');
                    }
                }

                function handleEventError(textStatus, errorThrown) {
                    console.log('Creating event Error ' + textStatus);
                    //  alert('Creating event Error '+ textStatus);
                    console.log(errorThrown);
                }
            }

            if (flag == true) {
                $("#alertMsgPara").html("File imported successfully ");
                $("#alertMsgPara").removeClass().addClass("alert alert-success");
                $("#alertMsgPara").slideDown();
                $("#btnOK").show();
                $("#btnUpload").hide();
                $("#btnSave").hide();
            }
            else {
                $("#alertMsgPara").html("File not Imported ");
                $("#alertMsgPara").removeClass().addClass("alert alert-warning");
                $("#alertMsgPara").slideDown();
                $("#btnOK").show();
                $("#btnSave").hide();
                $("#btnUpload").hide();

            }

        };


        $scope.update = function (firstRun) {
            var equipmentId = null;
            var modelId = null;


            angular.forEach($scope.importParameters.parameters, function (parameter) {

                //get values
                if (parameter.key == "model-uid") {
                    modelId = parameter.value;
                } else if (parameter.key == "equipment-uid") {
                    equipmentId = parameter.value;
                    CCEIProgram.getProgramsByTe(equipmentId).then(function (data) {
                        $scope.equipmentProgramList = data.programs;
                    })

                } else if (parameter.key == "program-mapping") {

                    if (!firstRun) {
                        parameter.programToProgramMapping = [];
                    }
                    $timeout(function () {
                        CCEIProgram.getProgramsByTe(modelId).then(function (data) {
                            //check if values exist
                            if (equipmentId && modelId && parameter.programToProgramMapping.length < data.programs.length) {
                                var programToProgramMapping = [];
                                //populate list

                                angular.forEach(data.programs, function (program) {
                                    var jsonObject = {
                                        "equipmentProgram": [
                                            {
                                                "UID": "",
                                                "name": ""
                                            }
                                        ],
                                        "modelProgram": [
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
