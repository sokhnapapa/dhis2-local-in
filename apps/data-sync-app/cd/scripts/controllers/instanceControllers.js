	/** 
	
	This file has set of controllers that control instances when adding, editing , deleting
	and doing other operations like fetching. All controllers are named accordingly.
	
	Remember : 
		-- There are some global variables declared in app.js. eg : apiUrl
		-- Form validation functions are coded in validations.js
		-- Saving and fetching basic settings functionality is coded in saveAndFetch.js

	**/
	
	
	
	/* ************************************************************************************
	***************************************************************************************
		BASIC CONTROLLER
	***************************************************************************************
	************************************************************************************ */

	app.controller('basicInstanceController', function($rootScope, $http) {
		
		//Fetch instances : coded in saveEdit.js
		fetchData($rootScope, $http);
		
		//To show form modal to edit instance 
		$rootScope.editInstance = function(id) {
			editInstanceForm(id,$rootScope.setting.instances);
		};
		
		//Directly show confirmation prompt when deleting instance
		$rootScope.deleteInstance = function(id) {
			$("#did").val(""+id+"");
			$("#deleteInstanceModal").modal("show");
		};
		
		//To guide to basic options page
		$rootScope.setOptions = function(id) {
			if( !isLoggedIn(id))
				showLoginMsg();
			else
				window.location.assign("basicSettings.html?i="+id);
		};
		
		//To guide to mappings page
		$rootScope.setMap = function(id) {
			var isOptionsFound = false;
			var isParentDEGset = false;
			
			//--------------------------------------------------------------
			//Checking all the prerequisite things are done  
			//--------------------------------------------------------------
			
			//checking if basic options are set for instances
			$rootScope.setting.basicOptions.forEach(function(option) {
				if( option.instance == id )
				{
					isOptionsFound = true;
				}
			});
			
			//checking data element group is selected for instance mapping
			if( !jQuery.isEmptyObject( $rootScope.setting.parentSetting ) && $rootScope.setting.parentSetting.DEGcode != "" )
				isParentDEGset = true;
			
			//---------------------------------------------------------------
			
			if(isOptionsFound && isParentDEGset && isLoggedIn(id) )
			{
				window.location.assign( "setMappings.html?i=" + id );				
			}
			else if( !isLoggedIn(id) )
			{
				showLoginMsg();
			}
			else if( !isOptionsFound )
			{
				$("#alertMsg").html("Basic options are not set for this instance");
				$("#alertModal").modal("show");
			}
			else if( !isParentDEGset )
			{
				$("#alertMsg").html("Parent setting is incomplete");
				$("#alertModal").modal("show");
			}
		};
	});
	
	//to check whether an instance is available
	function isLoggedIn(insId)
	{
		var isLoggedIn = false;
		
		logins.forEach(function(lgin) {
			var loginInfo = JSON.parse(lgin);
			if( loginInfo.ins == insId && loginInfo.isAvailable == "true" )
				isLoggedIn = true;
		});
		return isLoggedIn;
	}
	
	//to show log in message
	function showLoginMsg()
	{				
		$("#alertMsg").html("This server is currently unavailable. Make sure that the URL and the credentials of this server are correct. If not, edit them and try again.");
		$("#alertModal").modal("show");		
	}
	
	/* ************************************************************************************
	***************************************************************************************
		ADD INSTANCE CONTROLLER - AND OTHER NEEDED FUNCTIONS
	***************************************************************************************
	************************************************************************************ */
	
	app.controller('addInstanceController', function($rootScope, $scope, $http) {
		var instanceData = {
			id: "default",
			name: "default",
			url: "default",
			uname: "default",
			pword: "default"
		};

		$scope.alertMsg = "All fields are required";
		
		$scope.addInstance = function() {
			//validateAddForm() is coded in validations.js
			if(validateAddForm())
			{
				instanceData = $scope.newInstance;
				
				//cloning the original object to make changes in the id
				var clonedObject = jQuery.extend({}, instanceData);
				clonedObject.id = getMaxId($rootScope.setting.instances);
				
				$rootScope.setting.instances.push( clonedObject );
				$(".form-control").val("");
				
				//save things to database : coded in saveAndFetch.js
				saveChanges($rootScope, $http);
			}
		};
	});
	
	//to get a unique number for instance id
	function getMaxId( instanceList ) 
	{
		var maxId = 1;
		instanceList.forEach(function(instance) {
			if(maxId < instance.id)
				maxId = instance.id
		});
		
		return ( parseInt(maxId) + 1 );
	}
	
	/* ************************************************************************************
	***************************************************************************************
		EDIT INSTANCE CONTROLLER - AND SOME NEEDED FUNCTIONS
	***************************************************************************************
	************************************************************************************ */	

	app.controller('editInstanceController', function($scope,$rootScope,$http) {
		$scope.editInstance = function() {
			//validateEditForm() is coded in validations.js
			if(validateEditForm())
			{
				overwriteEditedInstance( $rootScope );
				$(".form-control").val("");
				
				//Saving changes : coded in saveAndFetch.js
				saveChanges($rootScope, $http);
			}
		};
	});
	
	//Show form modal to edit instance
	function editInstanceForm( id, instanceList )
	{
		console.log(instanceList);
		$('#editInstanceModal').modal('show');
		
		instanceList.forEach(function(instance) {
			if( instance.id == id )
			{
				$("#eid").val(""+instance.id+"");
				$("#ename").val(""+instance.name+"");
				$("#eurl").val(""+instance.url+"");
				$("#euname").val(""+instance.uname+"");
				$("#epword").val(""+instance.pword+"");
			}
		});
	}
	
	//Overwrite the properties of edited instance with new properties
	function overwriteEditedInstance($rootScope)
	{
		$rootScope.setting.instances.forEach(function(instance) {
			if( instance.id == $("#eid").val() )
			{
				instance.name = $("#ename").val();
				instance.url = $("#eurl").val();
				instance.uname = $("#euname").val();
				instance.pword = $("#epword").val();
			}
		});
	}
	
	/* ************************************************************************************
	***************************************************************************************
		DELETE INSTANCE CONTROLLER - AND SOME NEEDED FUNCTIONS
	***************************************************************************************
	************************************************************************************ */	
	
	app.controller('deleteInstanceController', function($scope,$rootScope,$http) {
		$scope.deleteInstance = function() {
			
			var deletedInstanceIndex = -1;
			var deletedMappingDataIndex = -1;
			var deletedOptionsIndex = -1;
			var isDeletedIndexFound = false;
			var isMappingDataFound = false;
			var isOptionsFound = false;
			
			//finding instance index to delete
			$rootScope.setting.instances.forEach(function(instance,index) {
				if( instance.id == $("#did").val() )
				{
					deletedInstanceIndex = index;
					isDeletedIndexFound = true;
				}
			});
			
			//finding mapping data index to delete
			$rootScope.setting.mappings.forEach(function(mapping,index) {
				if( mapping.instance == $("#did").val() )
				{
					deletedMappingDataIndex = index;
					isMappingDataFound = true;
				}
			});
			
			//finding options index to delete
			$rootScope.setting.basicOptions.forEach(function(option,index) {
				if( option.instance == $("#did").val() )
				{
					deletedOptionsIndex = index;
					isOptionsFound = true;
				}
			});
			
			//deleting
			if(isDeletedIndexFound)
				$rootScope.setting.instances.splice( deletedInstanceIndex , 1 );
			
			if(isMappingDataFound)
				$rootScope.setting.mappings.splice( deletedMappingDataIndex , 1 );
			
			if(isOptionsFound)
				$rootScope.setting.basicOptions.splice( deletedOptionsIndex , 1 );
			
			//saving updated settings : coded in saveAndFetch.js
			saveChanges($rootScope, $http);
		};
	});