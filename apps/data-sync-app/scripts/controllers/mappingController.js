	/** 
	
	This file has the controller and some other needed functions for handling the mappings
	of the dataElements and indicators from national and child instances
	
	Remember : 
		-- There are some global variables declared in app.js. eg : apiUrl
		-- Form validation functions are coded in validations.js
		-- Saving and fetching basic settings functionality is coded in saveAndFetch.js

	**/
	
	app.controller('mappingController', function($rootScope, $http) {
		
		$rootScope.selectedInstance = getParameterByName("i");
		
		$http.get( apiUrl ).then(function (response) {                    
				if(!response.data == "")
					$rootScope.setting = JSON.parse(response.data.value);
				
				validateLogin( $http, basicInstanceUrl( $rootScope.setting.instances , $rootScope.selectedInstance)+"api/resources.jsonp?callback=JSON_CALLBACK");
				validateMapping( $rootScope.selectedInstance, $rootScope, $http );
				
				fetchDEs( $rootScope, $http );
		});
		
		$rootScope.mapInstance = function() {
			$('#mapInputs tr').each(function(i){
				$(this).children('td').each(function(index){
					if(index==1 && $(this).find('select').length > 0)
					{
						var selectBoxId = $(this).find('select').attr("id");
						var selectedValue = $("#"+selectBoxId).val();
						var periodicity = $("#"+selectBoxId+"_prd").val();
						
						doMapping($rootScope, selectBoxId, selectedValue, periodicity);
					}
				});
			});

			saveChanges($rootScope, $http);
		};
	});
	
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO FETCH NATIONAL D.E LIST AND INSTANCE D.E LIST
	// ***************************************************************************************************
	// ***************************************************************************************************
	
	function fetchDEs( $rootScope, $http )
	{
		var parentDEsUrl = "../../dataElementGroups/"+ $rootScope.setting.parentSetting.DEGcode +".json?fields=dataElements[id,name,shortName,categoryCombo[categoryOptionCombos[id,name]]]";			
		var childDEsUrl = basicInstanceUrl( $rootScope.setting.instances , $rootScope.selectedInstance)+"api/dataElements.jsonp?fields=id,name,shortName,categoryCombo[categoryOptionCombos[id,name]]&paging=false&callback=JSON_CALLBACK";
		var childIndicatorsUrl = basicInstanceUrl( $rootScope.setting.instances , $rootScope.selectedInstance)+"api/indicators.jsonp?fields=id,name,shortName&paging=false&callback=JSON_CALLBACK";

		
			$rootScope.parentDEs =  JSON.parse('{ "dataElements" : [] }');
			$rootScope.selectedInstanceDEs =  [];
			$rootScope.nationalPeriodTypes = [ 
												{"name" : "Daily"},
												{"name" : "Weekly"},
												{"name" : "Monthly"},
												{"name" : "BiMonthly"},
												{"name" : "Quarterly"},
												{"name" : "SixMonthly"},
												{"name" : "SixMonthlyApril"},
												{"name" : "Yearly"},
												{"name" : "FinancialApril"},
												{"name" : "FinancialJuly"},
												{"name" : "FinancialOct"}
											];		
			
			//getting national/parent D.Es
			$http.get( parentDEsUrl ).then(function (response) {
					if(!response == "")
						$rootScope.parentDEs = response.data;
			}).then(
				//getting provincial/child indicators
				$http.jsonp( childIndicatorsUrl ).then(function (iresponse) {
					if(!iresponse == "")
						$rootScope.selectedInstanceDEs = iresponse.data.indicators;
			})).then(
				//getting provincial/child D.Es
				$http.jsonp( childDEsUrl ).then(function (cresponse) {
					if(!cresponse == "")
					{
						cresponse.data.dataElements.forEach(function(de) {
							$rootScope.selectedInstanceDEs.push(de);
						});
					}
					buildMapInputs($rootScope);
			}));
	}

	
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO DO ALL THE MAPPINGS BUT NOT TO SAVE
	// ***************************************************************************************************
	// ***************************************************************************************************
	
	/* MAPPINGS JSON FORMAT
	
		{
			instances : [];
			mappings : [
							{
								instance : 2;
								mapData : 
										[
											{
												nationalDE : shd78f5s6f8;
												instanceDE : sffagad4521;
											},
											{
												nationalDE : shd78f5s6f8;
												instanceDE : sffagad4521;
											}
										]
							},
							{
								instance : 3;
								mapData : 
										[
											{
												nationalDE : agdagd8ha7r;
												instanceDE : sffarhrhah1;
											},
											{
												nationalDE : shd78f5s6f8;
												instanceDE : rahhrarha84;
											}
										]
							}
						]
		}
	*/
	
	function doMapping($rootScope, selectedBoxId, selectedValue, periodicity)
	{
		var newMapData = {};
		
		//national DE
		newMapData.nationalDE = selectedBoxId.split('-')[0];
		
		//national COC
		newMapData.nationalCOC = "none";
		if(selectedBoxId.split('-').length==2)
			newMapData.nationalCOC = selectedBoxId.split('-')[1];
		
		//instance DE
		newMapData.instanceDE = selectedValue.split('-')[0];
		
		//instance COC
		newMapData.instanceCOC = "none";
		if(selectedValue.split('-').length==2)
			newMapData.instanceCOC = selectedValue.split('-')[1];
		
		//periodicity
		newMapData.periodicity = periodicity;
		
		
		var isMappingFoundForInstance = false;
		var isThisMappingAlreadyThere = false;
		
		$rootScope.setting.mappings.forEach(function(mapping) {
			
			if( mapping.instance == $rootScope.selectedInstance )
			{
				isMappingFoundForInstance = true;
				var indexeToBeDeleted = -1; // in case if user unselects instance data element
				mapping.mapData.forEach(function(mData, index){
					
					/* case : mapping found for the instance and 
					mapping for national DE is already there */					
					if( mData.nationalDE == newMapData.nationalDE && mData.nationalCOC == newMapData.nationalCOC )
					{
						isThisMappingAlreadyThere = true;
						
						if( selectedValue == -1 )
						{
							console.log("unselected");
							indexeToBeDeleted = index;
						}
						else
						{
							mData.instanceDE = newMapData.instanceDE;
							mData.instanceCOC = newMapData.instanceCOC;
							mData.periodicity = newMapData.periodicity;
						}
					}
				});
				
				// deleting all unselected mappings
				if( indexeToBeDeleted >= 0 )
				{
					$rootScope.setting.mappings.forEach(function(mapping) {
						if( mapping.instance == $rootScope.selectedInstance )
						{							
							mapping.mapData = mapping.mapData.splice( indexeToBeDeleted , 1 );
						}
					});
				}
					
					
				
				/* case : mapping found for the instance but 
				mapping for national DE is not there */
				if(!isThisMappingAlreadyThere)
				{
					if( selectedValue != -1 )
						mapping.mapData.push(newMapData);
				}
			}
		});
		
		// case : mapping not found for the instance
		if(!isMappingFoundForInstance)
		{
			var newInstanceMapData = {};
			
			newInstanceMapData.instance = $rootScope.selectedInstance;
			newInstanceMapData.mapData = [];
			newInstanceMapData.mapData.push(newMapData);
			
			if( selectedValue != -1 )
				$rootScope.setting.mappings.push(newInstanceMapData);
		}
	}
	
	
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO GET URL OF INSTANCE
	// ***************************************************************************************************
	// ***************************************************************************************************
	function basicInstanceUrl(instanceList, currentInstanceId) 
	{
		var ins = {};
		instanceList.forEach(function(instance) {
			if(instance.id == currentInstanceId)
			{
				ins.id = instance.id;
				ins.un = instance.uname;
				ins.pw = instance.pword;
				ins.url = instance.url;
			}
		});
		
		return ins.url+"/";
	}
	
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO GET PARAMETER VALUES FROM URL
	// ***************************************************************************************************
	// ***************************************************************************************************
	function getParameterByName(name) 
	{
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}
	
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO GET SELECTED DATA ELEMENT GROUP OF THE CURRENT INSTANCE
	// ***************************************************************************************************
	// ***************************************************************************************************
	function getInstanceDataElementGroup( optionList, instanceID )
	{
		var deg = "";
		optionList.forEach(function(option) {
			console.log(option);
			if( option.instance == instanceID )
			{
				deg = option.DEG;
			}
		});
		
		return deg;
	}
	
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO BUID ALL SELECT BOXES FOR MAPPING
	// ***************************************************************************************************
	// ***************************************************************************************************
	
	function buildMapInputs($rootScope)
	{
		var options = $rootScope.setting.basicOptions;
		var mappings = $rootScope.setting.mappings;
		var childDE = $rootScope.selectedInstanceDEs;
		var nationalDE = $rootScope.parentDEs.dataElements;
		var nationalPeriodTypes = $rootScope.nationalPeriodTypes;
		var htmlStr = ""; // Table structure 

		
		nationalDE.forEach(function(nDE) {	
			if( nDE.categoryCombo.categoryOptionCombos.length == 0 )
			{
				htmlStr += "<tr>";
				htmlStr += "<td  id='"+nDE.id+"_td' style='text-align:left;padding-left:30px' title='"+nDE.name+"'>"+nDE.name+"</td>";
				htmlStr += "<td>";
				htmlStr += "<select id="+nDE.id+"> <option value='-1'> -- select -- </option>";
				
				// printing select box with options of DEs of child instance for indicators and DEs with 0 COC
				childDE.forEach(function(cDE) {	
					if( !cDE.hasOwnProperty('categoryCombo') )//indicators
					{
						var isSelected = isSelectable( $rootScope, mappings, nDE.id, cDE.id,nDE.name, cDE.name);
						htmlStr += "<option value="+cDE.id+" "+isSelected+">";
						htmlStr += cDE.name + " -- (Indicator)";
						htmlStr += "</option>";						
					}
					else if( cDE.categoryCombo.categoryOptionCombos.length == 0 ) // DEs with 0 COC
					{
						var isSelected = isSelectable( $rootScope, mappings, nDE.id, cDE.id,nDE.name, cDE.name);
						htmlStr += "<option value="+cDE.id+" "+isSelected+">";
						htmlStr += cDE.name;
						htmlStr += "</option>";
					}
					else if(cDE.categoryCombo.categoryOptionCombos.length > 0)
					{
						cDE.categoryCombo.categoryOptionCombos.forEach(function(ccoc) {	
							var optionValue = cDE.id + "-" + ccoc.id;
							var isSelected = isSelectable( $rootScope , mappings, nDE.id, optionValue, tdText, cDE.name + " - " + ccoc.name);
							htmlStr += "<option value="+optionValue+" "+isSelected+">";
							htmlStr += cDE.name + " - " + ccoc.name;
							htmlStr += "</option>";
						});
					}
				});
				
				htmlStr += "</td>";
				
				htmlStr += "<td>"
				
					// printing select box with period types of national instance
					htmlStr += "<select id='"+nDE.id+"_prd'>"
					nationalPeriodTypes.forEach(function(pt) {	
							var isSelected = isPeriodSelectable( $rootScope , mappings, nDE.id, pt.name );
							htmlStr += "<option value="+pt.name+" "+isSelected+">";
							htmlStr += pt.name;
							htmlStr += "</option>";
					});
					htmlStr += "</select>"
					
				htmlStr += "</td>"
				
				htmlStr += "</tr>";
			}
			else
			{
				nDE.categoryCombo.categoryOptionCombos.forEach(function(coc) {
					var title = "Data Element : "+nDE.name +" , COC : "+ coc.name;
					var tdText = nDE.name +" - "+ coc.name;
					var selectBoxId = nDE.id + "-" + coc.id;
					
					htmlStr += "<tr>";
					htmlStr += "<td  id='"+selectBoxId+"_td' style='text-align:left;padding-left:30px' title='"+title+"'>"+tdText+"</td>";
					htmlStr += "<td>";
					htmlStr += "<select id="+selectBoxId+"> <option value='-1'> -- select -- </option>";
					
					// printing select box with options of DEs of child instance for indicators and DEs with 0 COC
					childDE.forEach(function(cDE) {
						if( !cDE.hasOwnProperty('categoryCombo') )//indicators
						{
							var isSelected = isSelectable( $rootScope, mappings, selectBoxId, cDE.id, nDE.name, cDE.name);
							htmlStr += "<option value="+cDE.id+" "+isSelected+">";
							htmlStr += cDE.name + " -- (Indicator)";
							htmlStr += "</option>";						
						}
						else if( cDE.categoryCombo.categoryOptionCombos.length == 0 ) // DEs with 0 COC
						{
							var isSelected = isSelectable( $rootScope, mappings, selectBoxId, cDE.id, nDE.name, cDE.name);
							htmlStr += "<option value="+cDE.id+" "+isSelected+">";
							htmlStr += cDE.name;
							htmlStr += "</option>";
						}
						else if(cDE.categoryCombo.categoryOptionCombos.length > 0)
						{
							cDE.categoryCombo.categoryOptionCombos.forEach(function(ccoc) {	
								var optionValue = cDE.id + "-" + ccoc.id;	
								var isSelected = isSelectable( $rootScope , mappings, selectBoxId, optionValue, tdText, cDE.name + " - " + ccoc.name);
								htmlStr += "<option value="+optionValue+" "+isSelected+">";
								htmlStr += cDE.name + " - " + ccoc.name;
								htmlStr += "</option>";
							});
						}
					});
					
					htmlStr += "</td>"
					htmlStr += "<td>"
				
					// printing select box with period types of national instance
					htmlStr += "<select id='"+selectBoxId+"_prd'>"
					nationalPeriodTypes.forEach(function(pt) {	
							var isSelected = isPeriodSelectable( $rootScope , mappings, selectBoxId, pt.name );
							htmlStr += "<option value="+pt.name+" "+isSelected+">";
							htmlStr += pt.name;
							htmlStr += "</option>";
					});
					htmlStr += "</select>"
					
					htmlStr += "</td>"
					htmlStr += "</tr>";
				});
			}
		});	
			
		$("#mapInputs").html(""+htmlStr+"");
		$("#coverLoad").hide();
	}
	
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO CHECK WHETHER AN OPTION IS SELECTABLE OR NOT
	// ***************************************************************************************************
	// ***************************************************************************************************
	function isSelectable( $rootScope, mappings, selectBoxId, optionValue, nDEText, cDEText )
	{
		
		var selectedInstance = $rootScope.selectedInstance;
		
		var nDE = selectBoxId.split("-")[0];
		
		var nCOC = "none";
		if(selectBoxId.split("-").length==2)
			nCOC = selectBoxId.split("-")[1];
		
		var iDE = optionValue.split("-")[0];
		
		var iCOC = "none";
		if(optionValue.split("-").length==2)
			iCOC = optionValue.split("-")[1];
		
		var isMappingFoundForInstance = false;
		var isMappingFoundForDE = false;
		
		
		mappings.forEach(function(mappings) {
			if(mappings.instance == selectedInstance)
			{
				isMappingFoundForInstance = true;
				mappings.mapData.forEach(function(mData) {
					if( mData.nationalDE == nDE && mData.nationalCOC == nCOC && mData.instanceDE == iDE && mData.instanceCOC == iCOC)
					{
						isMappingFoundForDE = true;
					}
				});
			}
		});
		
		if(( !isMappingFoundForInstance && selectBoxId == optionValue ) || ( isMappingFoundForInstance && isMappingFoundForDE ) || ( !isMappingFoundForInstance && nDEText == cDEText ))
			return "selected";
		else
			return "";
	}
	
	//for periodicity
	var lastSelectBoxSelected = "";
	function isPeriodSelectable( $rootScope, mappings, selectBoxId, periodOptionValue )
	{
		var selectedInstance = $rootScope.selectedInstance;
		
		var nDE = selectBoxId.split("-")[0];
		
		var nCOC = "";
		if(selectBoxId.split("-").length==2)
			nCOC = selectBoxId.split("-")[1];
		
		var isSelected = "";
		
		mappings.forEach(function(mappings) {
			if( mappings.instance == selectedInstance )
			{
				mappings.mapData.forEach( function( mData ) {					
					if( mData.nationalDE == nDE && mData.nationalCOC == nCOC && mData.periodicity == periodOptionValue )
					{
						isSelected = "selected";
						lastSelectBoxSelected = selectBoxId;
					}
				});
			}
		});
		
		if( lastSelectBoxSelected != selectBoxId )
		{
			$rootScope.setting.basicOptions.forEach( function( option ){
				if( option.instance == selectedInstance )
				{
					if( option.DefaultPeriodType == periodOptionValue )	
					{
						isSelected = "selected";
					}
				}
			});
		}
		
		return isSelected;
	}