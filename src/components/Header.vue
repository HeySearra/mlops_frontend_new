<template>
  <div class="header-container">
    <div class="header_nav">
      <div id="left" ref="bar_left">
        <router-link to="/datasets" class="menu-item" >
          <img id = "logo" src="../assets/newLogo-white.png" class="img-fluid" style="padding-left:30px; height:30px" />
        </router-link>
        <router-link to="/datasets" class="menu-item" >
          <div ref="datasets">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-data"></use>
            </svg>
          数据集
          </div>
        </router-link>
      
        <router-link to='/visualize' class="menu-item" >
          <div ref="visualize">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-data1"></use>
            </svg>
            数据探查
          </div>
        </router-link>
        <router-link to='/modelana' class="menu-item" >
          <div ref="modelana">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-data1"></use>
            </svg>
            模型分析
          </div>
        </router-link>

        <el-dropdown class="menu-item" >
          <div id="experiment">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-code"></use>
              </svg>
              实验
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>
              <el-button type = "text" @click="clickSubmitIcon" style = "color: #333333">
                新增实验
              </el-button>
            </el-dropdown-item>
            <el-dropdown-item>
              <router-link :to="{path: '/flow-model'}" style = "color: #333333">
                实验
              </router-link>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <router-link :to="{path: '/flow-experiments'}" class="menu-item" >
          <div id="model"> 
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-model"></use>
            </svg>
            模型
          </div>
        </router-link>
        <!-- <span class="menu-item">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-file"></use>
          </svg>
          文档
        </span>
        <router-link to="/mapping" class="menu-item">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-data"></use>
          </svg>
          映射
        </router-link> -->
      </div>
      <div class="user">
        <li>
          <span class="el-dropdown-link" @click="to_login" v-if="!login_state && !username">
            <span>登录</span>
          </span>
          <span class="el-dropdown-link" @click="logout" v-if="login_state && username">
            <span>{{ username }}</span>
          </span>


        </li>
      </div>
        <!-- <el-dialog title="上传新数据" :visible.sync="uploadDialogVisible" width="60%" :before-close="handleUploadDialogClose"
          :destroy-on-close="true" modal>
          <div class = "upload-frame">
            <el-form ref="form" :model="form" label-width="80px">
              <el-form-item label="活动区域">
                <el-select v-model="form.region" placeholder="请选择活动区域">
                  <el-option label="区域一" value="shanghai"></el-option>
                  <el-option label="区域二" value="beijing"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </div>
        </el-dialog> -->
      </div>
    <el-dialog title="上传新数据" :visible.sync="uploadDialogVisible" width="60%" :before-close="handleUploadDialogClose"
        :destroy-on-close="true" modal>
        <div>
          <el-form ref="form" :model="form" :rules="rules" label-width="10em" class="upload-frame">
            <el-form-item label="选择数据集" prop="dataset">
              <el-select v-model="datasetId" placeholder="请选择数据集">
                <div v-for="(item, index) in resultList " :key="index">
                  <el-option :label="item.name" :value="item.id"></el-option>
                </div>
              </el-select>
            </el-form-item>
            <el-form-item label="选择数据" prop="data" v-if="datasetId">
              <el-select v-model="form.dataId" placeholder="请选择数据" >
                <div v-for="(item, index) in detail.children " :key="index">
                  <el-option :label="item.children_name[0]" :value="item.children_id"></el-option>
                </div>
              </el-select>
            </el-form-item>
            <el-form-item label="文件上传" prop="fileList">
              <el-upload
                class="upload-demo"
                drag
                action="#"
                accept=".py"
                v-model="codeFile"
                :file-list="fileList"
                :before-upload="beforeUpload" 
                :on-remove="handleRemoveFile"
                multiple>
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                <div class="el-upload__tip" slot="tip">只能上传py文件</div>
              </el-upload>
            </el-form-item>
          </el-form>
        </div>
        <div style="text-align:center">
          <el-button size="medium" type="primary" @click="handleUpload">上传</el-button>
        </div>
      </el-dialog>
  </div>
</template>

<script>
import { color } from 'echarts'



export default {
  name: 'Home',
  data() {
    return {
      username: "",
      login_state: false,
      token: "",
      uploadDialogVisible: false,
      form: {
        dataId: '',
        fileList: null,
      },
      datasetId: '',
      codeFile: null,
      fileList: [],
      rules: {
        dataset: [
          { required: true, message: '请输入数据集', trigger: 'blur' },
        ],
        data: [
          { required: true, message: '请选择领域', trigger: 'blur' },
        ],
        fileList: [
          { required: true, message: '请上传文件', trigger: 'blur' }
        ],
      },
      resultList: undefined,
      detail: {
        owner: "匿名用户",
        id_col: 1,
        process_code: "",
        name: "",
        task: "通用",
        area: "",
        children: [],
        father: 0,
        short_description: "暂无简介",
        long_description: "\n",
        sample: {
          head: [],
          sample_data: []
        },
        created: "",
        experiment_times: 0,
        record_count: 0,
      },
    }
  },
  
  created(){
    this.$root.$on('selectFunc', (funId) => {
      console.log("on function" + funId);

      // 在这里调用 header 组件的方法
      // this.headerMethod(/* 可选参数 */);
      this.changeColor(funId);
    });
  },
  mounted() {
    this.get_user()
    if (this.login_manager.get()) {
      this.login_state = true
      this.username = this.login_manager.get_name()
      // this.token = this.login_manager.get_token()
    }
    else {
      var route_name = this.$router.history.current.name;
      if (route_name != 'Login' && route_name != 'Register') {
        this.$router.push({ name: 'Login' });
      }
    }
    var _that = this
    this.$bus.$on("usernameUpdate", (name) => {
      _that.login_state = true
      _that.username = name
    })
    this.$bus.$on("resultListUpdate", (resultList) => {
      _that.resultList = resultList
      
    })
  },

  methods: {
    changeColor(name){
      let curNode = this.$refs[name];
      console.log(curNode);
      let parentNode = curNode.parentElement;
      let bar = this.$refs.bar_left;
      const childElements = bar.children;
      for (const childElement of childElements) {
        childElement.style.backgroundColor = "white";
      }
      // console.log(bar);
      parentNode.style.backgroundColor = "rgb(220,220,220)";
    },
    goto(index) {
      this.$router.push(index)
    },
    to_login() {
      this.$router.push({ path: '/login', query: { from: this.$route.path } });
    },
    logout() {
      var that = this;
      this.$http_wang({
        url: "/account/logout/",
        method: "post",
        headers: {
          "Content-Type": 'application/x-www-form-urlencoded;charset=UTF-8',
        },
      }).then(res => {
        if (res.status == 200) {
          // localStorage.setItem('token', res.data.access)
          that.login_manager.clear()
          that.login_state = false
          that.username = ""
          that.$notify.success({
            title: '成功',
            message: '登出成功'
          })
          that.$router.push('/login');
        }
        else if (res.response.status == 403) {
          that.$notify.error({
            title: '登出失败',
            duration: 5000
          });
        }
        else {
          that.$notify.error({
            title: '服务器失败 :/account/logout/ post',
            message: res.response,
            duration: 5000
          });
        }
      }).catch(err => {
        console.log(err)
        that.$notify.error({
          title: '服务器失败 :/account/logout/ post',
          message: err.response,
          duration: 5000
        });
      })
    },

    get_user(){
      var that = this;
      this.$http_wang({
        url: "/account/get_user/",
        method: "post",
        headers: {
          "Content-Type": 'application/x-www-form-urlencoded;charset=UTF-8',
        },
      }).then(res => {
        if (res.status == 200) {
          that.login_manager.set(true, "", res.data.username, "")
          that.login_state = true
          that.username = res.data.username
        }
        else {
          that.login_manager.clear()
          that.login_state = false
          that.username = ""
        }
      }).catch(err => {
        console.log(err)
        that.$notify.error({
          title: '服务器失败 :/account/get_user/ post',
          message: err.response,
          duration: 5000
        });
      })
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


    beforeUpload(file) {
      const { name, size } = file;
      this.codeFile = file
      const index = name.lastIndexOf('.');
      // 判断文件名是否有后缀，没后缀文件错误
      if (index === -1) {
        this.$notify.error({
          title: '错误',
          message: '文件错误，请重新上传！',
        });
        return false
      }
      if (size > 10 * 1024 * 1024) {
        this.$notify.error({
          title: '错误',
          message: '文件大小超过10M，请重新上传！',
        });
        return false;
      }
      return true;
    },

    handleRemoveFile() {
      this.fileList = null;
      this.codeFile = null;
      this.$refs.datasetInfoRef.validateField('fileList');
    },

    get_datasets(id) {
      var that = this;
      this.$http_wang({
        url: "/predata/" + id + '/',
        method: "get",
      }).then((res) => {
        console.log("DataDetails_wang get_datasets")
        console.log(res)
        if (res.status == 200) {
          let data = res.data
          if (data.father == null) {
            data.children.push({
              'children_id': [data.id],
              'children_name': [data.name],
            })
          }
          else {
            data.children = that.detail.children
          }
          that.detail = data
          // that.parseHistoryRecord()
        } else {
          that.$notify.error({
            title: '服务器失败 :/predata/' + id + ' get',
            message: res.response,
            duration: 5000
          });
        }
      });
    },

    handleUpload() {
      console.log('datasetId,',this.datasetId);
      console.log('dataId,', this.form.dataId);
      console.log('file,',this.codeFile);
    },

    focusColor(event){
      console.log("hhhh");
      let item = event.target;
      console.log(item);
      // item.style.backgroundColor = "#409EFF";
      console.log()
    }
  },

  watch: {
    datasetId: function (newVal, oldVal) {
      this.form.dataId = ''
      this.get_datasets(parseInt(this.datasetId))
    }
  }
}
</script>


<style scoped>
.menu-item {
  text-decoration: inherit;
  cursor: pointer;
}

.el-dropdown-link {
  cursor: pointer;
  /* color: hsl(1, 69%, 78%); */
  display: inline-block;
  width: 50px;
}

.user {
  float: right;
  margin: 10px 35px 10px 20px;
  overflow: hidden;
}

.icon {
  width: 15px;
  height: 15px;
  fill: currentColor;
  margin-bottom: -2px;
}

.header_nav {
  position: fixed;
  z-index: 1500;
  width: 100%;
  height: 60px;
  padding-right: 45px;
  background: rgb(255, 255, 255);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  top: 0;
}

#head-title {
  margin-left: 3vw;
  margin-right: 2vw;
  font-size: 20px;
  font-family: YouYuan;
  font-weight: bold;
  color: #094299;
}

.header_nav>ul {
  margin: 0;
  list-style: none;
  display: flex;
  align-items: center;
}

.header_nav>ul>li * {
  display: inline-block;
  font-size: 1em;
  color: #333333;
  text-decoration: none;
  cursor: pointer;
  padding-right: 20px;
}

#h-home:hover,
.menu-item:hover,
li :hover {
  color: #008fff;
}

.menu-item {
  font-size: 1em;
  color: #333333;
  padding-left: 20px;
  padding-right:20px;
  height:100%;
  display: block;
}

.menu-item > *{
  margin:auto;
  height: 70%;
  margin-top: 15px;
}

.dropdown {
  padding-right: 30px;
}

#left {
  display: inline-flex;
  justify-items: stretch;
  align-items: center;
  height: 100%;
}


/* #upload-frame {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
} */
</style>
