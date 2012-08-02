var json_file_location = 'json/epht.json'

var data_sets = {};

var chartConfig = function(tid,year){
  return "https://www.google.com/fusiontables/embedviz?&containerId=gviz_canvas&viz=GVIZ&q=select%20'Geography'%2C%20'"+year+"'%20from%20"+tid+"%20order%20by%20'"+year+"'%20DESC%20limit%20100&t=BAR&gco_width=500&gco_height=400&gco_chartArea=%7B%22height%22%3A%22350%22%2C%22top%22%3A%2220%22%7D&gco_hAxis=%7B%22viewWindowMode%22%3A%22pretty%22%2C%22viewWindow%22%3A%7B%7D%2C%22useFormatFromData%22%3Atrue%2C%22format%22%3A%22%22%7D&gco_vAxis=%7B%22format%22%3A%22%22%7D&gco_vAxes=%5B%7B%22title%22%3Anull%2C%22minValue%22%3Anull%2C%22maxValue%22%3Anull%2C%22viewWindowMode%22%3A%22pretty%22%2C%22viewWindow%22%3A%7B%22max%22%3Anull%2C%22min%22%3Anull%7D%2C%22useFormatFromData%22%3Atrue%2C%22textStyle%22%3A%7B%22color%22%3A%22%23222%22%2C%22fontSize%22%3A%2208%22%7D%7D%2C%7B%22viewWindowMode%22%3A%22pretty%22%2C%22viewWindow%22%3A%7B%7D%2C%22useFormatFromData%22%3Atrue%7D%5D&gco_curveType=&gco_animation=%7B%22duration%22%3A500%7D&gco_booleanRole=certainty&gco_lineWidth=2&gco_series=%7B%220%22%3A%7B%22hasAnnotations%22%3Atrue%7D%7D&gco_legend=inside&gco_strictFirstColumnType=false"
}

$(document).ready(function(){
  $.when(getFTLinks()).done(function(){
    console.log(data_sets)
    for(var item in data_sets){
      $('#disease_sets').append('<option value = "'+
          item+'">'+item+'</option>');
    }

    $('#disease_sets').live('change',function(){
      $('#data_sets').children().remove();
      for(var item in data_sets[this.value]){
        $('#data_sets').append('<option value = "'+
          item+'">'+item+'</option>');
      }
      // $('#data_sets option[value="All"]').trigger('change');
      
      getYears(this);
      
      // var tempYears = data_sets[this.value][$('#data_sets').attr('value')]['years'];
      // $('#years').children().remove();
      // for(var i in tempYears){
      //   $('#years').append('<option value = "'+
      //     tempYears[i]+'">'+tempYears[i]+'</option>');
      // }
      // $('#years option[value="2006"]').trigger('change');
    });

    $('#data_sets').live('change',function(){
      updateCharts();
    });

    $('#years').live('change',function(){
      updateCharts();
    });

    $('#disease_sets').trigger('change');
  });
});

function getFTLinks(){
  var d = $.Deferred();
  $.getJSON(json_file_location,function(resp){
    data_sets = resp;
  }).done(function(p){
    d.resolve(p);
  }).fail(d.reject);

  return d.promise();
}

function getYears(self){
  var FTURL = 'https://www.googleapis.com/fusiontables/v1/tables/';
  var tid = data_sets[self.value][$('#data_sets').attr('value')]['tid'];
  var key = '?key=AIzaSyA7_yvmF6Aj0z9ctqiVVS5BI9cVIqx7F1w';
  $.getJSON(FTURL+tid+key,function(resp){
    var tempYears = [];
    for(var i in resp['column']){
      if(resp['column'][i]["type"]=="NUMBER"){
        tempYears.push(resp['column'][i]["name"]);
      }
      else{
        console.log("rejected col: " + resp['column'][i]["name"]);
      }
    } 
    tempYears.sort().reverse();
    $('#years').children().remove();
    for(var i in tempYears){
      $('#years').append('<option value = "'+
        tempYears[i]+'">'+tempYears[i]+'</option>');
    }
    $('#years option[value="'+tempYears[0]+'"]').trigger('change');
  });
}

function updateCharts(){
  var disease = $('#disease_sets option:selected').attr('value');
  var dataset = $('#data_sets option:selected').attr('value');
  var year = $('#years option:selected').attr('value');

  var data = data_sets[disease][dataset];
  console.log(disease);
  console.log(dataset);
  console.log(data);
  $('#map').attr('src',data['map']);
  $('#graph').attr('src',chartConfig(data['tid'],year));
  $('#table').attr('src',data['table']);
  $('#title').text(data['title']);
  $('#explore').attr('href','https://www.google.com/fusiontables/data?docid='+data['tid']);
}
