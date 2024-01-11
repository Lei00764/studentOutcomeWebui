import request from "@/utils/request"


const createTicket = () => {
    return request.post("/api/ticket/createTicket", {
        // content: content,
    })
}

const replyTicket = () => {
    return request.post("/api/ticket/replyTicket", {
    })
}

const closeTicket = () => {
    return request.post("/api/ticket/closeTicket", {
    })
}

export default {
    createTicket,
    replyTicket,
    closeTicket
}