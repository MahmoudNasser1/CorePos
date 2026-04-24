import request from 'supertest'
import { afterAll, describe, expect, it } from 'vitest'

import { createTestApp } from './helpers/nest-app'

describe('Health endpoints', async () => {
  const app = await createTestApp()

  afterAll(async () => {
    await app.close()
  })

  it('GET /v1/health returns ok', async () => {
    const res = await request(app.getHttpServer()).get('/v1/health')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      success: true,
      data: { status: 'ok', service: 'backend' },
    })
    expect(typeof res.body.data.timestamp).toBe('string')
  })

  it('GET /v1/readiness returns ready', async () => {
    const res = await request(app.getHttpServer()).get('/v1/readiness')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true, data: { status: 'ready' } })
  })
})

