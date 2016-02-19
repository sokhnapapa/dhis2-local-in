	// To fetch data sync setting json
	function fetchData( $rootScope, $http )
	{
		$rootScope.setting =  JSON.parse('{ "instances" : [] , "parentSetting" : {}, "mappings" : [] , "basicOptions" : [] }');
		
		var promise = $http.get(apiUrl).then(function (response) {
				if(!response.data == "")
				{
					$rootScope.setting = JSON.parse(response.data.value);
					logInToAllInstance( $rootScope, $http ); //coded in login.js
				}				
		});
	}
	
	// To save data sync setting json
	function saveChanges($rootScope, $http)
	{
		var configurationJson = JSON.stringify( $rootScope.setting );
		
		$http.post( apiUrl, { value: configurationJson }, {headers: {'Content-Type': 'text/plain;charset=utf-8'}}).then(function (response) {
			fetchData($rootScope, $http);
			window.location.assign("index.html");
		});
	}
