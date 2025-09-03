export class TaskPool {
  constructor(max = 5, retry = 0) {
    this.max = max;
    this.retry = retry;
    this.queue = [];
    this.active = 0;
  }
  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject, tries: 0 });
      this._next();
    });
  }
  _next() {
    while (this.active < this.max && this.queue.length) {
      const item = this.queue.shift();
      this.active++;
      const run = async () => {
        try {
          const res = await item.task();
          this.active--;
          item.resolve(res);
          this._next();
        } catch (e) {
          if (item.tries < this.retry) {
            item.tries++;
            setTimeout(run, 2 ** item.tries * 100);
          } else {
            this.active--;
            item.reject(e);
            this._next();
          }
        }
      };
      run();
    }
  }
}
