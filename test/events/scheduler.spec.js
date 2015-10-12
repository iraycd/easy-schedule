import scheduler from 'node-schedule'
import Scheduler from '../../api/events/scheduler'
import Event from '../../api/events/collection'

describe('Events:SchedulerSpec', () => {

  let scheduleJobSpy
    , event

  beforeEach(() => {
    event = {_id: 'foo', cron: '* * * * *'}
    scheduleJobSpy = sinon.spy(scheduler, 'scheduleJob')
  })

  afterEach(() => {
    scheduleJobSpy.restore()
  })

  describe('.start', () => {

    let findAllStub

    beforeEach(function* () {
      findAllStub = sinon.stub(Event, 'findAll', () => [
        {_id: 'foo'},
        {_id: 'bar'}
      ])
      yield Scheduler.start()
    })

    afterEach(() => {
      findAllStub.restore()
    })

    it('should find all events stored on db', () => {
      expect(findAllStub).to.have.been.called
    })

    it('should schedule events', () => {
      expect(scheduleJobSpy).to.have.been.calledTwice
    })

    it('should have scheduled two running jobs', () => {
      expect(Scheduler.runningJobs).to.contain.any.keys('foo', 'bar')
    })
  })

  describe('.create', () => {

    beforeEach(function* () {
      yield Scheduler.create(event)
    })

    it('should have scheduled running jobs', () => {
      expect(Scheduler.runningJobs).to.contain.any.keys('foo')
    })

    it('should schedule new event', () => {
      expect(scheduleJobSpy).to.have.been.calledWith(event.cron)
    })
  })

  describe('.update', () => {

    beforeEach(function* () {
      yield Scheduler.create(event)
    })

    it('should update scheduled event', function* () {
      event.cron = '1 * * * *'
      yield Scheduler.update(event._id, event)
      expect(scheduleJobSpy).to.have.been.calledWith(event.cron)
    })
  })

  describe('.cancel', () => {

    beforeEach(function* () {
      yield Scheduler.create(event)
    })

    it('should cancel a scheduled job', function* () {
      let res = yield Scheduler.cancel(event._id)
      expect(res.ok).to.eql(1)
      expect(Scheduler.runningJobs[event._id]).to.not.exist
    })
  })

  // describe.skip('._onEvent', () => {
  //
  //   let httpMock
  //     , nock = require('nock')
  //
  //   before(() => {
  //     httpMock = nock(message.body.url)
  //       .get('/')
  //       .reply(200)
  //   })
  //
  //   after(nock.cleanAll)
  //
  //   afterEach(() => {
  //     httpMock.done()
  //   })
  //
  //   it('should send http request', done => {
  //     let sch = scheduler(redis)
  //     sch._onEvent(message.body)
  //     setTimeout(done, 100)
  //   })
  // })
  //
})
