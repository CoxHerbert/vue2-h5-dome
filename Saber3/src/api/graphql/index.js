import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';
import request from '@/axios';

const getToken = () => {
  return request({
    url: '/blade-system/param/detail',
    method: 'get',
    noErrorMsg: true,
    params: {
      id: '1927547841896849409',
    },
  });
};
export const updateSopToken = async () => {
  const res = await getToken();
  const { data, code } = res.data;
  if (code === 200) {
    let token = data.paramValue;
    localStorage.setItem('SOP_API_TOKEN', token);
  }
};
// 创建 Apollo Client 实例
const apolloClient = async () => {
  await updateSopToken();
  return new ApolloClient({
    link: new HttpLink({
      uri: '/graphql/wiki',
      headers: {
        Authorization: localStorage.getItem('SOP_API_TOKEN'),
      },
    }),
    cache: new InMemoryCache(),
  });
};
export default apolloClient;
