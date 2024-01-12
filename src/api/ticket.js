import request from "@/utils/request"


const createTicket = (ticket_type, title, content) => {
    console.log(ticket_type, title, content)
    return request.post("/api/ticket/createTicket", {
        ticket_type: ticket_type,
        title: title,
        content: content,
    })
}

const replyTicket = (ticket_id, content) => {
    return request.post("/api/ticket/replyTicket", {
        ticket_id: ticket_id,
        content, content
    })
}

const closeTicket = (ticket_id) => {
    return request.post("/api/ticket/closeTicket", {
        ticket_id: ticket_id
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