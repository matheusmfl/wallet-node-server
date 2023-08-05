import Transaction from '../models/Transaction'
import * as Yup from 'yup'

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
        cartCode: Yup.string().required()
      })

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Erro ao validar as informações da transação' })
      }

      return res.status(200).json()
    } catch (error) {
      console.error(err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }

}

export default new TransactionsController()