import scheduler from 'node-schedule'
import handle from './handle'
import Event from '../events/collection'
import log from '../../lib/log'
import utils from '../../lib/utils'

const isPlainObject = utils.isPlainObject
let scheduledEvents = {}

const start = function* () {
  try {
    let res = yield Event.findAll()
    if (!res || res.length === 0) return
    if (isPlainObject(res)) {
      return create(res)
    }
    res.map(create)
  } catch(err) {
    log.error('scheduler failed to start', err)
  }
}

const cancel = _id => {
  try {
    let job = scheduledEvents[_id]
    if (!job) return
    job.cancel()
    delete scheduledEvents[_id]
    return {ok: 1}
  } catch(err) {
    throw err
  }
}

const create = event => {
  try {
    const cron = event.cron ? event.cron : new Date(event.when)
    const fn = handle.bind(null, event)
    const job = scheduler.scheduleJob(cron, fn)
    scheduledEvents[event._id] = job
    log.info('succesfully scheduled job', event)
    return {ok: 1}
  } catch(err) {
    throw err
  }
}

const update = (_id, event) => {
  event._id = _id
  cancel(_id)
  return create(event)
}

const getScheduledEvents = () => scheduledEvents

export default {
  start,
  create,
  update,
  cancel,
  getScheduledEvents
}
