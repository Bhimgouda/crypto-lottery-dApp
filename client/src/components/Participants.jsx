import React from 'react'
import PulseLoader from 'react-spinners/PulseLoader'

function Participants({participants, loading}) {
  return (
    <div className="participants">
        {Array(3).fill().map((item,index)=>(
          <div className='participant' key={index}>
            <p className='participant__number'>Participant {index+1}</p>
            {
            participants[index] ? 
            <div>
              <p className='participant__bet'>Bet Amount - <span style={{"fontSize": "25px"}}>0.1 Ether</span></p>
              <p>address: <span className='participant__address'>{`${participants[index]}`}</span></p>
            </div>
            :
            <p className='participant__not-assigned'>{!participants[index] && "Not Assigned Yet"}</p>
            }
            {participants.length === index ? <PulseLoader loading={loading} color="wheat" /> : null}
          </div>
        ))}
    </div>
  )
}

export default Participants