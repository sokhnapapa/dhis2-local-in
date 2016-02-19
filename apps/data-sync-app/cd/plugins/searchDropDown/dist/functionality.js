function escape(string) {
                return string ? String(string).replace(/[&<>"']/g, function(match) {
                    return {
                        '&': '&amp;',
                        '<': '&lt;',
                        '>': '&gt;',
                        '"': '&quot;',
                        "'": '&#39;'
                    }[match];
                }) : '';
            }

            $(document).ready(function() {

                var transformText = $.fn.selectivity.transformText;

                // example query function that returns at most 10 cities matching the given text
                function queryFunction(query) {
                    var selectivity = query.selectivity;
                    var term = query.term;
                    var offset = query.offset || 0;
                    var results;
                    
					results = cities.filter(function(city) {
						return transformText(city).indexOf(transformText(term)) > -1;
					});
					
                    results.sort(function(a, b) {
                        a = transformText(a);
                        b = transformText(b);
                        var startA = (a.slice(0, term.length) === term),
                            startB = (b.slice(0, term.length) === term);
                        if (startA) {
                            return (startB ? (a > b ? 1 : -1) : -1);
                        } else {
                            return (startB ? 1 : (a > b ? 1 : -1));
                        }
                    });
                    setTimeout(function() {
                        query.callback({
                            more: results.length > offset + 10,
                            results: results.slice(offset, offset + 10)
                        });
                    }, 500);
                }

                $('#single-input').selectivity({
                    allowClear: true,
                    placeholder: 'No city selected',
                    query: queryFunction,
                    searchInputPlaceholder: 'Type to search a city'
                });



                $('.selectivity-input').selectivity();

              
            });