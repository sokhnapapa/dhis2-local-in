/**
	Functions for validating the settings.
		- checks whether mappings are correct
		- checks whether mapped DEs are available in instances
		- checks whether orgUnits are available under stated levels
**/
	
	var nationalDElists = [];
	var instanceDElists = [];
	
	//gathers all DES from national and child instances
	function validateMapping( ins, $rootScope, $http )
	{
		var natUrl = "../../dataElements.jsonp?fields=id,name,shortName,categoryCombo[categoryOptionCombos[id,name]]&paging=false&callback=JSON_CALLBACK";
		var insUrl = instanceUrl($rootScope.setting.instances, ins)+"/api/dataElements.jsonp?fields=id,name,shortName,categoryCombo[categoryOptionCombos[id,name]]&paging=false&callback=JSON_CALLBACK";
		var insInUrl = instanceUrl($rootScope.setting.instances, ins)+"/api/indicators.jsonp?fields=id,name,shortName&paging=false&callback=JSON_CALLBACK";
		
		//populating national DES
		var natPromise = $http.jsonp( natUrl )
			.then(function (nde) {
				nationalDElists = nde.data.dataElements;
				console.log(nde.data);
				examineConflicts($rootScope, ins);
			});
			
		//populating instance DES
		var insPromise = natPromise.then($http.jsonp( insUrl )
			.then(function (ide) {
				instanceDElists = ide.data.dataElements;			
			}));
			
		//populating instance indicators
		insPromise.then($http.jsonp( insInUrl )
			.then(function (iin) {
				iin.data.indicators.forEach(function(ind) {
					instanceDElists.push(ind);	
				});
				//examineConflicts($rootScope, ins);
			}));
	}
	
	// checks whether anything has conflicts
	function examineConflicts($rootScope, ins)
	{
		console.log(nationalDElists);
		console.log(instanceDElists);
		var hasConflicts = false;
		
		$rootScope.setting.mappings.forEach(function(mapping) {
			//selecting instance map data
			if( mapping.instance == ins )
			{
				mapping.mapData.forEach(function(mData){
					
					/** *************************************** **/
					/** VALIDATING MAPPED NATIONAL DEs AND COCs **/
					/** *************************************** **/
					
					//checking if the mapped DE is present in national DE list
					nationalDElists.forEach(function(nd){
						
						var isNDEfound = false;
						var isNCOCfound = false;
						
						if( mData.nationalDE == nd.id )
						{
							isNDEfound = true;
							
							//checking if mapped coc is found in respective DE's COC ( given COC is not empty )
							if( mData.nationalCOC != "none" )
							{
								nd.categoryCombo.categoryOptionCombos.forEach(function(nc){
									if( mData.nationalCOC == nc.id )
									{
										isNCOCfound = true;
										//break;
									}
								});
							}
							else
							{
								isNCOCfound = true;
							}
						}
						
						if( !isNDEfound || !isNCOCfound )
							hasConflicts = true;
					});
					
					/** *************************************** **/
					/** VALIDATING MAPPED INSTANCE DEs AND COCs **/
					/** *************************************** **/
					
					//checking if the mapped DE is present in instance DE list
					instanceDElists.forEach(function(ind){
						
						var isIDEfound = false;
						var isICOCfound = false;
						
						if( mData.instanceDE == ind.id )
						{
							isIDEfound = true;
							
							//checking if mapped coc is found in respective DE's COC ( given COC is not empty )
							if( mData.instanceCOC != "none" )
							{
								ind.categoryCombo.categoryOptionCombos.forEach(function(ic){
									if( mData.instanceCOC == ic.id )
									{
										isICOCfound = true;
										//break;
									}
								});
							}
							else
							{
								isICOCfound = true;
							}
						}
						
						if( !isIDEfound || !isICOCfound )
							hasConflicts = true;
					});
					
				});
			
				//break;
			}
		});
		
		console.log(hasConflicts);
		return hasConflicts;
	}
	
	//for getting instance url from its id
	function instanceUrl(instanceList, currentInstanceId) 
	{
		var url = "";
		instanceList.forEach(function(instance) {
			if(instance.id == currentInstanceId)
				url = instance.url;
		});
		
		return url+"/";
	}