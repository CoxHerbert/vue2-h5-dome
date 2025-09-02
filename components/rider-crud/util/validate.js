export default (form, rules) => {
	return new Promise((resolve, reject) => {
		if (form && rules) {
			let pass = true
			a: for (let key in rules) {
				let rule = rules[key]
				if (Array.isArray(rule)) {
					for (let i = 0; i < rule.length; i++) {
						const result = validate(rule[i], form[key])
						if (!result) {
							pass = false
							break a
						}
					}
				} else {
					const result = validate(rule, form[key])
					if (!result) {
						pass = false
						break a
					}
				}
			}
			if (pass) resolve()
			else reject()
		} else {
			reject('需校验的对象为空')
		}
	})
}

const validate = (rule, value) => {
	let pass = true
	if (rule && rule.pattern && !rule.pattern.test(value)) {
		uni.showToast({
			title: rule.message || '校验失败',
			icon: 'none'
		})
		pass = false
	} else if (rule && rule.required && !value) {
		uni.showToast({
			title: rule.message || '校验失败',
			icon: 'none'
		})
		pass = false
	}
	return pass
}
