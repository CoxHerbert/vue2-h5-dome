// 判断是否全面屏
export function checkModel(isFlag) {
	uni.getSystemInfo({
		success: res => {
			let model = res.model;
			for (var i = 11; i < 30; i++) {
				isFlag = (model.indexOf("iPhone X") > -1 || model.indexOf("iPhone " + i) > -1) ? true : false
			}
		}
	})
	return isFlag
}

// 获取字典文本
export function getDicLabel(id, list, props = { label: 'dictValue', value: 'dictKey' }) {
	if (!list) return {}
	for (let i = 0; i < list.length; i++) {
		const item = list[i]
		if (item[props.value] == id) return item[props.label]
		if (item.children) return getDicLabel(id, item.children, props)
	}
}