const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.urlencoded({extended:false}))
app.use(express.json())

app.post("/split-payments/compute/",(req,res)=>{
    const id = req.body.ID
    let amount = req.body.Amount
    const currency  = req.body.Currency
    const customerEmail = req.body.CustomerEmail
    const splitInfo = req.body.SplitInfo
    const splitBreakdown = []
    let initialRatio = null
    
    let ratioList = splitInfo.filter((a)=>(a.SplitType=="RATIO"))
    let percentageList = splitInfo.filter((a)=>(a.SplitType=="PERCENTAGE"))
    let flatList = splitInfo.filter((a)=>(a.SplitType=="FLAT"))
    let ratios = 0
    if(ratioList.length > 0){
        ratios = splitInfo.filter((a)=>(a.SplitType=="RATIO")).reduce((a,b)=>(a.SplitValue + b.SplitValue)) 
    } 

    for(let x of flatList){
        let {SplitValue, SplitEntityId } = x
            amount = amount - SplitValue
            splitBreakdown.push({
                SplitEntityId,
                Amount: SplitValue
            })
    }
    for(let x of percentageList){
        let { SplitValue, SplitEntityId } = x
           let perc = (SplitValue/100) * amount
            amount = amount - perc
            splitBreakdown.push({
                SplitEntityId,
                Amount: perc
            })
        
    }
    for(let x of ratioList){
        let {SplitValue, SplitEntityId } = x
            if(!initialRatio)
                initialRatio = amount
           let ratio = (SplitValue/ratios) * initialRatio
            amount = amount - ratio
            splitBreakdown.push({
                SplitEntityId,
                Amount: ratio
            })
    }
    
    const balance = amount >= 0? amount: 0
    res.json({
        ID: id,
        Balance: balance,
        SplitBreakdown: splitBreakdown
    })
})

app.listen(process.env.PORT||3000)