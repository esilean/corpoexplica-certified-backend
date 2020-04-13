
const QuestionService = require('../services/QuestionService')

module.exports = {
    async index(request, response) {
        const { id } = request.params

        if (id) {
            let question = await QuestionService.findByQuestionId(id)
            if (question === null)
                return response.status(400).send()

            return response.json(question)
        } else {
            const questions = await QuestionService.findAll()
            return response.json(questions)
        }

    },

    async store(request, response) {

        const question = await QuestionService.create(request.body)

        return response.json(question)
    },

    async update(request, response) {
        const { id } = request.params

        const question = await QuestionService.update(id, request.body)

        return response.json(question)

    },
    async destroy(request, response) {
        const { id } = request.params

        const resp = await QuestionService.destroy(id)

        return response.status(200).json(resp)
    },
}