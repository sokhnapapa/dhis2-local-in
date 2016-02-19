	/** 
	
	This file has the controller and some other needed functions for handling the basic settings
	for individual instances. 
	
	Remember : 
		-- There are some global variables declared in app.js. eg : apiUrl
		-- Form validation functions are coded in validations.js
		-- Saving and fetching basic settings functionality is coded in saveAndFetch.js

	**/
	
	//controller
	app.controller('basicSettingController', function($rootScope, $http) {
		
		$rootScope.selectedInstance = getParameterByName("i");
		
		$rootScope.periodTypes = [ 
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
											
		$http.get( apiUrl ).then(function (response) {                 
				if(!response.data == "")
					$rootScope.setting = JSON.parse(response.data.value);
				
				$rootScope.DEgroup = $rootScope.setting.parentSetting.DEGname;
				validateLogin(  $http, basicInstanceUrl($rootScope.setting.instances , $rootScope.selectedInstance)+"api/resources.jsonp?callback=JSON_CALLBACK");
				var OrgLevelUrl = basicInstanceUrl( $rootScope.setting.instances , $rootScope.selectedInstance)+"api/organisationUnitLevels.jsonp?fields=id,name,level&callback=JSON_CALLBACK";
				
				getOUL(OrgLevelUrl, $rootScope, $http);
		});
		
		//-------------------------------------------------------------------------
		$rootScope.saveSettings = function() {
			doSetting($rootScope);
			saveChanges($rootScope, $http);
		};
	});
	
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO GET ORGANISATION UNIT LEVELS (INSTANCE) and USERGROUPS OF THE NATIONAL AND CHILD INSTANCE
	// ***************************************************************************************************
	// ***************************************************************************************************
	function getOUL(url, $rootScope, $http)
	{
		$http.jsonp( url ).then(function (response) {  
				if(!response.data == "")
					$rootScope.orgLevels = response.data.organisationUnitLevels;
				
				getNationalUG( $rootScope, $http );
		});
	}
	
	function getNationalUG( $rootScope, $http )
	{
		var url = "../../userGroups.json";
		
		$http.get( url ).then(function (response) {  
				if(!response.data == "")
					$rootScope.nationalUGs = response.data.userGroups;
				
				getInstanceUGs( $rootScope, $http );
		});
	}
	
	function getInstanceUGs( $rootScope, $http )
	{
		var url = basicInstanceUrl( $rootScope.setting.instances , $rootScope.selectedInstance)+"api/userGroups.jsonp?callback=JSON_CALLBACK";
		
		$http.jsonp( url ).then(function (response) {  
				if(!response.data == "")
					$rootScope.instanceUGs = response.data.userGroups;
				
				buildSelectBoxes( $rootScope.orgLevels , $rootScope.periodTypes, $rootScope.nationalUGs, $rootScope.instanceUGs, $rootScope.setting.basicOptions, $rootScope.selectedInstance);
		});
	}

	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO BUILD SELECT BOXES
	// ***************************************************************************************************
	// ***************************************************************************************************
	function buildSelectBoxes( oulList , ptList , NUGlist, IUGlist, BOlist , cIns)
	{
		//orgUnit levels
		oulList.forEach(function(org) {
			$("#oul").append("<option value='" + org.level + "' " + isThisOrgLevelSelected( org.level, BOlist, cIns ) + " > " + org.name + " </option> ");
		});
		
		//period types
		ptList.forEach(function(pt) {
			$("#pt").append("<option value='" + pt.name + "' " + isThisPeriodTypeSelected( pt.name, BOlist, cIns ) + " > " + pt.name + " </option> ");
		});
		
		//National user groups
		NUGlist.forEach(function(nu) {
			$("#nug").append("<option value='" + nu.id + "' " + isThisNatUGrpSelected( nu.id, BOlist, cIns ) + " > " + nu.name + " </option> ");
		});
		
		//instance user groups
		IUGlist.forEach(function(iu) {
			$("#iug").append("<option value='" + iu.id + "' " + isThisInsUGrpSelected( iu.id, BOlist, cIns ) + " > " + iu.name + " </option> ");
		});
	}
	
	function isThisOrgLevelSelected( oul , basicOptions, selectedInstance )
	{
		var found = "";
		basicOptions.forEach(function(option) {
			if( option.instance == selectedInstance && option.OrgUnitLevel == oul)
				found = "selected";
		});
		return found;
	}
	
	function isThisPeriodTypeSelected( pt, basicOptions, selectedInstance )
	{
		var found = "";
		basicOptions.forEach(function(option) {
			if( option.instance == selectedInstance && option.DefaultPeriodType == pt)
				found = "selected";
		});
		return found;
	}
	
	function isThisNatUGrpSelected( nu, basicOptions, selectedInstance )
	{
		var found = "";
		basicOptions.forEach(function(option) {
			if( option.instance == selectedInstance && option.natUserGroupForMsg == nu)
				found = "selected";
		});
		return found;
	}
	
	function isThisInsUGrpSelected( iu, basicOptions, selectedInstance )
	{
		var found = "";
		basicOptions.forEach(function(option) {
			if( option.instance == selectedInstance && option.insUserGroupForMsg == pt)
				found = "selected";
		});
		return found;
	}
	
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO GET THE BASIC URL OF THE INSTANCE
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
	// TO DO ALL THE MAPPINGS BUT NOT TO SAVE
	// ***************************************************************************************************
	// ***************************************************************************************************
	
	/* SETTING JSON FORMAT
	
		{
			instances : [],
			mappings : [],
			basicOptions : [
							{
								instance : 2;
								OrgUnitLevel : 2,
								OrgUnitLevelName : "",
								periodType : "",
								natUserGroupForMsg : "",
								insUserGroupForMsg : ""
								
							},
							{
								instance : 3;
								OrgUnitLevel : 3,
								OrgUnitLevelName : "",
								periodType : "",
								natUserGroupForMsg : "",
								insUserGroupForMsg : ""
							}
						]
		}
	*/
	
	function doSetting($rootScope)
	{
		var newOption = {};
		newOption.instance = $rootScope.selectedInstance;
		newOption.OrgUnitLevel = $("#oul").val();
		newOption.OrgUnitLevelName = $("#oul option:selected").text();
		newOption.DefaultPeriodType = $("#pt").val();
		newOption.natUserGroupForMsg = $("#nug").val();
		newOption.insUserGroupForMsg = $("#iug").val();
		
		var isSettingFoundForInstance = false;
		var isThisSettingAlreadyThere = false;
		
		$rootScope.setting.basicOptions.forEach(function(option) {			
			if( option.instance == $rootScope.selectedInstance )
			{
				isSettingFoundForInstance = true;
				
				option.OrgUnitLevel = $("#oul").val();
				option.OrgUnitLevelName = $("#oul option:selected").text();
				option.DefaultPeriodType = $("#pt").val();
				option.natUserGroupForMsg = $("#nug").val();
				option.insUserGroupForMsg = $("#iug").val();
			}
		});
		
		// case : mapping not found for the instance
		if(!isSettingFoundForInstance)
		{			
			$rootScope.setting.basicOptions.push(newOption);
		}
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