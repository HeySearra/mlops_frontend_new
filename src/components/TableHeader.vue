<template>
  <div class="table-header-frame">
    <el-dialog>
      高清无码大图, 暂时不做
    </el-dialog>
    <el-popover
    style="width:100%"
    placement="top-start"
    width="200"
    trigger="click"
    v-model="popVisible">
    <div class="sort-button">
      <el-button type="text" icon="el-icon-top">按升序排列</el-button>
      <el-button type="text" icon="el-icon-bottom" id="desc-sort">按降序排列</el-button>
    </div>
    <el-slider
        v-model="select_range"
        range
        :min="data_range[0]"
        :max="data_range[1]">
    </el-slider>
    <div style="text-align: right; margin: 0">
      <el-button type="primary" size="mini">应用</el-button>
    </div>
    <div class="col_info" slot="reference">
      <span >{{stat.label}}</span>
      <span style="float:right"><i class="el-icon-more"/></span>
      
    </div>
  </el-popover>
<!--    <div v-if="stat.type !== `NUMBER`" >UniqueValues:{{stat.unique}}</div>-->
    <div class="table-header-chart" :id="`col_chart`+col_id" style="font-size: 5px;color: #555;opacity: 0.5">UniqueValues:{{stat.unique}}</div>
  </div>
</template>
<script>
/*
* 实现两个图：饼图and直方图
* */
const Echarts = require('echarts');

let chart_set_option = (chart,data,type)=>{
  //todo: 数据更新策略是怎样的
  if (type === "NUMBER"){
    //数据的min max显示，可以考虑在坐标轴两端用html显示一下，不一定要用echarts的接口。
    chart.setOption({
      tooltip: {
        show:true,
        appendToBody:true,//这个接口Echarts文档说可能有未知Bad case...
        trigger:"axis",//数据轴触发
        triggerOn:"mousemove",
        transitionDuration: 0.4,
        borderColor:"#123",
        padding:[5,10],
        textStyle:{
          fontSize: 10
        },
        formatter(params){
          var from = params[0].data.from.toFixed(5)
          var to = params[0].data.to.toFixed(5)
          var rangeName = from+" to "+to
          var count = params[0].value
          return `<div>${rangeName}</div>
                  <div>${params[0].marker}Count:${count}</div>`
        },
      },
      legend:{
        show:false
      },
      grid: {
        top:5,
        bottom:5
      },
      title:{
        show:false
      },
      xAxis: {
        type: "category",// 由于后端不会传递所有的数据，所以在后端统计后，以分类的形式返回前端
        boundaryGap:true,
        splitNumber:8,
        minInterval:1,
        maxInterval:20,
        silent: true,
        axisTick:{
          show:false
        },
        axisLabel:{
          show:false
        }
      },
      yAxis: {
        show:false,
        type: "value",
      },
      series: [
        {
          data: data.data,
          type: 'bar',
          itemStyle:{
            color: "rgba(137, 207, 240,1)",
            opacity: 0.5,
            borderColor: '#000',
            borderWidth: 1
          },
          emphasis:{
            focus: "self",
            blurScope: "global"
          },
          barCategoryGap:'0%',
        }
      ],
    })
  }else if(type === "CATEGORIES"){
    chart.setOption({
      legend:{
        show:false
      },
      tooltip: {
        show:true,
        appendToBody:true,//这个接口Echarts文档说可能有未知Bad case...
        trigger:"item",//数据轴触发
        triggerOn:"mousemove",
        transitionDuration: 0.4,
        borderColor:"#123",
        padding:[5,10],
        textStyle:{
          fontSize: 10
        },
        formatter(params){
          var cateName = params.name
          var count = params.value
          var percent = params.percent
          return `<div>${cateName}:${count}</div>
                  <div>${params.marker}${percent}%</div>`
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['70%','100%'],
          avoidLabelOverlap:false,
          data: data.categoryData.data,
          colorBy: 'data',
          left:'center',
          top: 'middle',
          width: '80%',
          height: '80%',
          label:{
            show: false,
            position: 'center'
          },
          labelLine:{
            show:false
          },
          emphasis: {
            scale:true,
            focus: 'self',
            label: {
              show: true,
              fontSize: '10',
              fontWeight: 'bold'
            }
          },
          itemStyle:{
            color: "rgba(137, 207, 240,1)",
            opacity: 0.5,
            borderColor: '#000',
            borderWidth: 1
          }
        }
      ],
    })
  }
}

export default {
  data(){
    return{
      col_name:"学号",
      type: "Number", // 还可以是String，datetime，或者类别型
      data_range: [0, 10],
      select_range: [0, 10],
      chartData:{
        categories:[],
        data:[],
        categoryData:{
          data:[
          ]
        }
      },
      chartType: "NUMBER",
      popVisible: false,
    }
  },
  props:{
    data_id:{
      type:Number,
      required:true
    },
    col_id:{
      type:Number,
      required:true
    },
    stat:{
      type:Object,
      required:true
    }

  },
  created() {
    //TODO: 搞清楚获取col info的方式。
    this.chartType= "NUMBER"
  },
  mounted(){
    // 数值型直接绘制图表
    if(this.stat.type === "NUMBER"){
      let chart = document.getElementById("col_chart"+this.col_id)

      var myChart = Echarts.init(chart);
      this.chart = myChart
      window.onresize = function(){
        myChart.resize()
      }
      this.chartData.data = this.stat.distribution
      chart_set_option(this.chart, this.chartData,this.stat.type)
      this.data_range=[this.stat.min,this.stat.max]
    }
  }
}
</script>

<style>
/* todo: 设置宽度 */
.table-header-frame{
  height: 150px;
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.table-header-frame:hover{
  height: 150px;
  background-color: #fafafa;
}
.col_info{
  height:30px;
  width:100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  cursor:pointer;
}
/* 就是父组件尺寸的100% */
.table-header-chart{
  width: 120px;
  height: 120px;
}


.cell{
  padding-left: 5px !important;
  padding-right: 5px !important;
}

.sort-button{
  display : flex;
	flex-direction: column;
  align-items: flex-start;
}

#desc-sort{
  margin-left: 0;
}

</style>