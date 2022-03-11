<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.blurry" clearable size="small" placeholder="名称搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-select v-model="query.status" clearable size="small" placeholder="状态" class="filter-item" style="width: 90px" @change="crud.toQuery">
          <el-option v-for="item in statusOptions" :key="item.key" :label="item.name" :value="item.key" />
        </el-select>
        <date-range-picker v-model="query.createTime" class="date-item" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="50" />
      <el-table-column label="图片" prop="id" align="center" width="80">
        <template slot-scope="{row}">
          <el-image
            v-if="row.picid"
            :src="'/file/'+row.picid"
            :preview-src-list="['/file/'+row.picid]"
            fit="contain"
            style="width: 30px; height: 30px"
            lazy
            class="el-avatar"
          >
            <div slot="error">
              <img :src="defaultImg">
            </div>
          </el-image>
          <div v-else>
            <el-upload
              ref="upload"
              action="/api/food/upload"
              :before-upload="beforeUpload"
              :data="row"
              :show-file-list="false"
              :limit="1"
              :headers ="uploadHeaders"
              :on-success="uploadOk"
              :on-error="uploadFail"
              accept=".jpg,.png"
            >
              <el-button slot="trigger" icon="el-icon-upload" circle />
            </el-upload>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="price" label="价格" />
      <el-table-column prop="typeName" label="类别" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status==='normal'" type="success">在售</el-tag>
          <el-tag v-if="scope.row.status==='close'" type="danger">下架</el-tag>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="description" label="描述" />
      <el-table-column :show-overflow-tooltip="true" prop="createTime" width="135" label="创建日期">
        <template slot-scope="scope">
          {{parseTime(scope.row.createTime)}}
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="updateTime" width="135" label="修改日期">
        <template slot-scope="scope">
          {{parseTime(scope.row.updateTime)}}
        </template>
      </el-table-column>
      <el-table-column v-if="checkPer(['admin','food:edit','food:del'])" label="操作" width="160" align="center" fixed="right">
        <template slot-scope="scope">
          <el-upload
              ref="upload2"
              action="/api/food/upload"
              :before-upload="beforeUpload"
              :data="scope.row"
              :show-file-list="false"
              :limit="1"
              :headers ="uploadHeaders"
              :on-success="uploadOk"
              :on-error="uploadFail"
              accept=".jpg,.png"
              style="display: inline-block;"
            >
              <el-button slot="trigger" icon="el-icon-upload" type="success" size="mini" />
            </el-upload>
          <udOperation :data="scope.row" :permission="permission" style="display: inline-block;" />
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
    <!--表单-->
    <el-drawer ref="drawer" :title="crud.status.title" :visible.sync="crud.status.cu > 0" direction="rtl" size="60%" @close="closeDrawer">
      <div class="demo-drawer__content" style="padding-left:15px;padding-right: 15px;">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="66px">
          <el-row>
            <el-col :span="9">
              <el-form-item label="名称" prop="name">
                <el-input v-model="form.name" @keydown.native="keydown($event)" />
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="价格" prop="price">
                <el-input-number v-model.number="form.price" controls-position="right" :min="0" :max="999" :precision="2" />
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="类别" prop="status">
                <el-select v-model="form.typeId" placeholder="请选择">
                  <el-option v-for="item in types" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="状态" prop="status">
                <el-select v-model="form.status" placeholder="请选择">
                  <el-option v-for="item in statusOptions" :key="item.key" :label="item.name" :value="item.key" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="描述" prop="description" style="width:100%">
            <el-input type="textarea" v-model="form.description" style="width:100%" />
          </el-form-item>
          <el-form-item label="规格" prop="specs" style="width:100%">
            <el-checkbox-group v-model="form.specDetails">
              <template>
                <div v-for="spec in specs">
                  <span style="font-size:14px;margin-right:10px;">{{spec.name}}</span>
                  <el-checkbox v-for="detail in spec.specDetails" :label="detail.id" :key="detail.id">{{detail.name}}</el-checkbox>
                </div>
              </template>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item>
            <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
            <el-button type="text" @click="crud.cancelCU">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import crudApi from '@/api/shop/food'
import specApi from '@/api/shop/spec'
import typeApi from '@/api/shop/type'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import DateRangePicker from '@/components/DateRangePicker'
import pagination from '@crud/Pagination'
import { parseTime } from '@/utils'
import { getToken } from '@/utils/auth'
import defImg from '@/assets/images/logo.png'
// crud交由presenter持有
const defaultForm = { id: null, name: null, price: null, typeId: null, description: null, status: 'normal', specDetails: [] }
export default {
  name: 'Food',
  components: { crudOperation, rrOperation, udOperation, DateRangePicker, pagination },
  cruds() {
    return CRUD({ title: '菜谱', url: 'api/food', crudMethod: { ...crudApi }, query: { status: 'normal' } })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  data() {
    return {
      defaultImg: defImg,
      menus: [],
      permission: {
        add: ['admin', 'food:add'],
        edit: ['admin', 'food:edit'],
        del: ['admin', 'food:del']
      },
      rules: {
        title: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },
      statusOptions: [
        { key: 'normal', name: '在售' },
        { key: 'close', name: '下架' }
      ],
      specs: [],
      types: [],
      uploadHeaders:{
        'Authorization':getToken()
      }
    }
  },
  created() {
    this.initData()
  },
  methods: {
    keydown(e) {
      if (e.keyCode === 32) {
        e.returnValue = false
      }
    },
    closeDrawer() {
      this.crud.cancelCU()
    },
    [CRUD.HOOK.beforeToEdit](crud, form) {
      console.log(form)
      let arr = []
      for (let i = 0; i < form.specDetails.length; i++) {
        arr.push(form.specDetails[i].id)
      }
      form.specDetails = arr
    },
    initData() {
      specApi.queryAll().then(ret => {
        this.specs = ret
      })
      typeApi.queryAll().then(ret => {
        this.types = ret
      })
    },
    beforeUpload(file) {
      let isLt2M = true
      isLt2M = file.size / 1024 / 1024 < 1
      if (!isLt2M) {
        this.crud.notify( '上传文件大小不能超过 1MB', 'error')
      }
      return isLt2M
    },
    uploadOk(response, file, fileList) {
      fileList = []
      this.crud.refresh()
    },
    uploadFail() {
      this.crud.notify( '上传失败，文件大小不得超过1M', 'error')
    },
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
::v-deep .el-input-number .el-input__inner {
  text-align: left;
}

::v-deep .vue-treeselect__control,
::v-deep .vue-treeselect__placeholder,
::v-deep .vue-treeselect__single-value {
  height: 30px;
  line-height: 30px;
}

</style>
