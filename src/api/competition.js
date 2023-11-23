import request from "@/utils/request"

const editApi = {
    getTeamInfo: (teamId) => {
        return request.post("/api/Competition/getTeamInfo",{team_id: teamId})
    },
    queryCompetition: (keyword) => {
        return request.post("/api/Competition/queryCompetition", {keyword: keyword})
    },
    queryTerm: (competitionId) => {
        return request.post("/api/Competition/queryTerm", {competition_id: competitionId})
    },
    queryPrizeOfTerm: (termId) => {
        return request.post("/api/Competition/termPrize", {term_id: termId})
    },
    createNewTeam: (competitionId, termId, prizeId, awardDate, desc) => {
        return request.post("/api/Competition/newTeam", {
            competition_id: competitionId,
            term_id: termId,
            prize_id: prizeId,
            award_date: awardDate,
            desc: desc
        })
    },
    /**
     * @param teamId: 竞赛信息id
     * @param basicInfo: 修改后的参赛信息的基本信息，如果没修改设置为null
     * @param teammates: 修改后的队员贡献排序，如果没修改设置为null
     */
    editTeam: (teamId, basicInfo, teammates) => {
        return request.post("/api/Competition/editTeam",{
            team_id: teamId,
            info: basicInfo,
            teammates: teammates
        })
    },
    clearCertImage: (teamId) => {
        return request.post("/api/Competition/imgClear", {team_id: teamId})
    },
    uploadImage: (teamId, imgBlob) => {
        return request.post("/api/Competition/imgUpload", {
            team_id: teamId,
            image: imgBlob
        }, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },
    createInvitationCode: (teamId) => {
        return request.post("/api/Competition/createInvitationCode",{
            team_id: teamId,
        })
    },
    submitToReview: (teamId) => {
        return request.post("/api/Competition/submitToReview",{
            team_id: teamId,
        })
    },

    /**
     * @param teamId: 竞赛信息id
     * @param {boolean} isVerified: 是否确认排名
     */
    setRandVerification: (teamId, isVerified) => {
        return request.post("/api/Competition/setVerification",{
            team_id: teamId,
            verified: isVerified ? 1 : 0
        })
    }

}

const viewApi = {
    /**
     *
     * @param field 字段名
     * @param keyword 关键字
     * @param {boolean} precise 是否精确查找
     * @param {number} pageNo 页码，一页20个？
     * @return {Promise}
     */
    getTeamPageWithKeyword: (field, keyword, precise, pageNo) => {
        return request.post("/api/Competition/getTeam",{
            field: field,
            keyword: keyword,
            precise: precise,
            page: pageNo
        })
    },
    useInvitationCode: (invitationCode) => {
        return request.post("/api/Competition/invitationCode",{
            invitation_code: invitationCode
        })
    },
    leaveTeam: (teamId) => {
        return request.post("/api/Competition/leaveTeam",{
            team_id: teamId,
        })
    },
    withdrawSubmittedTeam: (teamId) => {
        return request.post("/api/Competition/withdrawTeam",{
            team_id: teamId,
        })
    }
}

export default {
    editApi,
    viewApi
}