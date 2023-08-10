import { cpf } from 'cpf-cnpj-validator'
import pagarme from 'pagarme'

class PagarMeProvider {
  async process({
    transactionCode,
    total,
    paymentType,
    installments,
    creditCard,
    customer,
    billing,
    items
  }) {
    const billetParams = {
      payment_method: 'boleto',
      amount: total * 100,
      installments: 1
    }


    const creditCardParams = {
      payment_method: 'credit_card',
      amount: total * 100,
      installments,
      card_number: creditCard.number,
      card_expiration_date: creditCard.expiration,
      card_cvv: creditCard.cvv,
      capture: true
    }



    var paymentParams

    if (paymentType == 'credit_card') {
      paymentParams = creditCardParams
    }
    else if (paymentType == 'billet') {
      paymentParams = billetParams
    }
    else {
      throw `Payment type ${paymentType} not supported`
    }


    const customerParams = {
      customer: {
        external_id: customer.email,
        name: customer.name,
        email: customer.email,
        type: cpf.isValid(customer.document) ? "individual" : 'corporation',
        country: "br",
        phone_numbers: [customer.mobile],
        documents: [
          {
            type: cpf.isValid(customer.document) ? 'cpf' : 'cnpj',
            number: customer.document,

          }
        ]

      }
    }

    const billingParams = billing?.zipCode ? {
      billing: {
        name: "Billing Adress",
        address: {
          country: 'br',
          state: billing.state,
          city: billing.city,
          neighborhood: billing.neighborhood,
          street: billing.address,
          street_number: billing.number,
          zipcode: billing.zipCode
        }
      }
    } : {

    }

    const itemsParams = items && items.length > 0 ? {
      items: items.map((item) => {
        return ({
          id: item?.id.toString(),
          title: item?.title,
          unit_price: item?.amount * 100,
          quantity: item?.quantity || 1,
          tangible: false,
        })
      })
    } : {
      items: [
        {
          id: "1",
          title: `t-${transactionCode}`,
          unit_price: total * 100,
          quantity: 1,
          tangible: false,
        }
      ]
    }

    const metaDataParams = {
      metadata: {
        transaction_code: transactionCode
      }
    }

    const transactionsParams = {
      async: false,
      //postback_url: '',
      ...paymentParams,
      ...customerParams,
      ...billingParams,
      ...itemsParams,
      ...metaDataParams
    }

    const client = await pagarme.client.connect({
      secret_key: 'pk_test_6eAq8PBf5VfZdaJr',

    })

    const response = await client.transactions.create(transactionsParams)

    console.log("response", response)

    return {
      transactionId: response.id,
      status: this.translateStatus(response.status),
      billing: {
        url: response.boleto_url,
        barCode: response.boleto_barCode
      },
      card: {
        id: response.card?.id
      },
      processorResponse: JSON.stringify(response)

    }

  }

  translateStatus(status) {
    const statusMap = {
      processing: "processing",
      waiting_payment: "pending",
      authorized: "pending",
      paid: "approved",
      refused: "refused",
      pending_refunded: "refunded",
      refunded: "refunded",
      chargeBack: "chargeback"
    };

    return statusMap[status]
  }
}

export default PagarMeProvider