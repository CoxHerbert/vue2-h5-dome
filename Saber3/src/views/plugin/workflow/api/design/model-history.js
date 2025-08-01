import request from '@/axios';

const prefix = '/blade-workflow/design/model/history'

export const getList = (current, size, params) => {
  return request({
    url: `${prefix}/list`,
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getDetail = (params) => {
  return request({
    url: `${prefix}/detail`,
    method: 'get',
    params
  })
}

export const remove = (ids) => {
  return request({
    url: `${prefix}/remove`,
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: `${prefix}/submit`,
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: `${prefix}/submit`,
    method: 'post',
    data: row
  })
}

export const setMainVersion = (row) => {
  return request({
    url: `${prefix}/setMainVersion`,
    method: 'post',
    data: row
  })
}