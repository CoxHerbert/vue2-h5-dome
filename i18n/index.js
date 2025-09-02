import auditResult from "./modules/auditResult";
import registSuccess from "./modules/registSuccess";
import selfLogin from "./modules/selfLogin";



const data = {
    selfLogin,
    registSuccess,
    auditResult
}


/**
 * 多语言获取翻译问题
 * @param {*} mod 
 * @param {*} key 
 * @param {*} lang 
 */
export default function getLangLabel(mod, key, lang){
    const find = data[mod].find(item => item.key === key)?.[lang] || '-'

    return find;
}