const express = require("express")
const connection = require("./config")
const moment = require("moment")
const router = express.Router()


router.post("/getReservation", (req,res) => {
    const client_id = req.body.client_id
    const time = req.body.time // aujourd'hui or demain
    const agence = req.body.agence_id
    //1: generate a code, its gonna be a number
    // lets check if the table reservation has a reservation,
    const CheckCountResearvationQuery = "SELECT count(*) AS nbReservations FROM reservations"
    let codeNumber = 0
    connection.query(CheckCountResearvationQuery, (err, result) => {
        if(err) {
            return res.json(502, {
                "message": "There is an internal error"
            })
        }

        // the table is empty
        if(result[0].nbReservations == 0) {
            codeNumber = 1

            const insertQuery = "INSERT INTO reservations (codeReservation,dateReservation,client_id,heurs,time,agence_id,estimation) VALUES ?"
            const values = []

            if(time == "aujourd'hui") {
                const nowDate = moment().format("YYYY-MM-DD").toString()
                const nowHours = moment().format("HH:mm").toString()
                values.push([codeNumber,nowDate,client_id,nowHours,time,agence,0])
            }else if(time == "demain") {
                const dateTomorrow = moment(new Date()).add(1,'days').format("YYYY-MM-DD HH:mm").toString()
                const hourTomorrow = moment().format("HH:mm").toString()
                values.push([codeNumber,dateTomorrow,client_id,hourTomorrow, time,agence])
            }

            connection.query(insertQuery, [values], (err, result) =>{
                if(err){
                    return res.json(501, err)
                }

                return res.json(200, result)
            })
        }else {
            // select agences
            const querySelectAgences = "SELECT * FROM reservations WHERE agence_id=?"
            const values = [
                [agence]
            ]

            connection.query(querySelectAgences, [values], (err,result) => {
                if(err) {
                    return res.json(501, err)
                }

                if(result.length == 0) {
                    const insertQuery = "INSERT INTO reservations (codeReservation,dateReservation,client_id,heurs,time,agence_id,estimation) VALUES ?"
                    const values = [
                        [1,
                        moment().format("YYYY-MM-DD").toString(),
                        client_id,
                        moment().format("HH:mm").toString(),
                        time,
                        agence,
                        0]
                    ]

                    connection.query(insertQuery, [values], (err2,result2) => {
                        if(err2) {
                            return res.json(501, err2)
                        }

                        return result2
                    })
        
                }else {
                    const querySelectTime = "SELECT * FROM reservations WHERE time=? and agence_id=? order by id desc"
                    const values = [
                        time,agence
                        
                    ]

                    

                    connection.query(querySelectTime, values, (err3,result3) => {
                        if(err3) {
                            return res.json(501, err3)
                        }

                        if(result3.length == 0) {
                            const insertQuery = "INSERT INTO reservations (codeReservation,dateReservation,client_id,heurs,time,agence_id,estimation) VALUES ?"
                            const values = [
                                [1,
                                moment().format("YYYY-MM-DD").toString(),
                                client_id,
                                moment().format("HH:mm").toString(),
                                time,
                                agence,0]
                            ]

                            connection.query(insertQuery, [values], (err4,result4) => {
                                if(err4) {
                                    return res.json(501, err4)
                                }

                                return res.json(result4)
                            })

                        }else {
                            // const insertQuery = "INSERT INTO reservations (codeReservation,dateReservation,client_id,heurs,time,agence_id) VALUES ?"
                            // const values = [
                            //     [parseInt(result3[0].codeReservation)+1,
                            //     moment().format("YYYY-MM-DD").toString(),
                            //     client_id,
                            //     moment().format("HH:mm").toString(),
                            //     time,
                            //     agence]
                            // ]
                                // bech tekhou champs heure +estiimation
                                // result  = heur + estimation
                                // compari f reservation jdida bin heur mtaa jdid et result
                                // if heure mtaa reservation jdida > m heur mtaa result
                                // estimation = 0 min
                                // else estimation = result +5 

                                //1 : get the last hour reservation
                                const querySelectLast = "SELECT * FROM reservations WHERE time=? and agence_id=? order by id desc Limit 1"
                                const valuesLast = [
                                    time,agence
                                ]

                                connection.query(querySelectLast, valuesLast, (err7,result7) => {
                                    if(err7) {
                                        return res.json(501, err7)
                                    }



                                    // get result of query
                                    let record = result7[0]
                                    
                                    let TotalEstimation = moment(record.heurs, "HH:mm").add(5,"minutes").format("HH:mm").toString()                                    
                                    let currentTime = moment().format("HH:mm").toString()

                                    momentTime = moment(currentTime,"HH:mm")
                                    momentEstimation = moment(TotalEstimation,"HH:mm")

                                    const insertQuery8 = "INSERT INTO reservations (codeReservation,dateReservation,client_id,heurs,time,agence_id,estimation) VALUES ?"
                                    let values = []
                                    if(momentTime.isAfter(momentEstimation)) {
                                        values.push([
                                            parseInt(result7[0].codeReservation)+1,
                                            moment().format("YYYY-MM-DD").toString(),
                                            client_id,
                                            moment().format("HH:mm").toString(),
                                            time,
                                            agence, 0
                                        ])
                                    
                                    }else {
                                        var finalEstimation = moment(TotalEstimation, "HH:mm").add(record.estimation, "minutes").format("HH:mm").toString()
                                        var final = moment(finalEstimation,"HH:mm")

                                        //console.log(moment.duration(totaleMT.diff(momentTime)).asMinutes() )
                                        values.push(
                                            [parseInt(result7[0].codeReservation)+1,
                                                moment().format("YYYY-MM-DD").toString(),
                                                client_id,
                                                moment().format("HH:mm").toString(),
                                                time,
                                                agence, 
                                                moment.duration(final.diff(momentTime)).asMinutes() 
                                            ])
                                        //console.log(false)
                                    }


                                    connection.query(insertQuery8, [values], (err9, result9) => {
                                        if(err9) {
                                            return res.json(err9)
                                        }

                                        return res.json(201, {
                                            "estimation": moment.duration(final.diff(momentTime)).asMinutes()
                                        })
                                    })
                                })


                            
                        }
                    })
                }
            })
        }

    })

    
})

module.exports = router
