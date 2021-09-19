/**
 * 异步并行执行函数及限制（待优化）
 * 已实现功能:
 * - 可在 cb 函数中动态添加参数
 * - 可在 cb 中提前结束运行
 * 待优化部分:
 * - 逻辑再写得清晰/简洁一点？
 * author     https://t.me/elecV2
 * update     https://github.com/elecV2/elecV2P-dei/blob/master/examples/JSTEST/asyncPool.js
 * @param     {Function}    fn       待执行的异步函数
 * @param     {Array}       params   函数传入参数
 * @param     {Function}    cb       回调函数
 * @param     {Number}      limit    同时并发执行数
 * @return    {Promise}
 */
function promisePool(fn, params, { cb, limit = 6, log = false }) {
  if (typeof(fn) !== 'function') {
    return Promise.reject('a function is expect')
  }
  if (!Array.isArray(params)) {
    return Promise.reject('a array of params is expect')
  }
  let cnlog = (...args)=>{
    if (log) {
      console.log.apply(null, args)
    }
  }
  let cback = async (options = {}) => {
    // callback 可能会加入新的 params
    if (typeof(cb) === 'function') {
      return await cb(options)
    } else {
      cnlog(options)
    }
  }
  let last  = 0, fail = [], cbdone = false
  let orbit = new Map()
  let isCbDone = (flag = false)=>{
    // call force done 只生效一次
    if (flag === 'done') {
      cbdone = true
    }
    return cbdone
  }
  let nTask = async (idx) => {
      let curt = last++, orbitdone = orbit.get(idx) || []
      await cback({ message: `orbit ${idx} start`, orbit: idx, running: curt, done: orbitdone })
      cnlog('orbit', idx, 'start task', curt)
      let res = null, tempdone = false
      try {
        res = await fn(params[curt])
        orbitdone.push(curt)
        orbit.set(idx, orbitdone)
        tempdone = await cback({ message: `task ${curt} finish`, orbit: idx, done: orbitdone, res })
      } catch(err) {
        console.error('task', curt, 'fail, data', params[curt])
        fail.push(curt)
        tempdone = await cback({ message: `task ${curt} fail with data ${params[curt]}`, orbit: idx, fail: err.message || err })
      }
      if (last >= params.length) {
        orbit.delete(idx)
        if (orbit.size === 0) {
          cnlog('all task done')
          await cback({ message: `total tasks ${last}, all finished`, finish: true, done: last, fail })
        }
      } else {
        if (isCbDone(tempdone)) {
          if (tempdone) {
            cnlog('force done by callback, fail', fail, 'current task', curt, 'with param', params[curt])
          }
          throw Error('force done by callback')
        } else {
          await nTask(idx)
        }
      }
    }

  return Promise.all(new Array(Math.min(limit, params.length)).fill(1).map((s, idx)=>nTask(idx)))
}