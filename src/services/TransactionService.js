import Cart from '../models/carts'
import Transaction from '../models/Transaction'
import { randomUUID } from 'node:crypto'
import PagarMeProvider from '../providers/pagarMeProvider'

class TransactionService {
  paymentProvider

  constructor(paymentProvider) {
    this.paymentProvider = paymentProvider || new PagarMeProvider()
  }

  async process({
    cartCode,
    paymentType,
    installments,
    customer,
    billing,
    creditCard,
  }) {
    const cart = await Cart.findOne({ code: cartCode })

    if (!cart) {
      throw ` Cart ${cartCode} was not found `
    }

    const transaction = await Transaction.create({
      cartCode: cart.code,
      code: randomUUID(),
      total: cart.price,
      paymentType,
      installments,
      status: 'started',
      customerName: customer.name,
      customerEmail: customer.email,
      customerMobile: customer.mobile,
      customerDocument: customer.document,
      billingAddress: billing.address,
      billingNumber: billing.number,
      billingNeighborhood: billing.neighborhood,
      billingCity: billing.city,
      billingState: billing.state,
      billingZipCode: billing.zipCode,
    })

    this.paymentProvider.process({
      transactionCode: transaction.code,
      total: transaction.total,
      paymentType,
      installments,
      billing,
      customer,
      creditCard
    })

    return transaction
  }
}

export default TransactionService