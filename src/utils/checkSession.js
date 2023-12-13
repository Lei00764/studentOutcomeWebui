/**
 * 获取当前的审核会话id，如果没有就创建一个
 * @param{boolean} getNewOne 强行获得一个新的审核会话id
 * @return {number}
 */
const getCheckSessionId = (getNewOne=false)=> {
    let checkSessionId = parseInt(sessionStorage.getItem("check_session_id"));
    if(isNaN(checkSessionId) || getNewOne){
        checkSessionId = (new Date()).getTime();
        sessionStorage.setItem("check_session_id", checkSessionId)
        sessionStorage.setItem("check_session_history", '[]')
    }
    return checkSessionId;
}

const getHistoryArray = () => {
    let oldHistory = [];
    try{
        let a = JSON.parse(sessionStorage.getItem("check_session_history"))
        if(Array.isArray(a)){
            oldHistory = a;
        }
    }catch (e){
        sessionStorage.setItem("check_session_history", '[]')
    }
    return oldHistory
}

/**
 *
 * @param{Array} historyArray
 */
const saveHistory = (historyArray) => {
    sessionStorage.setItem("check_session_history", JSON.stringify(historyArray));
}

/**
 * 把teamId保存到审核历史中，上限100条，如果有了就不push
 * @param{int} teamId
 */
const pushCheckHistory = (teamId) =>{
    let oldHistory = getHistoryArray();
    for(let i = 0; i < oldHistory.length; ++i){
        if(oldHistory[i] === teamId){
            return;
        }
    }
    oldHistory.push(teamId);
    if(oldHistory.length > 100)
        oldHistory.splice(0,1);

    saveHistory(oldHistory)
}

/**
 * 根据currentTeamId从审核历史上查找上一个审核历史，到头了返回-1
 * @param{int} currentTeamId
 */
const getPrevious = (currentTeamId) => {
    let oldHistory = getHistoryArray();
    for(let i = 0; i < oldHistory.length; ++i){
        if(oldHistory[i] === currentTeamId){
            if(i === 0)
                return -1;
            else
                return oldHistory[i - 1];
        }
    }
    return -1;
}

/**
 * 根据currentTeamId从审核历史上查找下一个审核历史，到头了返回-1
 * @param{int} currentTeamId
 */
const getNext = (currentTeamId) => {
    let oldHistory = getHistoryArray();
    for(let i = 0; i < oldHistory.length; ++i){
        if(oldHistory[i] === currentTeamId){
            if(i < oldHistory.length - 1)
                return oldHistory[i + 1];
            else
                return -1;
        }
    }
    return -1;
}

export default {
    getCheckSessionId,
    pushCheckHistory,
    getPrevious,
    getNext
}