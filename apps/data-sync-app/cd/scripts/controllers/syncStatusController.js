	/** 
	
	This file has the controller and some other needed functions for handling status of 
	the instances to be synced
	
	Remember : 
		-- There are some global variables declared in app.js. eg : apiUrl
		-- Form validation functions are coded in validations.js
		-- Saving and fetching basic settings functionality is coded in saveAndFetch.js

	**/
	
	app.controller('syncStatusController', function($rootScope, $http) {
		
		$http.get( apiUrl ).then(function (response) {                
				if(!response.data == "")
					$rootScope.setting = JSON.parse(response.data.value);
				
				printStatus($rootScope);
		});
	});
	
	
	function printStatus($rootScope)
	{
		var instance = "";
		var htmlStr = "";
		$rootScope.setting.instances.forEach(function(instance) {
			htmlStr = "<tr>";
			htmlStr += "<td>" + instance.name + "</td>";
			
			var isOptionsSet = false;
			var isMappingSet = false;
			var isDEGselected = false;
			
			if( $rootScope.setting.parentSetting.DEGcode != "" )
				isDEGselected = true;
			
			$rootScope.setting.basicOptions.forEach(function(option) {
				if( option.instance == instance.id )
				{
					isOptionsSet = true;
				}
			});
			
			$rootScope.setting.mappings.forEach(function(mapping) {
				if( mapping.instance == instance.id && mapping.mapData.length > 0 )
				{
					isMappingSet = true;
				}
			});
			
			if ( !isDEGselected )
			{
				htmlStr += "<td> Parent Setting is incomplete </td>";
				htmlStr += "<td> <a class='btn btn-xs btn-danger' style='width:75px' href='parentSetting.html'> Set </a> </td>";
			}
			else if( !isOptionsSet )
			{
				htmlStr += "<td> Options not set </td>";
				htmlStr += "<td> <a class='btn btn-xs btn-warning' style='width:75px' href='basicSettings.html?i=" + instance.id + "'> Set </a> </td>";
			}
			else if ( !isMappingSet )
			{
				htmlStr += "<td> No mappings found </td>";
				htmlStr += "<td> <a class='btn btn-xs btn-warning' style='width:75px' href='setMappings.html?i=" + instance.id + "'> Map </a> </td>";
			}
			else
			{
				htmlStr += "<td> Ready to be synced </td>";
				htmlStr += "<td> <a class='btn btn-xs btn-success' style='width:75px' href='sync.html?i=" + instance.id + "'> Sync </a> </td>";
			}

			htmlStr += "</tr>";
			$("#SyncStatus").append(""+htmlStr+"");
		});
		
	}