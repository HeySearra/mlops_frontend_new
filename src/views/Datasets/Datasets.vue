<template>
  <div class="container">
    <div class="search-box">
      <el-input placeholder="搜索数据集" v-model="input">
        <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
      </el-input>
      <div style="margin-top: 10px;">
        <el-button @click="sortType=1">按时间升序</el-button>
        <el-button @click="sortType=2">按时间降序</el-button>
        <el-button @click="sortType=3">按名称升序</el-button>
        <el-button @click="sortType=4">按名称降序</el-button>
      </div>
    </div>

    <el-button id="upload-button" class="mid-child-container" circle @click="clickSubmitIcon">
      <svg class="icon" id="upload-plus-icon" aria-hidden="true">
        <use xlink:href="#icon-Plus"></use>
      </svg>
    </el-button>

    <el-dialog title="上传新数据" :visible.sync="uploadDialogVisible" width="60%" :before-close="handleUploadDialogClose"
      :destroy-on-close="true" modal>
      <dataUpload></dataUpload>
    </el-dialog>

    <p style="  margin-left: 150px; ">共找到 {{ count }} 条数据集</p>
    <div class="data-result">
      <div v-for="(item, index) in filterResults " :key="index">
        <div style="cursor: pointer" @click="toDataset(item)">
          <div class="title">{{ item.name }}</div>
          <el-tag size="small" type="success">{{ item.task }}</el-tag>
          <el-tag type="warning" size="small">{{ item.area }}</el-tag>
          <div class="info">{{ item.short_description }}</div>
          <div class="num">{{ item.experiment_times }}次实验
            <span style="padding-left:20px"></span>
            <i class="el-icon-time"></i>
            {{ item.created.substr(0, 10) }} by {{ item.owner }}
          </div>
        </div>
        <el-divider></el-divider>
      </div>
      <el-pagination :page-size="10" layout="prev, pager, next, jumper" :total="this.count"
        @current-change="handleCurrentChange">
      </el-pagination>
    </div>

  </div>
</template>

<script>
import dataUpload from "../../components/DataUpload.vue"
export default {

  components: {
    dataUpload
  },

  data() {
    return {
      mode: '预处理',
      input: '',
      search_word: '',
      count: undefined,
      resultList: undefined,
      // [{
      //   "id": 28,
      //   "name": "0818test北医三院动态数据",
      //   "short_description": "0818test北医三院动态数据",
      //   "created": "2023-08-18T18:35:50.786218",
      //   "owner": "admin",
      //   "experiment_times": 1,
      //   "task": "0818test北医三院动态数据",
      //   "area": "医疗"
      // },],
      sortType: 2,
      uploadDialogVisible: false
    }
  },

  created() {
  },


  mounted() {
    if (!this.login_manager.get()) {
      this.$notify.warning({
        title: '未登录，请先登录账号',
        duration: 5000
      });
      this.$router.push({ name: 'Login' });
      return;
    }
    this.get_datasets_list()
  },

  computed: {
    filterResults () {
        const {sortType, resultList} = this
        if(resultList == undefined){
          return resultList
        }
        // 过滤
        // const arr = resultList.filter(p => p.name.indexOf(searchName)>=0)
 
        resultList.sort((p1, p2) => {
          if (sortType===1) { // 升序
            return p1.created.localeCompare(p2.created)
          } else if (sortType == 2) { // 降序
            return p2.created.localeCompare(p1.created)
          } else if (sortType == 3) {
            return p1.name.localeCompare(p2.name)
          } else{
            return p2.name.localeCompare(p1.name)
          }
        })
        return resultList
      }
    },

  methods: {
    search() {
      this.search_word = this.input.trim()
      this.get_datasets_list()
    },

    get_datasets_list(page = 1) {
      if (this.mode == '其他') {
        this.$http({
          url: "/datasets/",
          method: "get",
          params: {
            page: page,
            // area: this.clusterFields.checkList,
            // task: this.clusterTasks.checkList,
            name: this.search_word
          }
        }).then((res) => {
          let data = res.data
          this.count = data.count
          this.resultList = data.results
        })
      } else if (this.mode == '预处理') {
        this.$http_wang({
          url: "/predata/",
          method: "get",
          params: {
            page: page,
            // area: this.clusterFields.checkList,
            name: this.search_word
          }
        }).then((res) => {
          if (res.status == 200) {
            let data = res.data
            this.count = data.count
            this.resultList = data.results
          }
          else {
            this.$notify.error({
              title: '服务器失败 :/predata/ get',
              message: res.response,
              duration: 5000
            });
          }
        })
      }
    },


    toDataset(arg) {
      if (this.mode == '其他') {
        this.$router.push({
          name: "DataDetails",
          params: {
            id: arg.id,
          },
        });
      } else if (this.mode == '预处理') {
        this.$router.push({
          name: "DataDetails",
          params: {
            id: arg.id
          }
        })
      }
    },

    clickSubmitIcon(e) {
      e.stopPropagation();
      this.uploadDialogVisible = true
    },

    handleUploadDialogClose(done) {
      //TODO:空表直接退出
      this.$confirm('确认关闭？已填写的数据将会清空。')
        // eslint-disable-next-line no-unused-vars
        .then(_ => {
          done();
        })
        .catch(_ => { });
    },

    // handleSizeChange(val) {
    // 	this.query.pageSize = val
    // 	this.getCateList() // 重新请求数据
    // },
    handleCurrentChange(val) {
      // this.query.currentPage = val
      this.get_datasets_list(val)
    }
  },

  watch: {
    resultList: function (newVal, oldVal) {
      this.$bus.$emit("resultListUpdate", this.resultList)
    }
  }

}
</script>

<style  scoped>
.container {
  padding: 40px 180px;
}

.search-box {
  width: 500px;
  margin-left: 150px;
  margin-bottom: 40px;
}

.data-result {
  margin-left: 150px;
  margin-right: 80px;
}

.title {
  cursor: pointer;
  font-size: 24px;
  font-family: SimHei-Normal;
  font-weight: normal;
  text-align: LEFT;
  color: #5194e9;
  line-height: 30px;
}

.info {
  margin-top: 9px;
  line-height: 24px;
  font-size: 15px;
  color: #555;
  letter-spacing: 0.5px;
  font-family: Arial, "Microsoft yehei";
  text-justify: inter-word;
  text-align: justify;
}

.num {
  font-weight: bold;
  margin-top: 9px;
  line-height: 18px;
  font-size: 14px;
  color: #777;
}

.limit {
  float: left;
  width: 300px;
  margin-bottom: 50px;
}

.el-card {
  border: 1px solid #e0e0e0;
}

.filter {
  width: 400px;
}

.el-radio {
  margin-bottom: 8px;
  margin-right: 0px;
}

.el-tag {
  margin-right: 10px;
  margin-top: 8px;
}

.limit>>>.el-card__body {
  padding: 5px;
}

#upload-button {
  position: fixed;
  top: 85vh;
  left: 90vw;
  width: 50px;
  height: 50px;
  z-index: 1;
  background: white;
  box-shadow: 0px 0px 1px 1px grey;
  display: flex;
  justify-content: center;
  align-items: center;
}



#upload-plus-icon {
  width: 100%;
  height: 100%;
  color: #e0e0e0;
}
</style>
