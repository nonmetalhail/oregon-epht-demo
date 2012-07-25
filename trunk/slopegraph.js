/**
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * @fileoverview 
 * d3.js visualization drwaing Slopegraphs
 * uses Fusion Tables as the database
 * 
 * @author nahman@google.com (Elliot Nahman)
 *
 * d3 Slopegraph code adapted from:
 * Hamilton Ulmer
 * http://skedasis.com/d3/slopegraph/
 * https://github.com/hamilton/slopegraphs
 *
 */


var WIDTH = 500;
var HEIGHT = 850;

var LEFT_MARGIN = 150;
var RIGHT_MARGIN = 150;
var TOP_MARGIN = 50;
var BOTTOM_MARGIN = 50;

var ELIGIBLE_SIZE = HEIGHT - TOP_MARGIN - BOTTOM_MARGIN;

var g = new slopeGraphBuilder();

var epht = {};

$(document).ready(function(){
  var DataSet = function (){
    this.data = {}
  };

  DataSet.prototype.name = '';
  DataSet.prototype.set = '';
  DataSet.prototype.year = '';
  DataSet.prototype.tid = '';

  DataSet.prototype.set_name = function(name){
    this.name = name;
  };
  DataSet.prototype.set_set = function(set){
    this.set = set;
  };
  DataSet.prototype.set_year = function(year){
    this.year = year;
  };
  DataSet.prototype.set_tid = function(tid){
    this.tid = tid;
  };

  epht.data1 = new DataSet();
  epht.data2 = new DataSet();

  epht.data1.set_set($('#data_set1 option:selected').attr('value'));
  epht.data2.set_set($('#data_set2 option:selected').attr('value'));
  epht.data1.set_year($('#year1 option:selected').attr('value'));
  epht.data2.set_year($('#year2 option:selected').attr('value'));
  epht.data1.set_name('left');
  epht.data1.set_tid('1tzCz8LpvWJU_73zfNnUGOC7Z1MveXTsyQajqdKo');
  epht.data2.set_name('right');
  epht.data2.set_tid('1DM18V3sby3TPRp6WQF889D4aRnoVUCy7QbKEO1o');

  // functions with arguments in the done get called immediately; 
  // would have to do: .done(g.createVis) and restructure so 
  // data1 and data2 are the returns of the when fucntions
  // wrapping in anon function allieviates this, though looks funky
  $.when(getFTData(epht.data1),getFTData(epht.data2))
    .done(function(){
      g.createVis(epht.data1.set,epht.data2.set,epht.data1.data,epht.data2.data)
    });

  DataSet.prototype.update_data = function(){
    $.when(getFTData(this))
      .done(function(){
        g.updateVis(epht.data1.set,epht.data2.set,epht.data1.data,epht.data2.data)
      });
  }

  $('#data_set1').live('change',function(){
    epht.data1.set_set(this.value);
    // update_data(epht.data1);
    epht.data1.update_data();
  });
  $('#data_set2').live('change',function(){
    epht.data2.set_set(this.value);
    // update_data(epht.data2);
    epht.data2.update_data();
  });

  $('#year1').live('change',function(){
    epht.data1.set_year(this.value);
    // update_data(epht.data1);
    epht.data1.update_data();
  });
  $('#year2').live('change',function(){
    epht.data2.set_year(this.value);
    // update_data(epht.data2);
    epht.data2.update_data();
  });
});

function getFTData(obj){
  var d = $.Deferred();
  var url = 'https://www.googleapis.com/fusiontables/v1/query?sql=';
  /*
  * query for data in the form of:
  * geography, rate, year
  *   county1, x,  2000
  *   county2, x,  2000
  *   county1, x,  2001
  *   county2, x,  2001
  */
  var query = "SELECT col1,col0 FROM " + obj.tid + " WHERE 'Year'='"+ obj.year+"'"
  /*
  * query for data in the form of:
  * geography, year1, year2, ...
  *   county1, x1,  x2
  *   county2, x1,  x2
  */
  // var query = "SELECT 'Geography',"+obj.year+" FROM " + obj.tid + "'"

  var encodedQuery = encodeURIComponent(query);
  var tail = '&key=AIzaSyA7_yvmF6Aj0z9ctqiVVS5BI9cVIqx7F1w';
  $.getJSON(url+encodedQuery+tail,function(resp){
    console.log(url+encodedQuery+tail);
    console.log(resp);
    obj.data = resp;
  })
  .done(function(p){
    d.resolve(p);
  })
  .fail(d.reject);

  return d.promise();
}

function slopeGraphBuilder(){
/**
 *  reformats and returns data into a datatable:
 *  [
 *    {
 *      lable: text_name for both,
 *      left: value for left side,
 *      right: value for right side,
 *      left_coord: calculated y-position
 *      right_coord: calculated y-position
 *    }
 *  ]
**/
  _to_data = function (y1,y2,d1,d2){
    var y1d = d1["rows"];
    var y2d = d2["rows"];
    var _d = {};
    // takes first dataset and creates the table
    for (var k1 in y1d) {
      _d[y1d[k1][0]] = {};
      _d[y1d[k1][0]]['left'] = y1d[k1][1];
      _d[y1d[k1][0]]['right'] = 0;
      _d[y1d[k1][0]]['label'] = y1d[k1][0];
    }
    // takes second dataset and appends the table
    for (var k2 in y2d) {
      if (!_d.hasOwnProperty(y2d[k2][0])) {
        _d[y2d[k2][0]] = {};
        _d[y2d[k2][0]].left = 0;
        _d[y2d[k2][0]]['label'] = y2d[k2][0];
      }
      _d[y2d[k2][0]].right = y2d[k2][1];
      if (_d[y2d[k2][0]].right === NaN) {
        _d[y2d[k2][0]].right = 0;
      }
    }
    // top lables
    Y1 = y1;
    Y2 = y2;

    //converts _d from object of object to array of object
    dt = [];
    var di;
    for (var k in _d){
      di = _d[k];
      dt.push(di)
    }
    console.log(dt);
    return dt;
  }

  // Calculates range and y-vals for the datatable
  calcRange = function(data){
    function y(d,i){
      return HEIGHT - _y(d)
    }

    var _y = d3.scale.linear()
          .domain([_min_key(data), _max_key(data)])
          .range([TOP_MARGIN, HEIGHT-BOTTOM_MARGIN])

    for (var i = 0; i < data.length; i += 1){
      data[i].left_coord = y(data[i].left);
      data[i].right_coord = y(data[i].right);
    }
  }

  //helper functions for calc ranges
  _max_key = function(v){
    var vi, max_side;
    var _m = undefined;
    for (var i = 0; i < v.length; i += 1){
      vi = v[i];
      max_side = Math.max(vi.left, vi.right)
      if (_m == undefined || max_side > _m) {
        _m = max_side;
      }
    }
    return _m;
  },

  _min_key = function(v){
    var vi, min_side;
    var _m = undefined;
    for (var i = 0; i < v.length; i += 1){
      vi = v[i];
      min_side = Math.min(vi.left, vi.right)
      if (_m == undefined || min_side < _m) {
        _m = min_side;
      }
    }
    return _m;
  }

  _min_max = function(v){
    var vi, min_side, max_side;
    var _max = undefined;
    var _min = undefined;

    for (var i = 0; i < v.length; i += 1){
      vi = v[i];
      min_side = Math.min(vi.left_coord, vi.right_coord);
      max_side = Math.max(vi.left_coord, vi.right_coord);

      if (_min == undefined || min_side < _min) {
        _min = min_side;
      }
      if (_max == undefined || max_side > _max) {
        _max = max_side;
      }
    }
    return [_min, _max];
  };

  _slopegraph_preprocess = function(d){
    // computes y coords for each data point
    // create two separate object arrays for each side, then order them together, and THEN run the shifting alg.
    var offset;

    var font_size = 15;
    var l = d.length;

    var max = _max_key(d);
    var min = _min_key(d);
    var range = max-min;

    //
    var left = [];
    var right = [];
    var di
    for (var i = 0; i < d.length; i += 1) {
      di = d[i];
      left.push({label:di.label, value:di.left, side:'left', coord:di.left_coord})
      right.push({label:di.label, value:di.right, side:'right', coord: di.right_coord})
    }

    var both = left.concat(right)
    both.sort(function(a,b){
      if (a.value > b.value){
        return 1
      } else if (a.value < b.value) {
        return -1
      } else { 
        if (a.label > b.label) {
          return 1
        } else if (a.lable < b.label) {
          return -1
        } else {
          return 0
        }
      }
    }).reverse()
    var new_data = {};
    var side, label, val, coord;
    for (var i = 0; i < both.length; i += 1) {

      label = both[i].label;
      side = both[i].side;
      val = both[i].value;
      coord = both[i].coord;

      if (!new_data.hasOwnProperty(both[i].label)) {
        new_data[label] = {}
      }
      new_data[label][side] = val;

      if (i > 0) {
        if (coord - font_size < both[i-1].coord || 
          !(val === both[i-1].value && side != both[i-1].side)) {
                  
          new_data[label][side + '_coord'] = coord + font_size;

          for (j = i; j < both.length; j += 1) {
            both[j].coord = both[j].coord + font_size;
          }
        } else {
          new_data[label][side + '_coord'] = coord;
        }

        if (val === both[i-1].value && side !== both[i-1].side) {
          new_data[label][side + '_coord'] = both[i-1].coord;
        }
      } 
      else {
        new_data[label][side + '_coord'] = coord;
      }

    }
    d = [];

    for (var label in new_data){  
      val = new_data[label];
      val.label = label;
      d.push(val)
    }

    return d;
  };

  this.formatData = function(y1,y2,dTable1,dTable2){
    var data = _to_data('male','female', dTable1,dTable2);
    calcRange(data);

    data = _slopegraph_preprocess(data);
    return data;
  }

  this.createVis = function(y1,y2,dTable1,dTable2){
    console.log(dTable1);
    data = this.formatData(y1,y2,dTable1,dTable2);

    // var min, max;
    var _ = _min_max(data)
    this.min = _[0];
    this.max = _[1];

    var sg = d3.select('#slopegraph')
      .append('svg:svg')
      .attr('width', WIDTH)
      .attr('height', HEIGHT);

    //this element keeps getting replicated
    // tried to generalize it but was having problems with
    // parent-child heirarchy. 
    // abandoning making this adapted code perfect 
    // in place of finishing!
    _y = d3.scale.linear()
      .domain([this.max, this.min])
      .range([TOP_MARGIN, HEIGHT-BOTTOM_MARGIN])

    y = function(d,i){
      return HEIGHT - _y(d)
    }

    this.y1t = sg.append('svg:text')
      .attr('x', LEFT_MARGIN)
      .attr('y', TOP_MARGIN/2)
      .attr('text-anchor', 'end')
      .attr('opacity', .5)
      .text(Y1);

    //
    this.y2t = sg.append('svg:text')
      .attr('x', WIDTH-RIGHT_MARGIN)
      .attr('y', TOP_MARGIN/2)
      .attr('opacity', .5)
      .text(Y2);

    sg.append('svg:line')
      .attr('x1', LEFT_MARGIN/2)
      .attr('x2', WIDTH-RIGHT_MARGIN/2)
      .attr('y1', TOP_MARGIN*2/3)
      .attr('y2', TOP_MARGIN*2/3)
      .attr('stroke', 'black')
      .attr('opacity', .5);

    this.title = sg.append('svg:text')
      .attr('x', WIDTH/2)
      .attr('y', TOP_MARGIN/2)
      .attr('text-anchor', 'middle')
      .text('Asthma Rates in Oregon')
      .attr('font-variant', 'small-caps');


    this.ll = sg.selectAll('.left_labels')
      .data(data).enter().append('svg:text')
        .attr('x', LEFT_MARGIN-35)
        .attr('y', function(d,i){
          return y(d.left_coord)
        })
        .attr('dy', '.35em')
        .attr('font-size', 10)
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'end')
        .text(function(d,i){ return d.label.toUpperCase()})
        .attr('fill', 'black')
        .attr("class",function(d){return d.label})
        .on("mouseover", function(d){return d3.selectAll('.'+d.label).classed("over",true);})
        .on("mouseout", function(d){return d3.selectAll('.'+d.label).classed("over",false);});

    this.lv = sg.selectAll('.left_values')
      .data(data).enter().append('svg:text')
        .attr('x', LEFT_MARGIN-10)
        .attr('y', function(d,i){
          return y(d.left_coord)
        })
        .attr('dy', '.35em')
        .attr('font-size', 10)
        .attr('text-anchor', 'end')
        .text(function(d,i){ return d.left})
        .attr('fill', 'black')
        .attr("class",function(d){return d.label})
        .on("mouseover", function(d){return d3.selectAll('.'+d.label).classed("over",true);})
        .on("mouseout", function(d){return d3.selectAll('.'+d.label).classed("over",false);});

    this.rl = sg.selectAll('.right_labels')
      .data(data).enter().append('svg:text')
        .attr('x', WIDTH-RIGHT_MARGIN)
        .attr('y', function(d,i){
          return y(d.right_coord)
        })
        .attr('dy', '.35em')
        .attr('dx', 35)
        .attr('font-weight', 'bold')
        .attr('font-size', 10)
        .text(function(d,i){ return d.label.toUpperCase()})
        .attr('fill', 'black')
        .attr("class",function(d){return d.label})
        .on("mouseover", function(d){return d3.selectAll('.'+d.label).classed("over",true);})
        .on("mouseout", function(d){return d3.selectAll('.'+d.label).classed("over",false);});

    //
    this.rv = sg.selectAll('.right_values')
      .data(data).enter().append('svg:text')
        .attr('x', WIDTH-RIGHT_MARGIN)
        .attr('y', function(d,i){
          return y(d.right_coord)
        })
        .attr('dy', '.35em')
        .attr('dx', 10)
        .attr('font-size', 10)
        .text(function(d,i){ return d.right})
        .attr('fill', 'black')
        .attr("class",function(d){return d.label})
        .on("mouseover", function(d){return d3.selectAll('.'+d.label).classed("over",true);})
        .on("mouseout", function(d){return d3.selectAll('.'+d.label).classed("over",false);});

    this.slopes = sg.selectAll('.slopes')
      .data(data).enter().append('svg:line')
        .attr('x1', LEFT_MARGIN)
        .attr('x2', WIDTH-RIGHT_MARGIN)
        .attr('y1', function(d,i){
          return y(d.left_coord)
        })
        .attr('y2', function(d,i){
          return y(d.right_coord)
        })
        .attr('opacity', .6)
        .attr('stroke', 'black')
        .attr("class",function(d){return d.label})
        .on("mouseover", function(d){return d3.selectAll('.'+d.label).classed("over",true);})
        .on("mouseout", function(d){return d3.selectAll('.'+d.label).classed("over",false);});

    // sg.selectAll('text')
      
  }

  this.updateVis = function(y1,y2,dTable1,dTable2){
    data = this.formatData(y1,y2,dTable1,dTable2);

    _y = d3.scale.linear()
      .domain([this.max, this.min])
      .range([TOP_MARGIN, HEIGHT-BOTTOM_MARGIN])

    function y(d,i){
      return HEIGHT - _y(d)
    }

    this.ll
      .data(data)
      .text(function(d,i){ return d.label})
      .transition()
      .duration(300)
      .ease('quad')
      .attr('y', function(d,i){
          return y(d.left_coord)
        })
      .attr("class",function(d){return d.label});

    this.lv
    .data(data)
    .text(function(d,i){ return d.left})
      .transition()
      .duration(300)
      .ease('quad')
      .attr('y', function(d,i){
          return y(d.left_coord)
        })
      .attr("class",function(d){return d.label});

    this.rl
      .data(data)
      .text(function(d,i){ return d.label})
      .transition()
      .duration(300)
      .ease('quad')
      .attr('y', function(d,i){
          return y(d.right_coord)
        })
      .attr("class",function(d){return d.label});

    this.rv
    .data(data)
    .text(function(d,i){ return d.right})
      .transition()
      .duration(300)
      .ease('quad')
      .attr('y', function(d,i){
          return y(d.right_coord)
        })
      .attr("class",function(d){return d.label});

    this.slopes
      .data(data)
      .transition()
      .duration(300)
      .ease('quad')
      .attr('y1', function(d,i){
        return y(d.left_coord)
      })
      .transition()
      .duration(300)
      .ease('quad')
      .attr('y2', function(d,i){
        return y(d.right_coord)
      })
      .attr("class",function(d){return d.label});
  }

  // changed to css class
  // _displayRedFill = function(){
  //   d3.select(this)
  //     .attr('fill', '#bb2629')
  // }
  // _displayBlackFill = function(){
  //   d3.select(this)
  //     .attr('fill', 'black')
  // }
  //   _displayRedStroke = function(){
  //   d3.select(this)
  //     .attr('stroke', '#bb2629');
  // }
  // _displayBlackStroke = function(){
  //   d3.select(this)
  //     .attr('stroke', 'black');
  // }
}