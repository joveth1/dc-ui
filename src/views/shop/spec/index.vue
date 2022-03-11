<template>
  <div class="app-container">
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择" style="width: 370px;">
            <el-option v-for="item in statusOptions" :key="item.key"  :label="item.name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="最小可选" prop="minSelect">
          <el-input-number v-model.number="form.minSelect" :min="0" :max="99" controls-position="right" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="最大可选" prop="maxSelect">
          <el-input-number v-model.number="form.maxSelect" :min="0" :max="99" controls-position="right" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="排序" prop="sortNum">
          <el-input-number v-model.number="form.sortNum" :min="0" :max="99" controls-position="right" style="width: 370px;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <!-- 字典列表 -->
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="16" :lg="14" :xl="14" style="margin-bottom: 10px">
        <el-card class="box-card">
          <!--工具栏-->
          <div class="head-container">
            <div v-if="crud.props.searchToggle">
              <!-- 搜索 -->
              <el-input v-model="query.blurry" clearable size="small" placeholder="输入名称或者描述搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
              <rrOperation />
            </div>
            <crudOperation :permission="permission" />
          </div>
          <!--表格渲染-->
          <el-table ref="table" v-loading="crud.loading" :data="crud.data" highlight-current-row style="width: 100%;" @selection-change="crud.selectionChangeHandler" @current-change="handleCurrentChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="名称" />
            <el-table-column label="状态" align="center" prop="status">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.status==='normal'" type="success">启用</el-tag>
                <el-tag v-if="scope.row.status==='close'" type="danger">禁用</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="minSelect" label="最少可选" />
            <el-table-column prop="maxSelect" label="最大可选" />
            <el-table-column prop="sortNum" label="排序" />
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
            <el-table-column v-if="checkPer(['admin','spec:edit','spec:del'])" label="操作" width="130px" align="center" fixed="right">
              <template slot-scope="scope">
                <udOperation :data="scope.row" :permission="permission" />
              </template>
            </el-table-column>
          </el-table>
          <!--分页组件-->
          <pagination />
        </el-card>
      </el-col>
      <!-- 字典详情列表 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="10" :xl="10">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>规格内容</span>
            <el-button v-if="checkPer(['admin','spec:add']) && this.$refs.specDetail && this.$refs.specDetail.query.name" class="filter-item" size="mini" style="float: right;padding: 4px 10px" type="primary" icon="el-icon-plus" @click="$refs.specDetail && $refs.specDetail.crud.toAdd()">新增</el-button>
          </div>
          <specDetail ref="specDetail" :permission="permission" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import specDetail from './specDetail'
import crudApi from '@/api/shop/spec'
import CRUD, { presenter, header, form } from '@crud/crud'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'
import rrOperation from '@crud/RR.operation'
import udOperation from '@crud/UD.operation'
import { parseTime } from '@/utils'

const defaultForm = { id: null, name: null, status: 'normal', minSelect: 0, maxSelect: 1, sortNum:1, specDetails: [] }

export default {
  name: 'Spec',
  components: { crudOperation, pagination, rrOperation, udOperation, specDetail },
  cruds() {
    return [
      CRUD({ title: '字典', url: 'api/spec', crudMethod: { ...crudApi } })
    ]
  },
  mixins: [presenter(), header(), form(defaultForm)],
  data() {
    return {
      statusOptions: [
        { key: 'normal', name: '启用' },
        { key: 'close', name: '禁用' }
      ],
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'spec:add'],
        edit: ['admin', 'spec:edit'],
        del: ['admin', 'spec:del']
      }
    }
  },
  methods: {
    // 获取数据前设置好接口地址
    [CRUD.HOOK.beforeRefresh]() {
      if (this.$refs.specDetail) {
        this.$refs.specDetail.query.name = ''
      }
      return true
    },
    // 选中字典后，设置字典详情数据
    handleCurrentChange(val) {
      if (val) {
        this.$refs.specDetail.query.name = val.name
        this.$refs.specDetail.specId = val.id
        this.$refs.specDetail.crud.toQuery()
      }
    },
    // 编辑前将字典明细临时清空，避免日志入库数据过长
    [CRUD.HOOK.beforeToEdit](crud, form) {
      // 将角色的菜单清空，避免日志入库数据过长
      form.specDetail = null
    }
  }
}

</script>
<style scoped>
</style>
