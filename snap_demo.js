// this var will need to be updated user to user
var json_file_location = 'json/snap.json';

// datastructure where the json will get loaded
var data_sets = {};
/* this is to create the bar chart; 
   once chart configuration is implemented in FT, then you dont 
   need this. Instead, put embedd links into the json file.
*/
var chartConfig = function(tid,year){
  return "https://www.google.com/fusiontables/embedviz?&containerId=gviz_canvas&viz=GVIZ&q=select%20'COUNTY'%2C%20'"+year+"'%20from%20"+tid+"%20where%20'COUNTY'%20NOT%20EQUAL%20TO%20'STATE%20TOTAL'%20order%20by%20'"+year+"'%20DESC%20limit%20100&t=BAR&gco_width=500&gco_height=400&gco_chartArea=%7B%22height%22%3A%22350%22%2C%22top%22%3A%2220%22%7D&gco_hAxis=%7B%22viewWindowMode%22%3A%22pretty%22%2C%22viewWindow%22%3A%7B%7D%2C%22useFormatFromData%22%3Atrue%2C%22format%22%3A%22%22%7D&gco_vAxis=%7B%22format%22%3A%22%22%7D&gco_vAxes=%5B%7B%22title%22%3Anull%2C%22minValue%22%3Anull%2C%22maxValue%22%3Anull%2C%22viewWindowMode%22%3A%22pretty%22%2C%22viewWindow%22%3A%7B%22max%22%3Anull%2C%22min%22%3Anull%7D%2C%22useFormatFromData%22%3Atrue%2C%22textStyle%22%3A%7B%22color%22%3A%22%23222%22%2C%22fontSize%22%3A%2208%22%7D%7D%2C%7B%22viewWindowMode%22%3A%22pretty%22%2C%22viewWindow%22%3A%7B%7D%2C%22useFormatFromData%22%3Atrue%7D%5D&gco_curveType=&gco_animation=%7B%22duration%22%3A500%7D&gco_booleanRole=certainty&gco_lineWidth=2&gco_series=%7B%220%22%3A%7B%22hasAnnotations%22%3Atrue%7D%7D&gco_legend=inside&gco_strictFirstColumnType=false"
}

$(document).ready(function(){
  // loads the json file; when done, loads the datasets into the select menu
  $.when(getFTLinks()).done(function(){
    for(var item in data_sets){
      $('#disease_sets').append('<option value = "'+
          item+'">'+item+'</option>');
    }
    // set up a listener on the disease select menu
    $('#disease_sets').live('change',function(){
      // load the sub-sets
      $('#data_sets').children().remove();
      for(var item in data_sets[this.value]){
        $('#data_sets').append('<option value = "'+
          item+'">'+item+'</option>');
      }
      
      var tempYears = data_sets[this.value][$('#data_sets').attr('value')]['years'];
      $('#years').children().remove();
      var yearSort = [];
      for(var year in tempYears){
        yearSort.push(year);
      }
      yearSort.sort().reverse();
      for(var i in yearSort){
        $('#years').append('<option value = "'+
          yearSort[i]+'">'+yearSort[i]+'</option>');
      }
      $('#years option[value="'+yearSort[0]+'"]').trigger('change');
    });
    // add listener to sub-sets
    $('#data_sets').live('change',function(){
      updateCharts();
    });
    // add listener to years
    $('#years').live('change',function(){
      updateCharts();
    });
    // trigger to load an initial set
    $('#disease_sets').trigger('change');
  });
});

// function to load the json file
function getFTLinks(){
  var d = $.Deferred();
  $.getJSON(json_file_location,function(resp){
    data_sets = resp;
  }).done(function(p){
    d.resolve(p);
  }).fail(d.reject);

  return d.promise();
}

// function to update the charts on change
function updateCharts(){
  var disease = $('#disease_sets option:selected').attr('value');
  var dataset = $('#data_sets option:selected').attr('value');
  var year = $('#years option:selected').attr('value');

  var data = data_sets[disease][dataset];
  // console.log(disease);
  // console.log(dataset);
  // console.log(data);
  $('#map').attr('src',data['years'][year]['map']);
  // use when chart embedds are in json
  // $('#graph').attr('src',data['years'][year]['chart']);
  var column = encodeURIComponent(data['years'][year]['chart']);
  $('#graph').attr('src',chartConfig(data['tid'],column));
  $('#table').attr('src',data['table']);
  $('#title').text(data['title']);
  $('#explore').attr('href','https://www.google.com/fusiontables/data?docid='+data['tid']);
}
