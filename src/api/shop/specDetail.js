import request from '@/utils/request'


export function get(name) {
  const params = {
    name,
    page: 0,
    size: 9999
  }
  return request({
    url: 'api/specDetail',
    method: 'get',
    params
  })
}

export function getMap(name) {
  const params = {
    name,
    page: 0,
    size: 9999
  }
  return request({
    url: 'api/specDetail/map',
    method: 'get',
    params
  })
}


export function add(data) {
  return request({
    url: 'api/specDetail',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/specDetail',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/specDetail',
    method: 'put',
    data
  })
}

export default { add, edit, del }
