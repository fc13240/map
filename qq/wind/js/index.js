!function(){
	loadWind();
	require.config({
		// packages: [
  //           {
  //               name: 'zrender',
  //               location: '../../../git_project/zrender/src',
  //               main: 'zrender'
  //           }
  //       ],
        paths: {
            echarts: './js/echarts'
        }
    });
    var $chart_container = $('#chart_container');
    function clearData(){
    	current_map_point = null;
    	$air_legend.removeData('flag');
        $wind_chart.removeData('flag');
    }
    var $btn_close = $('.btn_close').click(function(){
    	$chart_container.hide();
    	clearData();
    });
    $('#btn_back').click(function(){
    	$chart_container.removeClass('show_air');
    });
    var $nav_h3 = $('.nav h3').click(function(){
        var $this = $(this);
        $module_move.css('margin-left', $this.is('.second')?'-100%': 0);
        $nav_h3.removeClass('on');
        $this.addClass('on');
    });
    var $wind_air = $('.air');
    var DESC_AIR = [
        ['好','rgb(0, 255, 0)','非常有利于空气污染物稀释、扩散和清除','icon_1'],
        ['较好','rgb(150, 230, 0)','较有利于空气污染物稀释、扩散和清除','icon_2'],
        ['一般','rgb(255, 255,0)','对空气污染物稀释、扩散和清除无明显影响','icon_3'],
        ['较差','rgb(255, 100, 0)','不利于空气污染物稀释、扩散和清除','icon_4'],
        ['差','rgb(255, 0, 0)','很不利于空气污染物稀释、扩散和清除','icon_5'],
        ['极差','rgb(126, 0, 35)','极不利于空气污染物稀释、扩散和清除','icon_6']
    ];
    var $module_move = $('.module_move');
    var $air_legend = $('.legend'),
        $desc_air = $('.desc_air'),
        $air_day = $('.day');
    var html_air = '';
    $.each(DESC_AIR, function(i, v){
        html_air += '<li style="background-color: '+v[1]+';color:'+(i<3?'#3d3d3d':'white')+'">'+v[0]+'</li>'
    });
    $air_legend.html(html_air+'<li class="legend_mask"></li>');

    $air_day.delegate('li', 'mouseenter', function(){
        $(this).addClass('on').siblings().removeClass('on');
        _change_icon($(this).index());
    });

    var $icon = $('.icon'),
        $legend_li = $air_legend.find('li');
    var $arrow = $('.arrow'),
        $arrowli = $air_legend.find('.arrowli');
    var ALIGN_VAL = ['left', 'center', 'right'];
    function _change_icon(index){
        var $li = $air_day.find('li').eq(index);
        var desc = $li.data('desc'),
            c = $li.data('class'),
            level = $li.data('level');

        $desc_air.text(desc).css('text-align', ALIGN_VAL[index]);
        $icon.removeClass().addClass('icon '+c);
        var $legend_on = $legend_li.removeClass('on').eq(level).addClass('on');
        $arrow.css('left', $li.position().left + $li.width()/2 - 13);
        $arrowli.css('left', $legend_on.position().left + $legend_on.width()/2 - 17);
    }
    
    function _getTime(timestamp){
        var m = /(\d{4})(\d{2})(\d{2})(\d{2})/.exec(timestamp);
        if(m){
            var date = new Date(m[1]+'-'+m[2]+'-'+m[3]+' '+m[4]+':00');
        }else{
            var date = new Date();
        }
        return date;
    }
    var $air_time = $('#air_time');
    $nav_h3.eq(1).click(function(){
        if($air_legend.data('flag')){
            $wind_chart.addClass($air_legend.data('flag'));
            return;
        }
        $wind_air.removeClass('no_data');
        $wind_air.addClass('data_loading');
        $air_time.text('');
        loadAir(current_map_point.lng, current_map_point.lat, function(data){
            $air_legend.data('flag', data? 'data': 'no_data');
            $wind_air.removeClass('data_loading');

            if(data && data['024'] && data['048'] && data['072']){
                
                var arr = [parseFloat(data['024']), parseFloat(data['048']), parseFloat(data['072'])];
                var date = _getTime(data.timestamp);
                $air_time.text(date.format()+'发布');
                function _format_num(num){
                    if(num < 10){
                        return '0'+num;
                    }
                    return num;
                }
                function _format_date(d){
                    return _format_num(d.getMonth()+1)+'-'+_format_num(d.getDate());
                }
                var arr_date = ['今天', '明天', '后天'];
                var html = '';
                $.each(arr, function(i, v){
                    var d = new Date(date.getTime());
                    d.setDate(d.getDate()+i);
                    var level_index = parseInt(data['0'+(24*(i+1))]-61);
                    var val = DESC_AIR[level_index];
                    html += '<li data-level="'+level_index+'" data-desc="'+val[2]+'" data-class="'+val[3]+'" '+(i==0?'class="on"':'')+'><b>'+arr_date[i]+'</b><span>'+_format_date(d)+'</span></li>';
                });
                $air_day.html(html);
                _change_icon(0);
            }else{
                $wind_air.addClass('no_data');
            }
        });
    });
    
    var arr_week = ['周日','周一','周二','周三','周四','周五', '周六'];
    var today = new Date().getDay();
    
    var $loading_wind = $('#loading_wind'),
    	$loading_air = $('#loading_air');
    
    var current_map_point;
    var $wind_chart = $('.wind_chart');
	require([
        'echarts',
        'echarts/chart/line'
    ], function (ec) {
    	var marker;
    	var myChart = ec.init(document.getElementById('chart'));
    	var tt;
    	function dragendOrZoomend(){
    		clearTimeout(tt);
    		tt = setTimeout(function(){
    			if(marker && $chart_container.is(':visible')){
    				var pos = marker.getPosition();
    				var pixel = map.pointToPixel(pos);
    				$chart_container.css({
		    			left: pixel.x+15,
		    			top: pixel.y-30
		    		});
    			}
    		},100);
    	}
        var initWindTT;
        function initWind(){
            $chart_container.removeClass().show();
            if($wind_chart.data('flag')){
                return $wind_chart.addClass($wind_chart.data('flag'));
            }
            $wind_chart.addClass('data_loading');
            // console.log(current_map_point.lng, current_map_point.lat, getWind(current_map_point.lng, current_map_point.lat).length());
            loadWindSpeed(current_map_point.lng, current_map_point.lat, function(data){
                var discript = data.discript;
                $('#desc').text([discript[1], discript[2], discript[3]].join());
                $wind_chart.removeClass('data_loading');
                $wind_chart.data('flag', data? 'data': 'no_data');
                if(!data){
                    $wind_chart.addClass('no_data');
                    return;
                }else{
                    $wind_chart.removeClass('no_data');
                }
                var arr_val = [],
                    arr_time = [];
                var forecast = data.forecast;
                $.each(forecast, function(i, v){console.log(v)
                    arr_time.push(i%2 == 0?_getTime(v.date).format('MM-dd hh:00'):'');
                    arr_val.push(v.speed.toFixed(1));
                });
                // var date = _getTime(data.timestamp);
                // var time = date.getTime();
                // var hour = date.getHours();
                // delete data.timestamp;
                
                // for(var i in data){
                //     arr_val.push(parseFloat(data[i].windspeed));
                //     var d = new Date(time);
                //     d.setHours(hour + parseInt(i));
                //     arr_time.push(d.format('MM-dd hh:00'));
                // }
                var val_max = Math.max.apply(Math, arr_val);
                var splitLineColor = 'rgba(255, 255, 255, 0.15)';
                var option = {
                    tooltip : {
                        trigger: 'axis',
                        backgroundColor: 'white',
                        borderRadius : 5,
                        textStyle: {
                            color: '#ed415a',
                            fontSize: 24
                        },
                        padding: [15, 20, 15, 20],
                        axisPointer: {
                            type: 'none'
                        },
                        formatter: function(params,ticket,callback){
                            var param = params[0];
                            var index = param['dataIndex'];

                            return param[1]+'风速：'+param['value']+'米/秒';
                        }
                    },
                    calculable : true,
                    xAxis : [
                        {
                            type: "category",
                            boundaryGap: !0,
                            data: arr_time,
                            axisLine: {
                                show: false,
                                lineStyle: {
                                    color: splitLineColor
                                }
                            },
                            axisTick: {
                                show: true
                            },
                            axisLabel: {
                                margin: 10,
                                interval: 1,
                                textStyle: {
                                    color: 'white',
                                    fontSize: 10,
                                    fontWeight: "lighter"
                                }
                            },
                            splitLine: {
                                show: true,
                                lineStyle: {
                                    color: splitLineColor
                                }
                            },
                            splitArea: {
                                show: !1
                            }
                        }
                    ],
                    yAxis : [
                        {
                            type: "value",
                            name: '风速(m/s)',
                            min: 0,
                            boundaryGap: false,
                            precision: 0,
                            axisLine: {
                                show: false,
                                lineStyle: {
                                    color: splitLineColor
                                }
                            },
                            axisTick: {
                                show: true
                            },
                            splitArea: {
                                show: false
                            },
                            scale: true,
                            boundaryGap: [.1, .1],
                            axisLabel: {
                                margin: 20,
                                textStyle: {
                                    color: 'white'
                                },
                                formatter: function(a){
                                    if(a){
                                        a = a.toFixed(1);
                                    }
                                    return a;
                                },
                            },
                            splitLine: {
                                onGap: true,
                                lineStyle: {
                                    color: splitLineColor
                                }
                            }
                        }
                    ],
                    grid: {
                        x: 50,
                        y: 50,
                        x2: 30,
                        y2: 70,
                        borderWidth: 1,
                        borderColor: splitLineColor
                    },
                    series : [
                        {
                            type: 'line',
                            smooth: true,
                            symbol: "circle",
                            symbolSize: 3,
                            showAllSymbol: !0,
                            data: arr_val,
                            markPoint: {
                                data: [
                                    {
                                        symbol: 'circle',
                                        symbolSize: 8,
                                        xAxis: 0,
                                        yAxis: arr_val[0],
                                        itemStyle: {
                                            normal: {
                                                color: "white",
                                                borderColor: "white",
                                                borderWidth: 5
                                            }
                                        }
                                    },
                                    {
                                        symbol: 'circle',
                                        symbolSize: 8,
                                        xAxis: arr_val.length-1,
                                        yAxis: arr_val[arr_val.length-1],
                                        itemStyle: {
                                            normal: {
                                                color: "white",
                                                borderColor: "white",
                                                borderWidth: 5
                                            }
                                        }
                                    }
                                ]
                            },
                            markLine: {
                                symbol: ['circle','circle'],
                                itemStyle: {
                                    normal: {
                                        color: "rgba(237,65,90,0.7)",
                                        borderColor: "rgba(237,65,90,0.7)",
                                        borderWidth: 4,
                                        label: {
                                            show: true,
                                            formatter: function(a, b){
                                                b = b.replace(/\s/g,'');
                                                var space = '　　';
                                                if(b == '1:1'){
                                                    return space+'微风';
                                                }else{
                                                    return space+'强风';
                                                }
                                            },
                                            textStyle: {
                                                color: 'rgba(237,65,90,0.7)',
                                                align: 'right'
                                            }
                                        },
                                        lineStyle: {
                                            color: 'rgba(237,65,90,0.7)',
                                            width: 2,
                                        }
                                    }
                                },
                                data: [
                                    [{
                                        name: '1',
                                        xAxis: 0,
                                        yAxis: 5.5,
                                    },
                                    {
                                        name: '1',
                                        xAxis: arr_val.length-1,
                                        yAxis: 5.5,
                                    }]
                                ]
                            },
                            itemStyle: {
                                normal: {
                                    color: "#070d29",
                                    lineStyle: {
                                        width: 6,
                                        color: "white",
                                        type: "dotted"
                                    },
                                    borderColor: "white",
                                    borderWidth: 1
                                },
                                emphasis: {
                                    color: "#ed415a",
                                    borderColor: "#ed415a",
                                    borderWidth: 10,
                                }
                            }
                        }
                    ]
                }
                option.yAxis[0].max = val_max + 10;
                if(val_max > 11){
                    option.series[0].markLine.data.push([
                        {name: '2',
                            xAxis: 0,
                            yAxis: 10.8,
                        },
                        {name: '2',
                            xAxis: arr_val.length-1,
                            yAxis: 10.8,
                        }
                    ]);          
                }
                myChart.setOption(option);
            });
        }
        $nav_h3.first().click(initWind);
        
        var $address = $('#address');
        var geocoder = new qq.maps.Geocoder({
            complete : function(result){
                var address = result.detail.address;
                address && $address.html('<img src="img/locate.png"/>'+address);
            }
        });
        function _showData(e){
            clearData();
            current_map_point = e.latLng;
            if(!marker){
                // var anchorb = new qq.maps.Point(3,-30),
                //     sizeb = new qq.maps.Size(42, 11),
                //     origin = new qq.maps.Point(0, 0),
                //     iconb = new qq.maps.MarkerImage(
                //         "http://open.map.qq.com/doc/img/nilb.png", 
                //         sizeb, 
                //         origin,
                //         anchorb
                //     );
                var anchor = new qq.maps.Point(14, 30),
                    size = new qq.maps.Size(24, 24),
                    origin = new qq.maps.Point(0, 0),
                    icon = new qq.maps.MarkerImage('./img/locate.png', size, origin, anchor);
                marker = new qq.maps.Marker({
                    icon: icon,
                    position: current_map_point,
                    map: map
                });
            }else{
                marker.setPosition(current_map_point);
            }
            $address.html('');
            geocoder.getAddress(current_map_point);

            clearTimeout(initWindTT);
            initWindTT = setTimeout(function(){
                $nav_h3.first().click();
            }, 100);
        }
        var dom_map = $('#map').get(0);
        qq.maps.event.addListener(map, 'click', function(e){

        });
        var SUPPORTS_TOUCH = 'ontouchstart1' in window;
        var delay_longtap = 1000;
        var max_move_distance = Math.pow(10, 2);
        var tt_longtap;
        var x_start, y_start, x_end, y_end;
        function fn_mousemove(e_move){
            if(SUPPORTS_TOUCH && e_move.touchs){
                e_move = e_move.touchs[0];
            }
            x_end = e_move.pageX,
            y_end = e_move.pageY;
        }
        function fn_mousedown(e){
            if(SUPPORTS_TOUCH && e.touchs){
                e = e.touchs[0];
            }
            x_start = x_end = e.pageX,
            y_start = y_end = e.pageY;

            var listener_move = qq.maps.event.addDomListener(dom_map, 'mousemove', fn_mousemove);
            if(SUPPORTS_TOUCH){
                var listener_touch_move = qq.maps.event.addDomListener(dom_map, 'touchmove', fn_mousemove);
            }
            clearTimeout(tt_longtap);
            tt_longtap = setTimeout(function(){
                qq.maps.event.removeListener(listener_move);
                listener_touch_move && qq.maps.event.removeListener(listener_touch_move);
                if(Math.pow(x_end - x_start, 2) + Math.pow(y_end - y_start, 2) <= max_move_distance){
                    var latLng = map.mapCanvasProjection.fromContainerPixelToLatLng(new qq.maps.Point(x_end, y_end));
                    _showData({
                        latLng: latLng
                    });
                }
            }, delay_longtap);
        }
        qq.maps.event.addDomListener(dom_map, 'mousedown', fn_mousedown);
        if(SUPPORTS_TOUCH){
            qq.maps.event.addDomListener(dom_map, 'touchstart', fn_mousedown);
        }
    });
	// loadXSC();
}();