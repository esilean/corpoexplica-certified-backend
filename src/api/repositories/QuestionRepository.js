require("dotenv").config();
const sequelize = require('sequelize')
const Questions = require('../../database/models/Question')
const Answers = require('../../database/models/Answer')

module.exports = {
    async findAll() {

        const questions = await Questions.findAll({
            attributes: {
                include: [
                    [sequelize.literal(`ifnull((select 0 from \`${process.env.DB}\`.customerStageOnes csq where csq.question_id = question.id limit 1), 1)`), 'canUpdate']
                ]
            },
            include: ['answers'],
            order: [['updated_at', 'desc']]
        })

        return questions
    },

    async findXRandomQuestionWithAnswers(x) {
        const questions = await Questions.findAll({
            include: [{ association: 'answers', required: true }],
            where: { active: true },
            order: sequelize.literal('rand()'),
            limit: x,
        })

        return questions
    },

    async findByPk(question_id) {
        const questionResp = await Questions.findByPk(id = question_id, { include: ['answers'] });

        return questionResp
    },

    async create(transaction, question) {
        const { title, description, value, active, answers } = question

        const questionResp = await Questions.create(
            { title, description, value, active, answers },
            {
                include: ['answers'],
                transaction,
            }
        )
        return questionResp

    },

    async update(transaction, id, question) {

        const { title, description, value, active } = question
        await Questions.update(
            { title, description, value, active },
            {
                where: {
                    id
                },
                transaction
            }
        )

        let questionResp = await Questions.findOne({ where: { id } })

        return questionResp

    },

    async updateAndCreateQuestions(transaction, id, question) {

        const { title, description, value, active, answers } = question

        const answersWithQuestionId = answers.map(ans => {
            return { ...ans, question_id: id }
        })


        //exclui todas as respostas
        const response = await Answers.findAll({ raw: true, attributes: ['id'], where: { question_id: id } })
        const ids = response.map(resp => { return resp.id })

        await Answers.destroy({ where: { id: ids }, transaction, })

        //atualiza a pergunta e insere as respostas
        await Questions.update(
            { title, description, value, active },
            {
                where: {
                    id
                },
                transaction,
            })

        await Answers.bulkCreate(answersWithQuestionId, { transaction })

        let questionResp = await Questions.findByPk(id, { include: ['answers'], transaction })

        return questionResp

    },
    async destroy(id) {

        await Questions.destroy({ where: { id } })
    }

}

