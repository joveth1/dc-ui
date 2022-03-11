import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/spec',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/spec',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/spec',
    method: 'put',
    data
  })
}

export function queryAll(){
  return request({
    url: 'api/spec/queryall',
    method: 'post',
  })
}

export default { add, edit, del, queryAll }
