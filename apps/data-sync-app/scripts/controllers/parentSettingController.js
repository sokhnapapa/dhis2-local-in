	/** 
	
	This file has the controller and some other needed functions for handling the settings
	for the whole app
	
	Remember : 
		-- There are some global variables declared in app.js. eg : apiUrl
		-- Form validation functions are coded in validations.js
		-- Saving and fetching basic settings functionality is coded in saveAndFetch.js

	**/
	
	app.controller('parentSettingController', function($rootScope, $http) {
		
		$http.get( apiUrl ).then(function (response) {                 
				if(!response.data == "")
					$rootScope.setting = JSON.parse(response.data.value);
		});
		
		var DEgroupUrl = "../../dataElementGroups.json";
		
		$http.get( DEgroupUrl ).then(function (response) {
			if(!response.data == "")
				$rootScope.DEgroups = response.data.dataElementGroups;
		});
		
		//-------------------------------------------------------------------------

		$rootScope.isThisDEgroupSelected = function(deg) {
			if( $rootScope.setting.parentSetting.DEGcode == deg )
				return true;
			else
				return false;
		};
		
		$rootScope.showAlert = function() {
			$("#alertModal").modal('show');
		};
		
		$rootScope.saveSettings = function() {
			doSetting($rootScope);
			saveChanges($rootScope, $http);
		};
	});
	
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO DO ALL THE MAPPINGS BUT NOT TO SAVE
	// ***************************************************************************************************
	// ***************************************************************************************************
	
	/* SETTING JSON FORMAT
	
		{
			instances : [],
			mappings : [],
			parentSetting :	{							
								DEGname = "ANC",
								DEGcode = "wvrrw3vr3b",
								otherSettingX : "rrvrvwvr3"
							}
		}
	*/
	
	function doSetting($rootScope)
	{
		var DEGcode = $("#deg").val();
		var DEGname = $("#deg option:selected").text();
		
		var isSettingFoundForInstance = false;
		var isThisSettingAlreadyThere = false;
		var hasDEGchanged = false;
		
		
		if( $rootScope.setting.parentSetting.DEGcode != $("#deg").val() )
			hasDEGchanged = true;
		
		$rootScope.setting.parentSetting.DEGcode = DEGcode;
		$rootScope.setting.parentSetting.DEGname = DEGname;
		
		//deleting map data since data element group has been changed
		if(hasDEGchanged)
		{
			$rootScope.setting.mappings = [];
		}
	}