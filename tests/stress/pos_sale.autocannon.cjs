/* eslint-disable no-console */
const autocannon = require('autocannon')

async function run() {
  const url = process.env.STRESS_BASE_URL || 'http://localhost:4105'
  const companyId = process.env.STRESS_COMPANY_ID
  const branchId = process.env.STRESS_BRANCH_ID
  const warehouseId = process.env.STRESS_WAREHOUSE_ID
  const treasuryId = process.env.STRESS_TREASURY_ID
  const productId = process.env.STRESS_PRODUCT_ID

  for (const [k, v] of Object.entries({ companyId, branchId, warehouseId, treasuryId, productId })) {
    if (!v) {
      throw new Error(`Missing env var for stress: STRESS_${k.toUpperCase()}`)
    }
  }

  const body = JSON.stringify({
    companyId,
    branchId,
    warehouseId,
    treasuryId,
    discountAmount: 0,
    taxAmount: 0,
    totalAmount: 20,
    paymentMethod: 'cash',
    lines: [{ productId, quantity: 1, unitPrice: 20 }],
  })

  const instance = autocannon(
    {
      url: `${url}/v1/finance/pos-sale`,
      method: 'POST',
      connections: Number(process.env.STRESS_CONNECTIONS || 20),
      duration: Number(process.env.STRESS_DURATION_SEC || 10),
      headers: {
        'content-type': 'application/json',
        'x-company-id': companyId,
        'x-user-id': 'stress-user',
      },
      body,
    },
    (err, result) => {
      if (err) throw err
      console.log(autocannon.printResult(result))
      // Basic acceptance: keep error rate low
      if (result.errors > 0) {
        process.exitCode = 1
      }
    },
  )

  autocannon.track(instance, { renderProgressBar: true })
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})

