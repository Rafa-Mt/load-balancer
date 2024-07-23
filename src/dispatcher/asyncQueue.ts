export default (waitTime : number) => {
	const queue : Array<() => Promise<any>> = []
	return (callback : () => Promise<any>) => {
		queue.push(async () => {
			await callback()
			await new Promise(resolve => setTimeout(resolve, waitTime))
			if (queue.length >= 1) {
				queue.shift()
				if (queue.length) {
					queue[0]()
				}
			}
		})
		
		if (queue.length == 1) {
			queue[0]()
		}
	}
}