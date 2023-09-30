let userInfo = {}
let login = false

const shortcuts = (()=>{
    let times = [
        {name:'昨天', offset1: 1, offset2: 1},
        {name:'过去两天', offset1: 1, offset2: 2},
        {name:'过去一周', offset1: 1, offset2: 7},
        {name:'过去两周', offset1: 1, offset2: 14},
        {name:'过去一个月', offset1: 1, offset2: 30},
        {name:'过去两个月', offset1: 1, offset2: 60}
    ]
    let ans = []
    for(let time of times){
        const end = new Date()
        end.setHours(0,0, 0, 0)
        end.setDate(end.getDate() - time.offset1)
        const start = new Date()
        start.setDate(start.getDate() - time.offset2)
        ans.push({
            text: time.name,
            value: [start, end]
        })
    }
    return ans;
})()

const getYesterday = () => {
    let d = new Date()
    d.setHours(0,0,0,0)
    d.setDate(d.getDate() - 1)
    return d
}

export default {
    userInfo,
    login,
    shortcuts,
    getYesterday
};
