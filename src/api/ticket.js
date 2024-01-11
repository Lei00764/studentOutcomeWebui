import request from "@/utils/request"

const createTicket = (params) => {
    return request({
        url: '/api/ticket/createTicket',
        method: 'post',
        params
    })
}

const replyTicket = (params) => {
    return request({
        url: '/api/ticket/replyTicket',
        method: 'post',
        params
    })
}

const closeTicket = (params) => {
    return request({
        url: '/api/ticket/closeTicket',
        method: 'post',
        params
    })
}

export default {
    createTicket,
    replyTicket,
    closeTicket
}