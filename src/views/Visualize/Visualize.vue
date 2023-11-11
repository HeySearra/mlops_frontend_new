<template>
  <div class="container">
    <div class="dataset-header">
      <div id="title-container">
        <span class="title">{{ this.cur_dataset_name }}</span>
      </div>
      <el-form id="form-container" class="dataset-list-form-container">
        <div class="form-row">
          <el-form-item label="选择数据集">
            <el-select v-model="cur_dataset_id" placeholder="选择数据集" @change="getDatasetId($event)">
              <el-option v-for="item in datasetList" :value="item.id" :key="item.id" :label="item.name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="选择子数据集">
            <el-select v-model="dataset_id" placeholder="选择子数据集" @change="getChildDatasetId($event)">
              <el-option v-for="item in childDatasetList" :value="item.children_name" :key="item.children_id"
                :label="item.children_name"></el-option>
            </el-select>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <el-descriptions title="数据集基本信息" class="dataset-info" v-loading="datasetLoading">
      <el-descriptions-item label="数据集ID">{{ datasetInfo.id }}</el-descriptions-item>
      <el-descriptions-item label="数据集任务">{{ datasetInfo.task }}</el-descriptions-item>
      <el-descriptions-item label="数据集领域">{{ datasetInfo.area }}</el-descriptions-item>
      <el-descriptions-item label="数据集创建者">{{ datasetInfo.owner }}</el-descriptions-item>
      <el-descriptions-item label="数据集创建时间">{{ datasetInfo.created }}</el-descriptions-item>
      <el-descriptions-item label="描述信息">{{ datasetInfo.long_description }}</el-descriptions-item>
    </el-descriptions>

    <dataset-statistic ref="dataView" :id="dataset_id_num"></dataset-statistic>

    <el-table :data="staticInfo" :row-key="getRowKey" ref="staticTable" height="500" stripe class="static-info"
      v-loading="staticLoading" @selection-change="handleSelectionChange">
      <el-table-column type="selection" :selectable="selectable" :reserve-selection="true" width="55">
      </el-table-column>
      <el-table-column prop="feature_name" label="特征" header-align="center"></el-table-column>
      <el-table-column prop="min" label="最小值" header-align="center"></el-table-column>
      <el-table-column prop="max" label="最大值" header-align="center"></el-table-column>
      <el-table-column prop="mean" label="均值" header-align="center" :formatter="formatAmount"></el-table-column>
      <el-table-column prop="std" label="标准差" header-align="center" :formatter="formatAmount"></el-table-column>
      <el-table-column prop="p25" label="25%" header-align="center"></el-table-column>
      <el-table-column prop="p50" label="50%" header-align="center"></el-table-column>
      <el-table-column prop="p75" label="75%" header-align="center"></el-table-column>
      <el-table-column label="正正态性检验态" header-align="center">
        <el-table-column prop="ntest_s" label="统计值" header-align="center" :formatter="formatAmount"></el-table-column>
        <el-table-column prop="ntest_p" label="p值" header-align="center" :formatter="formatAmount"></el-table-column>
      </el-table-column>
      <el-table-column prop="hist" label="频率分布直方图" header-align="center">
        <template slot-scope="scope">
          <!-- <e-charts class="chart1" :option="getOption(scope.row.num)"></e-charts> -->
          <div class="chart3" :ref="scope.row.feature_name"></div>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin-top: 20px">
      <el-button @click="multiFeatureTest()">多特征检验</el-button>
    </div>
    <el-dialog title="多特征检验" :visible.sync="MultiTestShow" width="40%">
      <el-table :data="MultiTestTable" stripe style="width: 100%">
        <el-table-column prop="method" label="检验方法">
        </el-table-column>
        <el-table-column prop="value" label="值">
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-card class="box-card" id="info-card" >
      <div class="patient-stat">
        <el-input placeholder="请输入患者ID" v-model="patientId" class="input-with-select" style="width: 100%;">
          <el-button slot="append" icon="el-icon-search" @click="getPatient()"></el-button>
        </el-input>
        <div class="patient-info">
          <el-avatar icon="el-icon-user-solid" :size="70" class="patient-avator" style="margin-top: 30px;" :src=this.patient_pic></el-avatar>
          <div class="des-info">
            <h3 style="margin-left: 20px;">患者基本信息</h3>
            <p><span>ID:</span>&nbsp;&nbsp;&nbsp;&nbsp;{{patientStat.PDID }}</p>
            <p><span>性别:</span>&nbsp;&nbsp;&nbsp;&nbsp;{{ patientStat.GENDER }}</p>
            <p><span>年龄:</span>&nbsp;&nbsp;&nbsp;&nbsp;{{ patientStat.AGE }}</p>
            <p><span>身高:</span>&nbsp;&nbsp;&nbsp;&nbsp;{{ patientStat.HEIGHT }}</p>
            <p><span>体重:</span>&nbsp;&nbsp;&nbsp;&nbsp;{{ patientStat.WEIGHT }}</p>
            <p><span>原始疾病:</span>&nbsp;&nbsp;&nbsp;&nbsp;{{ patientStat.ORIGIN_DISEASE }}</p>
            <p><span>是否死亡:</span>&nbsp;&nbsp;&nbsp;&nbsp;{{ patientStat.DEATH }}</p>
            <p><span>死亡原因:</span>&nbsp;&nbsp;&nbsp;&nbsp;{{ patientStat.DEATH_REASON }}</p>
          </div>
        </div>
        <!-- <el-descriptions title="患者基本信息">
          <el-avatar icon="el-icon-user-solid"></el-avatar>
          <el-descriptions-item label="ID">{{ patientStat.PDID }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ patientStat.GENDER }}</el-descriptions-item>
          <el-descriptions-item label="年龄">{{ patientStat.AGE }}</el-descriptions-item>
          <el-descriptions-item label="身高">{{ patientStat.HEIGHT }}</el-descriptions-item>
          <el-descriptions-item label="体重">{{ patientStat.WEIGHT }}</el-descriptions-item>
          <el-descriptions-item label="原始疾病">{{ patientStat.ORIGIN_DISEASE }}</el-descriptions-item>
          <el-descriptions-item label="是否死亡">{{ patientStat.DEATH }}</el-descriptions-item>
          <el-descriptions-item label="死亡年龄">{{ patientStat.DEATH_AGE }}</el-descriptions-item>
          <el-descriptions-item label="死亡原因">{{ patientStat.DEATH_REASON }}</el-descriptions-item>
        </el-descriptions> -->
      </div>
    </el-card>


    <!-- <el-form>
      <div style="margin-top: 40px;">
        <el-row>
          <el-col :span="6">
            <el-form-item label="数据可视化控件">
              <el-select v-model="figureClass" placeholder="图表类型" @change="getFigureClass">
                <el-option v-for="item in figureList" :value="item.id" :key="item.id"
                            :label="item.name"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item :label=firstDim>
              <el-select v-model="xFeature" :placeholder=firstDim >
                <el-option v-for="item in featureList" :value="item" :key="item"
                            :label="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item :label=secondDim>
              <el-select multiple v-model="yFeature" :placeholder=secondDim :disabled=yDisabled>
                <el-option v-for="item in featureList" :value="item" :key="item"
                            :label="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item>
              <el-button @click="filterVisible = true">过滤器</el-button>
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item>
              <el-button @click="showFigure()">生成</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form> -->
    <el-card id="fea-pic" class="box-card" style="float: right;">
      <el-form style="margin-top: 15px;">
        <div >
          <el-row>
            <el-col style="width: 30%;">
              <el-form-item :label=secondDim>
                <el-select multiple v-model="yFeature" :placeholder=secondDim :disabled=yDisabled collapse-tags style="width: 80%;">
                  <el-option v-for="item in featureList" :value="item" :key="item" :label="item"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col style="width: 30%;">
              <el-form-item>
                <el-button @click="showFigure()">生成</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <div ref="explore_chart" class="chart-style"></div>
    </el-card>



    <el-dialog title="过滤" :visible.sync="filterVisible" width="60%" :before-close="handleClose">
      <span>请输入过滤信息，格式为[字段名]==***，如pdid==98</span>
      <el-input v-model="filterString" placeholder="请输入内容"></el-input>
      <div style="display: flex; align-items: center;">
        过滤特征<el-select v-model="filterFeature" placeholder="请输入过滤特征" :style="{ flex: '1 0 200px' }">
          <el-option v-for="item in featureList" :value="item" :key="item" :label="item"></el-option>
        </el-select>
        运算符<el-select v-model="filterSymbol" placeholder="请输入运算符" :style="{ flex: '1 0 200px' }">
          <el-option v-for="item in SymbolList" :value="item" :key="item" :label="item"></el-option>
        </el-select>
        值<el-input v-model="filterValue" placeholder="请输入值" :style="{ flex: '1 0 200px' }"></el-input>
        <el-button @click="addFilterString()">添加</el-button>
      </div>


      <span slot="footer" class="dialog-footer">
        <el-button @click="filterVisible = false">取 消</el-button>
        <el-button type="primary" @click="figureFilter()">确 定</el-button>
      </span>
    </el-dialog>

    <div style="margin-top: 40px">
    </div>


  </div>
</template>

<script>
import { features } from 'process';
import DatasetStatistic from "../../components/DatasetStatistic";
import patient_pic from "@/assets/patient.jpg"

const echarts = require('echarts');
export default {

  components: {
    DatasetStatistic
  },

  data() {
    return {
      input: '',
      cur_dataset_id: this.$route.query.param,
      cur_dataset_name: "",
      cur_model: '',
      datasetList: '',
      dataset_id: 0,
      dataset_id_num: 0,
      datasetInfo: '',
      datasetLoading: true,
      childDatasetList: [],
      staticInfo: [],
      staticMultipleSelection: [],
      limitNum: 2,
      MultiTestShow: false,
      MultiTestTable: [],
      patient_pic: patient_pic,
      figureList: [
        {
          name: "折线图",
          id: "line",
        },
        {
          name: "频次分布直方图",
          id: "bar",
        },
        {
          name: "饼图",
          id: "pie"
        }
      ],
      figureClassMap: {
        line: {
          firstDim: "横轴",
          secondDim: "纵轴",
          yDisabled: false
        },
        bar: {
          firstDim: "横轴",
          secondDim: "",
          yDisabled: true
        },
        pie: {
          firstDim: "特征",
          secondDim: "",
          yDisabled: true
        }
      },
      firstDim: "横轴",
      secondDim: "特征",
      figureChart: "",
      figureClass: "",
      featureList: ["pdid", "尿素", "血蛋白", "日期"],
      xFeature: "",
      yFeature: [],
      yDisabled: false,
      figureData: {
      },
      filterVisible: false,
      filterString: "",
      filterFeature: "",
      filterSymbol: "",
      SymbolList: [
        "==", "!=", "<", "<=", ">", ">="
      ],
      filterValue: "",
      modelList: [

      ],
      model_id: 'd1_model1',
      result_all: '',
      globalXaxis: '',
      globalData: '',
      dialogShow: false,
      singleData: '',
      singleTimestep: '',
      singleLegends: '',
      singleSeries: '',
      singleSelected: {},
      curSingleData: '1231',
      staticLoading: true,
      patientId: '',
      patientStat: {
        PDID: '', GENDER: '', BIRTH_DATE: '', AGE: '', ORIGIN_DISEASE: '', DEATH: '', DEATH_AGE: '', DEATH_REASON: '', HEIGHT: '', WEIGHT: ''
      },
    }
  },

  created() {
    this.getDatasetList();
    this.getModelList();
  },


  mounted() {
    this.$root.$emit('selectFunc', "visualize");
    this.figureChart = echarts.init(this.$refs.explore_chart);
    this.initData();
  },

  methods: {
    initData() {
      this.$http_vis({
        url: "/predata/?list=1",
        method: "get",
      }).then((res) => {
        let data = res.data.results
        this.datasetList = data
      }).then(() => {

        this.cur_dataset_id = this.datasetList[0].id;
        this.getDatasetId();
      }).then(() => {
        let url = "/predata/" + this.cur_dataset_id + "/";
        this.$http_vis({
          url: url,
          method: "get",
        }).then((res) => {
          let data = res.data;
          this.dataset_id_num = data.children[0].children_id[0]
        })
      })
    },
    getDatasetList() {
      this.$http_vis({
        url: "/predata/?list=1",
        method: "get",
      }).then((res) => {
        let data = res.data.results
        this.datasetList = data
      })
    },
    getModelList() {
      this.$http_vis({
        url: "/interpretability/model/ids/",
        method: "post",
        data: {
          dataset_id: this.dataset_id
        }
      }).then((res) => {
        let data = res.data.data
        this.modelList = data
      })
    },
    getDatasetId(val) {
      let url = "/predata/" + this.cur_dataset_id + "/";
      this.$http_vis({
        url: url,
        method: "get",
        // params: {
        //   id: this.cur_dataset
        // }
      }).then((res) => {
        this.datasetInfo = res.data;
        this.datasetInfo.created = this.formatToSecond(this.datasetInfo.created);
        let data = res.data;
        this.cur_dataset_name = data.name;
        // console.log("111111111111111");
        // console.log(data);
        // console.log(this.cur_dataset_name);
        // console.log("222222222222222");
        this.childDatasetList = [];
        this.childDatasetList.push({
          children_id: this.cur_dataset_id,
          children_name: data.name
        })
        // console.log(data);
        // this.childDatasetList = data.children;
        for (let i in data.children) {
          let childItem = {
            children_id: data.children[i].children_id[0],
            children_name: data.children[i].children_name[0]
          }
          this.childDatasetList.push(childItem);
        }
        this.dataset_id = data.name;
        this.dataset_id_num = this.cur_dataset_id;
        this.getDataView();
        this.getProcess();
        // console.log(this.childDatasetList);
      })
      // console.log(val);
      // this.dataset_id = val;
      // this.getProcess(val);
    },
    getChildDatasetId(val) {
      // console.log(val);
      for (let i in this.childDatasetList) {
        if (this.childDatasetList[i].children_name == val) {
          this.dataset_id_num = this.childDatasetList[i].children_id;
          break;
        }
      }
      this.getDataView();
      this.getProcess();
    },
    getProcess() {
      let url = "/predata/" + this.dataset_id_num + "/";
      this.staticLoading = true;
      this.datasetLoading = true;
      this.$http_vis({
        url: url,
        method: "get",
      }).then((res) => {
        // console.log(res.data);
        this.datasetLoading = false;
        this.datasetInfo = res.data;
        this.datasetInfo.created = this.formatToSecond(this.datasetInfo.created);
        let fList = res.data.sample.head;
        this.featureList = fList;
      });
      this.$http_vis({
        url: "/ana/sa/",
        method: "post",
        data: {
          dataset_id: this.dataset_id
        }
      }).then((res) => {
        let data = res.data.data;
        // console.log(data);
        this.staticLoading = false;
        this.staticInfo = [];
        for (var i = 0; i < data.feature_name.length; i++) {
          let item = {
            feature_name: data.feature_name[i], min: data.metric.min[i], max: data.metric.max[i], mean: data.metric.mean[i], std: data.metric.std[i],
            p25: data.metric.quantile_25[i], p50: data.metric.quantitle_50[i], p75: data.metric.quantitle_75[i], ntest_s: data.metric.normaltest[i][0],
            ntest_p: data.metric.normaltest[i][1], hist: data.metric.histogram[i]
          };
          this.staticInfo.push(item);
        }
        this.tableCharts();
      })
    },
    getDataView() {
      this.$refs.dataView.getData(this.dataset_id_num, 0, 100);
      this.$refs.dataView.getAllStat(this.dataset_id_num);
    },
    getRowKey(row) {
      return row.id;
    },
    handleSelectionChange(val) {
      if (val.length > this.limitNum) {
        this.limitFn(val)
        return
      }
      this.staticMultipleSelection = [...val]
      // console.log(this.staticMultipleSelection);
    },
    // 限制数量方法
    limitFn(list) {
      this.$refs.staticTable.clearSelection();
      for (let i = 0; i < this.limitNum; i++) {
        this.$refs.staticTable.toggleRowSelection(list[i]);
      }
    },
    // 判断复选框是否可以选择
    selectable(row) {
      let index = this.staticMultipleSelection.findIndex(v => v.id === row.id)
      if (this.staticMultipleSelection.length >= this.limitNum) {
        if (index !== -1) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    },
    formatAmount(row, column) {
      const value = row[column.property];
      if (typeof value === 'number') {
        return value.toFixed(2);
      }
      return value;
    },
    formatToSecond(timestamp) {
      const date = new Date(timestamp);
      const formattedDate = date.toISOString().slice(0, 19).replace("T", " ");
      return formattedDate;
    },
    getFigureClass(val) {
      this.firstDim = this.figureClassMap[val].firstDim;
      this.secondDim = this.figureClassMap[val].secondDim;
      this.yDisabled = this.figureClassMap[val].yDisabled;
    },
    showFigure() {
      // console.log(this.dataset_id, this.xFeature, this.yFeature, this.figureClass, this.filterString);
      let requestData = {};
      // if (this.figureClass=="line") {
      //   requestData = {
      //     dataset_id: this.dataset_id,
      //       x_feature: this.xFeature,
      //       y_features: this.yFeature,
      //       pic_type: this.figureClass,
      //       filter_str: this.filterString
      //   };
      // }else {
      //   requestData = {
      //     dataset_id: this.dataset_id,
      //       x_feature: this.xFeature,
      //       pic_type: "hist",
      //       other_args:  {
      //         bins_num: 10
      //       }
      //   }
      // }
      this.figureClass = 'line';
      requestData = {
        dataset_id: this.dataset_id,
        x_feature: 'DATE',
        y_features: this.yFeature,
        pic_type: 'line',
        filter_str: 'PDID==' + this.patientId
      };
      this.$http_vis({
        url: "/visualcomp/comp/data/",
        method: "post",
        data: requestData
      }).then((res) => {
        // console.log(res.data.data.figureData);
        let resdata = res.data.data.figureData;
        this.figureData = resdata;
        // console.log(this.figureData);
        let myChart = this.figureChart;
        myChart.clear();
        if (this.figureClass == "pie") {
          this.showPie();
        }
        if (this.figureClass == "line" || this.figureClass == "bar") {
          this.showLineBar();
        }
      });
    },
    showLineBar() {
      let myChart = this.figureChart;
      let xAxis = {
        type: "category",
        data: this.figureData.xFeature.data
      };
      let yAxis = [];
      for (let i in this.figureData.yFeature) {
        yAxis.push({
          type: 'value',
          name: this.figureData.yFeature[i].name,
          position: 'right',
          offset: i * 90,
          nameLocation: 'end',
          scale: true,
          axisTick: {
            show: true
          },
          splitLine: {
            show: false
          },
          axisLine: {
            show: true,
            onZero: false
          },
          axisLabel: {
            show: true,
            formatter(params) {
              return (params).toFixed(0)
            }
          }
        })
      }
      let legend = {
        data: []
      }
      let series = [];
      for (let i in this.figureData.yFeature) {
        legend.data.push(this.figureData.yFeature[i].name);
        series.push({
          data: this.figureData.yFeature[i].data,
          name: this.figureData.yFeature[i].name,
          type: this.figureClass,
          yAxisIndex: i
        });
      }
      let grid = {
        top: '15%',
        right: (this.figureData.yFeature.length - 1) * 90,
        containLabel: true
      };
      myChart.setOption({
        xAxis: xAxis, yAxis: yAxis, series: series, legend: legend, grid: grid,
        tooltip: {
          trigger: 'axis'
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        }
      });
    },
    showPie() {
      let myChart = this.figureChart;
      let legend = {
        top: '5%',
        left: 'center'
      }
      let series = [];
      let pieSeries = {
        name: this.xFeature,
        type: "pie",
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: []
      }
      for (let i in this.figureData.yFeature[0].data) {
        pieSeries.data.push({
          value: this.figureData.yFeature[0].data[i],
          name: this.figureData.xFeature.data[i]
        });
      }
      series.push(pieSeries);
      myChart.setOption({
        series: series, legend: legend,
        tooltip: {
          trigger: 'item'
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        }
      });
    },
    figureFilter() {
      this.filterVisible = false;
      // console.log(this.filterString);
    },
    addFilterString() {
      this.filterString = this.filterString + this.filterFeature + this.filterSymbol + this.filterValue;
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => { });
    },
    tableCharts() {
      setTimeout(_ => {
        this.staticInfo.forEach(e => {
          let f_name = e.feature_name;
          let myChart3 = echarts.init(this.$refs[f_name]);
          myChart3.setOption({
            xAxis: {
              type: "category",
              show: false
            },
            yAxis: {
              type: "value",
              show: false
            },
            series: [
              {
                data: e.hist,
                type: "bar",
              }
            ]
          });
          window.addEventListener("resize", () => {
            myChart3.resize();
          });
        });

      }, 1000);
    },
    multiFeatureTest() {
      var features = [];
      for (let item in this.staticMultipleSelection) {
        features.push(this.staticMultipleSelection[item].feature_name);
      }
      this.$http_vis({
        url: "/ana/fc/",
        method: "post",
        data: {
          dataset_id: this.dataset_id,
          columns: features
        }
      }).then((res) => {
        let data = res.data.data;
        this.MultiTestTable = [];
        this.MultiTestTable.push({ method: "pearsonr", value: data.pearsonr.toFixed(2) });
        var t_test_string = "t=" + data.ttest[0].toFixed(2) + ",p=" + data.ttest[1].toFixed(2);
        this.MultiTestTable.push({ method: "t-test", value: t_test_string });
        this.MultiTestShow = true;
      })
    },
    getModelId(val) {
      this.$http_vis({
        url: "/interpretability/result/all/",
        method: "post",
        data: {
          model_id: val
        }
      }).then((res) => {
        let data = res.data.data;
        this.result_all = data;
        let features = this.result_all.explanation[0].data;
        this.globalXaxis = [];
        this.globalData = [];
        var index = 0;
        for (var key in features) {
          this.globalXaxis.push(key);
          this.globalData.push([index, 0, features[key]]);
          index += 1;
        }
        // console.log(this.globalXaxis);
        // console.log(this.globalData);
        // this.initCharts();
        this.initHeatmap();
      })
    },
    showSingleData() {
      this.$http_vis({
        url: "/interpretability/result/single/",
        method: "post",
        data: {
          dataset_id: this.dataset_id,
          operations: this.operations,
          model_id: this.model_id,
          sample_id: this.curSingleData,
        }
      }).then((res) => {
        let data = res.data.data
        this.singleData = data
        this.dialogShow = true;
        this.singleLegends = Object.keys(this.singleData.sample_data);
        this.singleTimestep = this.singleData.sample_data.timestep;
        this.singleSeries = [];
        for (var i = 0; i < this.singleLegends.length; i++) {
          if (this.singleLegends[i] == "timestep") {
            this.singleLegends.splice(i, 1);
          }
        }
        for (var key in this.singleData.sample_data) {
          if (key != "timestep") {
            let item = { name: key, type: "line", data: this.singleData.sample_data[key] };
            this.singleSeries.push(item);
          }
        }
        let outputItem = { name: "output", type: 'line', areaStyle: { opacity: 0.2 }, data: this.singleData.output };
        this.singleSeries.push(outputItem);
        var att_visit = this.singleData.explanation[0].data;
        for (var key in att_visit) {
          let item = { name: key, type: "line", data: att_visit[key], symbolSize: 0, showSymbol: false, lineStyle: { width: 0, color: 'rgba(0, 0, 0, 0)' } };
          this.singleSeries.push(item);
        }
        this.singleLegends.push("output");
        this.initSingleCharts();
      })
    },
    // initCharts () {
    //   let myChart = echarts.init(this.$refs.chart);
    //   // 绘制图表
    //   myChart.setOption({
    //     title: {
    //       text: 'attention特征重要性'
    //     },
    //     tooltip: {
    //       trigger: 'axis'
    //     },
    //     legend: {
    //       data: ['K', 'Ca', 'Na']
    //     },
    //     grid: {
    //       left: '3%',
    //       right: '4%',
    //       bottom: '3%',
    //       containLabel: true
    //     },
    //     toolbox: {
    //       feature: {
    //         saveAsImage: {}
    //       }
    //     },
    //     xAxis: {
    //       type: 'category',
    //       boundaryGap: false,
    //       data: this.singleTimestep
    //     },
    //     yAxis: {
    //       type: 'value'
    //     },
    //     series: this.singleSeries
    //   });
    // },
    initHeatmap() {
      let myHeatmap = echarts.init(this.$refs.heatmap);
      myHeatmap.setOption(
        {
          title: {
            text: '全局特征重要性'
          },
          tooltip: {
            position: 'top'
          },
          grid: {
            height: '50%',
            top: '10%'
          },
          xAxis: {
            type: 'category',
            data: this.globalXaxis,
            splitArea: {
              show: true
            }
          },
          yAxis: {
            type: 'category',
            data: ['重要性权重'],
            splitArea: {
              show: true
            }
          },
          visualMap: {
            min: 0,
            max: 1,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '15%',
            inRange: {
              color: ['#ffffff', '#0000cd']
            }
          },
          series: [
            {
              name: '特征重要性',
              type: 'heatmap',
              data: this.globalData,
              label: {
                show: true
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        }
      );
    },
    // 生成大小一样样色不同的圆点
    markDot(color) {
      let domHtml = '<span style="' +
        'display: inline-block;' +
        'margin-right: 8px;' +
        'margin-bottom: 2px;' +
        'border-radius: 6px;' +
        'width: 6px;' +
        'height: 6px;' +
        `background-color: ${color}` +
        '"></span>'
      return domHtml;
    },
    initSingleCharts() {
      let myChart = echarts.init(this.$refs.single_chart);
      // 绘制图表
      myChart.setOption({
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            let result = params[0].name + "</br>";
            var len = 0
            for (var i = 0; i < params.length; i++) {
              result += `${this.markDot(params[i].color)}${params[i].seriesName}：${params[i].data}</br>`
              if (params[i].seriesName == "output") {
                len = i;
                break;
              }
            }
            result += '动态特征重要性' + "</br>";
            for (i = len + 1; i < params.length; i++) {
              if (this.singleSelected[params[i].seriesName] == false) continue;
              result += `${this.markDot(params[i].color)}${params[i].seriesName}：${params[i].data}</br>`
            }
            return result;
          }
        },
        legend: {
          data: this.singleLegends
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.singleTimestep
        },
        yAxis: {
          type: 'value'
        },
        series: this.singleSeries,
      });
      var selectArr = myChart.getOption().legend[0].data;
      let count = 0;
      for (var key in selectArr) {
        if (count >= 3) this.singleSelected[selectArr[key]] = false;
        else this.singleSelected[selectArr[key]] = true;
        count = count + 1;
      }
      this.singleSelected.output = true;
      // console.log(this.singleSelected);
      myChart.setOption({
        legend: {
          selected: this.singleSelected
        }
      });
      let that = this;
      myChart.on('legendselectchanged', function (obj) {
        var selected = obj.selected;
        var name = obj.name;
        for (var key in selectArr) {
          if (myChart.getOption().legend[0].selected[[selectArr[key]]] != null) {
            that.singleSelected[selectArr[key]] = myChart.getOption().legend[0].selected[[selectArr[key]]];
          }
        }
      });
    },
    getPatient() {
      let filterString = 'PDID==' + this.patientId;
      let requestData = {
        dataset_id: '北医三院静态数据',
        x_feature: 'PDID',
        y_features: ["PDID", "GENDER", "BIRTH_DATE", "AGE", "ORIGIN_DISEASE", "DEATH", "DEATH_AGE", "DEATH_REASON", "HEIGHT", "WEIGHT"],
        pic_type: 'line',
        filter_str: filterString
      }
      this.$http_vis({
        url: "/visualcomp/comp/data/",
        method: "post",
        data: requestData
      }).then((res) => {
        let resdata = res.data.data.figureData.yFeature;
        let staticList = ["PDID", "GENDER", "BIRTH_DATE", "AGE", "ORIGIN_DISEASE", "DEATH", "DEATH_AGE", "DEATH_REASON", "HEIGHT", "WEIGHT"]
        for (var i in staticList) {
          let feature = staticList[i];
          this.patientStat[feature] = resdata[i].data[0];
        }
        if (this.patientStat.DEATH == 0) this.patientStat.DEATH = '否'; else this.patientStat.DEATH = '是';
      });
    }
  }

}
</script>

<style  scoped>
.container {
  padding: 40px 80px;
}

.dataset-info {
  margin-top: 40px;
  margin-bottom: 40px;
}

.static-info {
  width: 100%;
  margin-top: 40px;
}

.form-container {
  display: flex;
  flex-wrap: wrap;
}

.form-row {
  flex: 1;
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
}

.el-icon-arrow-down {
  font-size: 12px;
}

.chart3 {
  width: 100px;
  height: 100px;
}

a {
  text-decoration: inherit;
}

.patient-stat {
  margin-top: 15px;
  border-radius: 5px;
}

.el-input {
  width: 400px;
}

.el-descriptions {
  margin-top: 15px;
}

.title {
  cursor: pointer;
  font-size: 30px;
  font-family: SimHei-Normal;
  font-weight: bold;
  text-align: LEFT;
  color: #5194e9;
  line-height: 30px;
}

.dataset-header {
  height: 100px;
  position: relative;
}

#title-container {
  width: 40%;
  float: left;
  margin-top: 20px;
}


#form-container {
  float: right;
}

.box-card {
  height: 800px;
  /* border: 1px solid rgba(220,220,220); */
  border-radius: 5px;
  float: left;
  margin-bottom: 30px;
}
#info-card{
  width: 35%;
}
#fea-pic{
  width: 64%;
}
.patient-info{
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  font-size: 18px;
}

.patient-info p{
  margin-left: 50px;
}
.patient-info span{
  color: #606266;
  font-weight: bold; 
}

.patient-avator{
  margin-top: 20px;
  margin:auto;
  display: block;
}

.des-info{
  width: 95%;
  padding: 10px;
  margin:auto;
  margin-top: 30px;
  border-radius: 10px;
  background-color: rgb(250, 250, 250);
}

.chart-style{
  width: 100%;
  height: 500px;
  margin-top: 100px;
  margin-left: 0;
}
</style>