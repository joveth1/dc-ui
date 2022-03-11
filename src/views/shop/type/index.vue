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
      <el-table-column prop="name" label="名称" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status==='normal'" type="success">启用</el-tag>
          <el-tag v-if="scope.row.status==='close'" type="danger">禁用</el-tag>
        </template>
      </el-table-column>
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
      <el-table-column v-if="checkPer(['admin','type:edit','type:del'])" label="操作" width="115" align="center" fixed="right">
        <template slot-scope="scope">
          <udOperation :data="scope.row" :permission="permission" />
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
    <!--表单-->
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
        <el-form-item label="排序" prop="sortNum">
          <el-input-number v-model.number="form.sortNum" :min="0" :max="99" controls-position="right" style="width: 370px;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import crudApi from '@/api/shop/type'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import DateRangePicker from '@/components/DateRangePicker'
import pagination from '@crud/Pagination'
import { parseTime } from '@/utils'
// crud交由presenter持有
const defaultForm = { id: null, name: null,  status: 'normal', sortNum: 1 }
export default {
  name: 'Food',
  components: { crudOperation, rrOperation, udOperation, DateRangePicker, pagination },
  cruds() {
    return CRUD({ title: '类别', url: 'api/type', crudMethod: { ...crudApi }, query: { status: 'normal' } })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  data() {
    return {
      menus: [],
      permission: {
        add: ['admin', 'type:add'],
        edit: ['admin', 'type:edit'],
        del: ['admin', 'type:del']
      },
      rules: {
        title: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },
      statusOptions: [
        { key: 'normal', name: '启用' },
        { key: 'close', name: '禁用' }
      ],
      specs: []
    }
  },
  created() {
    this.initSpecData()
  },
  methods: {
    keydown(e) {
      if (e.keyCode === 32) {
        e.returnValue = false
      }
    }
  }
}

</script>
