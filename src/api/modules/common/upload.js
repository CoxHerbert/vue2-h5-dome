import request from '@/utils/http';

export default {
  // 文件上传
  postFile(data, params, url) {
    return request({
      url: url || '/blade-resource/oss/endpoint/put-file-attach-path',
      method: 'post',
      data,
      params,
    });
  },
};
