<template>
  <div>
    <div v-if="query.name === ''">
      <div class="my-code">点击规格查看详情</div>
    </div>
    <div v-else>
      <!--工具栏-->
      <div class="head-container">
        <div v-if="crud.props.searchToggle">
          <!-- 搜索 -->
          <el-input v-model="query.name" clearable size="small" placeholder="输入字典标签查询" style="width: 200px;" class="filter-item" @keyup.enter.native="toQuery" />
          <rrOperation />
        </div>
      </div>
      <!--表单组件-->
      <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="名称" prop="label">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="加价" prop="value">
            <el-input-number v-model.number="form.addPrice" style="width: 370px;" controls-position="right" :min="0" :max="999" :precision="2" />
          </el-form-item>
          <el-form-item label="排序" prop="sortNum">
            <el-input-number v-model.number="form.sortNum" :min="0" :max="999" controls-position="right" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" highlight-current-row style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column label="所属规格">
          {{ query.name }}
        </el-table-column>
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="addPrice" label="加价" />
        <el-table-column prop="sortNum" label="排序" />
        <el-table-column v-if="checkPer(['admin','spec:edit','spec:del'])" label="操作" width="130px" align="center" fixed="right">
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
              :permission="permission"
            />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudApi from '@/api/shop/specDetail'
import CRUD, { presenter, header, form } from '@crud/crud'
import pagination from '@crud/Pagination'
import rrOperation from '@crud/RR.operation'
import udOperation from '@crud/UD.operation'

const defaultForm = { id: null, name: null, addPrice: 0, sortNum: 1 }

export default {
  components: { pagination, rrOperation, udOperation },
  cruds() {
    return [
      CRUD({ title: '字典详情', url: 'api/specDetail', query: { name: '' }, sort: ['sortNum,asc', 'id,desc'],
        crudMethod: { ...crudApi },
        optShow: {
          add: true,
          edit: true,
          del: true,
          reset: false
        },
        queryOnPresenterCreated: false
      })
    ]
  },
  mixins: [
    presenter(),
    header(),
    form(function() {
      return Object.assign({ spec: { id: this.specId }}, defaultForm)
    })],
  data() {
    return {
      specId: null,
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
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
 ::v-deep .el-input-number .el-input__inner {
    text-align: left;
  }
</style>
