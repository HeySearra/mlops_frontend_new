<template>
  <el-card id="register_card" class="card">
    <div id="form_body">
      <div id = "register_logo">
        <img src="@/assets/pku_logo.jpeg" alt="logo" style="height: 100%; width: 70%; margin-left:15%">
      </div>
      <el-form :model="form" status-icon :rules="rules" ref="form" label-width="0" class="demo-form">
        <el-form-item prop="user">
          <span>用户名:</span>
          <el-input type="text" v-model="form.user" placeholder="请输入用户名" clearable>
            <i slot="prefix" class="el-input__icon iconfont el-icon-user"></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="pass">
          <span>密码:</span>
          <el-input type="password" v-model="form.pass" placeholder="请输入密码" clearable>
            <i slot="prefix" class="el-input__icon iconfont el-icon-lock"></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="checkPass">
          <span>确认密码:</span>
          <el-input type="password" v-model="form.checkPass" placeholder="请再次输入密码">
            <i slot="prefix" class="el-input__icon iconfont el-icon-lock"></i>
          </el-input>
        </el-form-item>
        <el-button type="primary" @click="submitForm('form')" @mousedown.native="changeColor" @mouseup.native="recoverColor" >注册</el-button>
      </el-form>
    </div>
    <div class="msg">
      已有账号？<a @click="$router.push({path: '/login'})">立即登录></a>
    </div>
  </el-card>
</template>

<script>
import QS from "qs";

export default {
  name: 'RegisterBlock',
  data () {
    var validateUser = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('你的用户名呢'))
      } else {
        callback()
      }
    }
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('你的密码呢'))
      } else {
        if (this.form.checkPass !== '') {
          this.$refs.form.validateField('checkPass')
        }
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('再输一次密码呗'))
      } else if (value !== this.form.pass) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      form: {
        user: '',
        pass: '',
        checkPass: ''
      },
      Response: null,
      rules: {
        user: [
          { validator: validateUser, trigger: 'blur' }
        ],
        pass: [
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { validator: validatePass2, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    changeColor(event){
      // console.log("hhh1");
      let element = event.target;
      // console.log(element.tagName);
      if(element.tagName != "BUTTON"){ //点击到了button中的span区域
        element = element.parentNode;
      }
      // console.log(element.tagName);
      element.style.backgroundColor = "#0250c5";
    },
    recoverColor(event){
      // console.log("hhh2");
      let element = event.target;
      // console.log(element.tagName);
      if(element.tagName != "BUTTON"){
        element = element.parentNode;
      }
      // console.log(element.tagName);
      element.style.backgroundColor = "#3F87DA";
      
    },
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // alert('submit!');
          this.signup()
        } else {
          this.$alert('再仔细看一哈', '存在错误', {
            confirmButtonText: '我错了'
          }).then(() => {
            this.$message({
              type: 'info',
              message: '再给你一次机会'
            })
          })
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    signup () {
      const that = this
      this.$http_wang({
              url: "/account/register/",
              method: "post",
              headers: {
                "Content-Type":'application/x-www-form-urlencoded;charset=UTF-8',
              },
              data: QS.stringify(that.form)
          })
          .then(function (response) {
            that.Response = response.data
            that.$notify.success('用户注册成功，快去登录吧！')
            that.$router.replace({ path: '/login' })
          })
          .catch(function (error) {
            console.log(error)
            that.$notify.error({
              title: '服务器失败 :/account/register/ post',
              message: res.response,
              duration: 5000
            });
          })
    }
  }
}
</script>

<style scoped>
#register_logo img{
  height: 100%; 
  width: 70%;
  margin-left:15%;
  margin-top:5%;
}

#register_logo{
  position: absolute;
  width: 100%;
  height: 25%;
}

h2{
  text-align: center;
  margin: 0 auto 10px;
}

h2>figure:hover{
  background-size: 230px;
}
.card{
  position: absolute;
  height: 600px;
  width: 400px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 15px;
}

#register_card >>> .el-card__body{
  height:560px;
}

#form_body{
  height: 500px;
  width:100%;
  position:relative;
}

#form_body >>> .el-form{
  position:absolute;
  bottom: 10px;
  width:80%;
  left:10%;
}

.demo-form{
  width:280px;
  margin:0 auto;
}

.iconfont{
  margin-left:2px;
}

#register_card >>> .el-button{
  width: 100%;
  color: white;
  background-color: #3F87DA;
  /* background-image: linear-gradient(to right, #0250c5, #3F87DA); */
  text-align: center;
  margin: 10px auto;
  margin-top: 22px;
  height: 40px;
  letter-spacing: 3em;
  text-indent: 2em;
}


.msg{
  display: block;
  cursor: pointer;
  text-align: center;
  width:auto;
  font-size: 14px;
  margin: 15px auto 0;
}

.msg a:hover{
  text-decoration: underline;
  color: #3F87DA;
}

</style>
