import { cpf } from 'cpf-cnpj-validator'

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



    let payment_params

    switch (paymentType) {
      case "credit_card":
        payment_params = creditCardParams
        break

      case "billet":
        payment_params = billetParams
        break

      default:
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

    const billingParams = billing?.zipcode ? {
      billing: {
        name: "Billing Adress",
        address: {
          country: 'br',
          state: billing.state,
          city: billing.city,
          neighborhood: billing.neighborhood,
          street: billing.street,
          street_number: billing.number,
          zipcode: billing.zipcode
        }
      }
    } : {

    }


  }
}

export default PagarMeProvider