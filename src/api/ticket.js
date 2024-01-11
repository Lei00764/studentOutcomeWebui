import request from "@/utils/request"


const createTicket = () => {
    return request.post("/api/ticket/createTicket", {
        // content: content,
    })
}

const replyTicket = (ticket_id, content) => {
    return request.post("/api/ticket/replyTicket", {
        ticket_id: ticket_id,
        content, content
    })
}

const closeTicket = () => {
    return request.post("/api/ticket/closeTicket", {
    })
}

const getTicketList = () => {
    return request.post("/api/ticket/getTicketList")
}

const getTicketInfo = (ticket_id) => {
    return request.post("/api/ticket/getTicketInfo",
        {
            ticket_id: ticket_id
        })
}

const getTicketContentList = (ticket_id) => {
    return request.post("/api/ticket/getTicketContentList",
        {
            ticket_id: ticket_id
        })
}

export default {
    createTicket,
    replyTicket,
    closeTicket,
    getTicketList,
    getTicketInfo,
    getTicketContentList
}