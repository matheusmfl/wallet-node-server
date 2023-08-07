import Transaction from '../models/Transaction'
import TransactionService from '../services/TransactionService'
import Cart from '../models/carts'
import * as Yup from 'yup'
import parsePhoneNumber from 'libphonenumber-js'
import { cpf, cnpj } from 'cpf-cnpj-validator'

class TransactionsController {
  async create(req, res) {
    try {
      const {
        cartCode,
        paymentType,
        installments,
        customerName,
        customerEmail,
        customerMobile,
        customerDocument,
        billingAddress,
        billingName,
        billingNumber,
        billingNeighborhood,
        billingCity,
        billingState,
        billingZipCode,
        creditCardNumber,
        creditCardExpiration,
        creditCardHolderName,
        creditCardCvv,
      } = req.body


      const schema = Yup.object({
        cartCode: Yup.string().required(),
        paymentType: Yup.mixed().oneOf(["credit_card", "billet"]).required(),
        installments: Yup.number().min(1).when("paymentType", (paymentType, schema) => paymentType === 'credit_card' ? schema.max(12) : schema.max(1)),
        customerName: Yup.string().required().min(3),
        customerEmail: Yup.string().required().email(),
        customerMobile: Yup.string().required().test("is-valid-mobile", "${path} is not a mobile number",
          (value) => parsePhoneNumber(value, "BR").isValid()),
        customerDocument: Yup.string().required().test("is-valid-document", "${path} is not a valid CPF / CNPJ",
          (value) => cpf.isValid(value) || cnpj.isValid(value)),
        billingAddress: Yup.string().required(),
        billingName: Yup.string().required(),
        billingNumber: Yup.string().required(),
        billingNeighborhood: Yup.string().required(),
        billingCity: Yup.string().required(),
        billingState: Yup.string().required(),
        billingZipCode: Yup.string().required(),
        creditCardNumber: Yup.string().when("paymentType", (paymentType, schema) => paymentType === 'credit_card' ? schema.required() : schema),
        creditCardExpiration: Yup.string().when("paymentType", (paymentType, schema) => paymentType === 'credit_card' ? schema.required() : schema),
        creditCardHolderName: Yup.string().when("paymentType", (paymentType, schema) => paymentType === 'credit_card' ? schema.required() : schema),
        creditCardCvv: Yup.string().when("paymentType", (paymentType, schema) => paymentType === 'credit_card' ? schema.required() : schema),
      })

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Erro ao validar as informações da transação' })
      }

      const cart = Cart.findOne({ code: cartCode })
      if (!cart) {
        return res.status(404).json({ error: 'Not Found' })
      }

      const service = new TransactionService()
      const response = await service.process(
        {
          cartCode,
          paymentType,
          installments,
          customer: {
            name: customerName,
            email: customerEmail,
            mobile: customerMobile,
            document: customerDocument,
          },
          billing: {
            address: billingAddress,
            name: billingName,
            number: billingNumber,
            neighborhood: billingNeighborhood,
            city: billingCity,
            state: billingState,
            zipCode: billingZipCode,
          },
          creditCard: {
            number: creditCardNumber,
            expiration: creditCardExpiration,
            holderName: creditCardHolderName,
            cvv: creditCardCvv,
          }
        }
      )

      return res.status(200).json(response)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }

}

export default new TransactionsController()