import request from '@/axios';

const prefix = '/blade-workflow/process/draft'

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

export const submit = (row) => {
  return request({
    url: `${prefix}/submit`,
    method: 'post',
    data: row
  })
}